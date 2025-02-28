import { parse, type ParseResult } from "@babel/parser"
import { callExpression, expressionStatement, functionDeclaration, identifier, importDeclaration, importSpecifier, program, stringLiteral, type FunctionExpression, type Import, type Program, type Statement } from "@babel/types"
import { isYandexModulesInjector } from "./yandex-modules-injector/is-yandex-modules-injector.helper.js"
import { isYandexModuleInjection } from "./yandex-module-injection/helpers/is-yandex-module-injection.helper.js"
import { isYmapsInitializator } from "#root/shared/is-ymaps-initializator.helper.js"
import type { IIIFEStatement } from "#root/shared/is-iife.helper.js"
import type { IYandexModulesInjectorStatement } from "./yandex-modules-injector/yandex-modules-injector.statement.js"
import { isYandexModuleDefinition } from "./yandex-module-definition/helpers/is-yandex-module-definition-statement.helper.js"
import { readYandexModuleDefinition } from "./yandex-module-definition/helpers/read-yandex-module-definition.helper.js"
import TraverseModule from "@babel/traverse"
const traverse = TraverseModule.default
import GeneratorModule from "@babel/generator"
import type { IYandexModuleDefinitionStatement } from "./yandex-module-definition/yandex-module-definition.statement.js"
import type { IYandexModuleInjectionFile } from "./yandex-module-injection/yandex-module-injection.file.js"
const generate = GeneratorModule.default

export class TransformService {
    static transformYmapsLibrary(sourcecode: string): void {
        console.log("\n" + "Начинаем преобразование исходного кода Яндекс.Карт в ESM-библиотеку...")

        const library = parse(sourcecode, { sourceType: "script" }).program

        const initializator = library.body.find(isYmapsInitializator)
        if (initializator) console.log("\n" + "Найден инициализатор Яндекс.Карт")
        else throw new Error("\n" + "Инициализатор ЯндексюКарт не был найден, но он точно должен быть в библиотеке!")

        const injectors = library.body.filter(isYandexModulesInjector)
        console.log("\n" + `Найдено ${injectors.length} пакетных инъекторов модулей Yandex`)

        console.log("\n" + `Сканирование библиотеки завершено. Опознано ${1 + injectors.length} сегментов из ${library.body.length}`)

        console.log("\n" + "Поиск модулей в опознанных сегментах...")

        const initializatorModules = this.#getInitializatorModules(initializator)
        console.log(`Найдено ${initializatorModules.length} модуля в инициализаторе`)

        const injectorModules = injectors.flatMap(injector => this.#getInjectorModules(injector))
        console.log(`Найдено ${injectorModules.length} модуля в инъекторах`)

        debugger
    }

    static #getInitializatorModules(statement: IIIFEStatement): Program[] {
        return []
    }

    static #getInjectorModules(injector: IYandexModulesInjectorStatement): Program[] {
        const injections = injector.expression.arguments[0].elements
        const modules = Array<Program>()

        for (const injection of injections) {
            if (injection === null || injection.type === "SpreadElement") throw new Error("Invalid value of first argument of (method) ymaps.modules.define([...])! Expect FunctionDeclaration, but found " + injection?.type)
            if (!isYandexModuleInjection(injection)) throw new TypeError("Invalid injection:" + "\n" + generate(injection))

            modules.push(...this.#getIngectionModules(injection))
        }

        return modules
    }

    static #getIngectionModules(injection: FunctionExpression): Program[] {
        const injectionAST = createYandexModuleInjectionAST(injection)

        const definitions = new Array<IYandexModuleDefinitionStatement>()

        traverse(injectionAST, {
            Statement: ({ node }) => isYandexModuleDefinition(node) && definitions.push(node)
        })

        const isPlainInjection = definitions.every(definition => injectionAST.program.body.includes(definition))

        if (isPlainInjection) return this.#dividePlainInjectionToModules(injectionAST)
        else return [this.#mergeInjectionToModule(injectionAST)]
    }

    static #dividePlainInjectionToModules(injectionAST: ParseResult<IYandexModuleInjectionFile>): Program[] {
        const injectionDeclaration = injectionAST.body[0]

        const definitionStatements: IYandexModuleDefinitionStatement[] = []
        const commonStatements: Statement[] = []

        for (const state of injectionDeclaration.body.body) {
            if (isYandexModuleDefinition(state)) definitionStatements.push(state)
            else commonStatements.push(state)
        }

        const definitionInfos = definitionStatements.map(readYandexModuleDefinition)

        const dependencyPathes = definitionInfos.map(({ name }) => name)

        const nearestCommonPath =
            dependencyPathes.length > 1 && ("/" + findNearestCommonPath(dependencyPathes, ".").split(".").join("/"))
            || dependencyPathes.length === 1 && ("/" + dependencyPathes[0].split(".").slice(0, -1).join("/"))
            || dependencyPathes.length === 0 && ("/")

        const definitionToModuleMap = new Map()

        for (const definition of definitionStatements) {
            const module = emptyModule()

            const definitionInfo = readYandexModuleDefinition(definition)



            definitionToModuleMap.set(definition, module)
        }

        const definedModules = injectionDeclaration.body.body.filter(isYandexModuleDefinition)

        for (const definition of definitionStatements) {

        }

        return []
    }

    static #mergeInjectionToModule(injectionAST: ParseResult<IYandexModuleInjectionFile>): Program {
        throw new Error("Method not implemented!")
    }
}

function addModuleImportByDependencyName(module: Program, dependency: string): Import {
    const uniqueDependencies = [...new Set(dependencies)]
    const collator = new Intl.Collator(undefined, { sensitivity: 'base' })
    uniqueDependencies.sort(collator.compare)

    const dependencyToIdentifierMap = 

    for (const dependency of uniqueDependencies) {
        const untityName = dependency.split(".").pop()
    }
}

function emptyModule() {
    return program([], undefined, "module")
}

function findNearestCommonPath(pathes: string[], delimeter = "/") {
    if (pathes.length < 2) throw new Error()

    const partsPacks = pathes.map(path => path.split(delimeter))

    const commonParts = []

    for (let level = 0; level++; true) {
        const levelName = partsPacks[0][level]
        if (partsPacks.every(parts => parts[level] === levelName)) commonParts.push(levelName)
        else break
    }

    return commonParts.join(delimeter)
}

function transformYandexModuleToEsm(definition: IYandexModuleDefinitionStatement) {
    const info = readYandexModuleDefinition(definition)

    const module = program(
        info.declaration.body.body,
        undefined,
        "module"
    )

    const [provide, ...localSpecifiers] = info.declaration.params

    for (let specifierIdx = 0; specifierIdx < localSpecifiers.length; specifierIdx++) {
        const dependencyName = info.dependencies[specifierIdx]
        const dependencyPath = "/" + dependencyName.replaceAll(".", "/") + ".js"

        const moduleName = dependencyName.split(".").pop()
        if (moduleName === undefined) throw new Error()

        const importedIdentifier = identifier(moduleName)
        const localIdentifier = localSpecifiers[specifierIdx]
        if (localIdentifier.type !== "Identifier") throw new Error()

        module.body.unshift(importDeclaration(
            [importSpecifier(localIdentifier, importedIdentifier)],
            stringLiteral(dependencyPath)
        ))
    }
    for (const identifier of localSpecifiers) {
        if (identifier.type !== "Identifier") throw new Error()

    }

    return module
}