import type { Statement } from "@babel/types"
import { isYandexModuleDefinitionExpression } from "./is-yandex-module-definition-expression.helper.js"
import type { IYandexModuleDefinitionStatement } from "../yandex-module-definition.statement.js"

export function isYandexModuleDefinition(statement: Statement): statement is IYandexModuleDefinitionStatement {
    return statement.type === "ExpressionStatement" && isYandexModuleDefinitionExpression(statement.expression)
}
