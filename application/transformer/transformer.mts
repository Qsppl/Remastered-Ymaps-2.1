import { parse } from '@babel/parser'
import { default as traverse } from '@babel/traverse'
import generate from '@babel/generator'
import * as t from '@babel/types'
import fs from 'fs'
import { createImportStatement } from './utils/module-utils.mjs'
import { findYandexModules, transformModuleDefinition } from './utils/ast-utils.mjs'

export async function transformFile(filePath) {
    const code = fs.readFileSync(filePath, 'utf8')
    return transformCode(code)
}

function transformDefineClassToES6(path, className, superClass, methods) {
    // Create class body from methods object
    const classBody = []
    if (methods && t.isObjectExpression(methods)) {
        for (const prop of methods.properties) {
            if (t.isObjectProperty(prop)) {
                // Transform each method to use super instead of CustomControl.superclass
                const methodBody = t.cloneNode(prop.value.body)
                traverse.default(methodBody, {
                    MemberExpression(path) {
                        if (path.node.object.name === 'CustomControl' &&
                            path.node.property.name === 'superclass') {
                            path.replaceWith(t.super())
                        }
                    }
                })

                classBody.push(t.classMethod(
                    'method',
                    prop.key,
                    prop.value.params,
                    methodBody
                ))
            }
        }
    }

    // Create the constructor method
    classBody.unshift(t.classMethod(
        'constructor',
        t.identifier('constructor'),
        [t.identifier('options')],
        t.blockStatement([
            t.expressionStatement(
                t.callExpression(
                    t.super(),
                    [t.identifier('options')]
                )
            )
        ])
    ))

    // Create the class declaration
    return t.classDeclaration(
        t.identifier(className),
        t.identifier(superClass),
        t.classBody(classBody)
    )
}

export function transformCode(code) {
    // Parse the code into an AST
    const ast = parse(code, {
        sourceType: 'module',
        plugins: ['jsx']
    })

    // Keep track of imports and exports
    const imports = new Set()
    const exports = new Set()

    // Transform the AST
    traverse.default(ast, {
        CallExpression(path) {
            // Debug logging
            console.log('Found CallExpression:', path.node.callee.type)

            // Check for ymaps.modules.define pattern
            if (t.isMemberExpression(path.node.callee) &&
                t.isMemberExpression(path.node.callee.object) &&
                path.node.callee.object.object?.name === 'ymaps' &&
                path.node.callee.object.property?.name === 'modules' &&
                path.node.callee.property?.name === 'define') {

                console.log('Found Yandex module definition')

                const moduleInfo = findYandexModules(path)
                if (moduleInfo) {
                    console.log('Module info:', {
                        name: moduleInfo.moduleName,
                        deps: moduleInfo.dependencies
                    })

                    const { imports: moduleImports, exports: moduleExports } =
                        transformModuleDefinition(moduleInfo)

                    moduleImports.forEach(imp => imports.add(imp))
                    moduleExports.forEach(exp => exports.add(exp))

                    // Extract the implementation function
                    let implementation = moduleInfo.implementation
                    if (t.isFunctionExpression(implementation)) {
                        // Get the function body
                        const bodyStatements = implementation.body.body

                        // Remove the provide call (last statement)
                        bodyStatements.pop()

                        // Find the defineClass call
                        const defineClassCall = bodyStatements.find(stmt =>
                            t.isExpressionStatement(stmt) &&
                            t.isCallExpression(stmt.expression) &&
                            t.isMemberExpression(stmt.expression.callee) &&
                            t.isMemberExpression(stmt.expression.callee.object) &&
                            stmt.expression.callee.object.object?.name === 'ymaps' &&
                            stmt.expression.callee.object.property?.name === 'util' &&
                            stmt.expression.callee.property?.name === 'defineClass')

                        if (defineClassCall) {
                            const [className, superClass, methods] = defineClassCall.expression.arguments

                            // Transform to ES6 class
                            const classDeclaration = transformDefineClassToES6(
                                path,
                                moduleInfo.moduleName,
                                superClass.name,
                                methods
                            )

                            // Replace the entire module definition with the class declaration and export
                            path.replaceWithMultiple([
                                ...bodyStatements.filter(stmt => stmt !== defineClassCall),
                                classDeclaration,
                                t.exportDefaultDeclaration(t.identifier(moduleInfo.moduleName))
                            ])
                        }
                    }
                }
            }
        },

        // Remove IIFE wrapper if present
        FunctionExpression(path) {
            const parent = path.parent
            if (t.isCallExpression(parent) &&
                t.isFunctionExpression(parent.callee) &&
                parent.arguments.length === 0) {

                console.log('Found IIFE wrapper, removing...')
                path.replaceWith(path.node.body.body[0])
            }
        }
    })

    // Add imports at the top of the file
    ast.program.body.unshift(...Array.from(imports).map(imp =>
        createImportStatement(imp)
    ))

    // Generate the transformed code
    const output = generate.default(ast, {
        retainLines: true,
        compact: false
    })

    return output.code
}