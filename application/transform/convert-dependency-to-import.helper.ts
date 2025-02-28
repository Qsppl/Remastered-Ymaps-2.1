import { importSpecifier, stringLiteral, type Identifier, importDeclaration, type ImportDeclaration, identifier } from "@babel/types"
import path from "node:path"

export function convertDependencyToImport(dependency: string, aliace: Identifier): ImportDeclaration {
    const modulePath = "/" + path.join(...dependency.split(".")) + ".js"
    const featureName = dependency.split(".").pop()

    if (featureName === undefined) throw new Error("Invalid dependency name: " + dependency)

    return importDeclaration([importSpecifier(aliace, identifier(featureName))], stringLiteral(modulePath))
}