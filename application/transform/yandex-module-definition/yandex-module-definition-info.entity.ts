import type { StringLiteral, FunctionDeclaration, FunctionExpression } from "@babel/types"

export interface IYandexModuleDefinitionInfo {
    readonly name: string
    readonly dependencies: string[]
    readonly declaration: FunctionExpression
}