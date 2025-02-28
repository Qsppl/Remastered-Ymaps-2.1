import { type Expression, type FunctionExpression } from "@babel/types"
import { isYandexModuleDefinition } from "../../yandex-module-definition/helpers/is-yandex-module-definition-statement.helper.js"

export function isYandexModuleInjection(expression: Expression): expression is FunctionExpression {
    return expression.type === "FunctionExpression" && expression.params.length === 1 && expression.body.body.some(isYandexModuleDefinition)
}