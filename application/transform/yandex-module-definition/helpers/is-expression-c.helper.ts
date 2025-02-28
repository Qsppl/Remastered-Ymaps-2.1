import { isCallExpression, type Expression } from "@babel/types"
import type { IYandexModuleDefinitionExpressionC } from "../yandex-module-definition.expression.js"

export function isExpressionC(expression: Expression): expression is IYandexModuleDefinitionExpressionC {
    if (isCallExpression(expression) && expression.arguments.length >= 2) {
        const hasName = expression.arguments[0].type === "StringLiteral"
        const hasDeclaration = expression.arguments[2].type === "FunctionExpression"
        return hasName && hasDeclaration
    }

    return false
}