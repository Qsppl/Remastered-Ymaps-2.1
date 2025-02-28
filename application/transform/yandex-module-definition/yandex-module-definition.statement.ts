import type { ExpressionStatement } from "@babel/types"
import type { TYandexModuleDefinitionExpression } from "./yandex-module-definition.expression.js"

export interface IYandexModuleDefinitionStatement extends ExpressionStatement {
    expression: TYandexModuleDefinitionExpression
}