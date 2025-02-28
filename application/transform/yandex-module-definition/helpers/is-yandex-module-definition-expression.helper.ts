import type { Expression } from "@babel/types"
import { isExpressionA } from "./is-expression-a.helper.js"
import { isExpressionB } from "./is-expression-b.helper.js"
import { isExpressionC } from "./is-expression-c.helper.js"

export function isYandexModuleDefinitionExpression(expression: Expression) {
    return expression.type === "CallExpression" && (isExpressionA(expression) || isExpressionB(expression) || isExpressionC(expression))
}