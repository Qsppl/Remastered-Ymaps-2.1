import { type Expression, isCallExpression } from "@babel/types"
import type { IYandexModuleDefinitionExpressionB } from "../yandex-module-definition.expression.js"

export function isExpressionB(expression: Expression): expression is IYandexModuleDefinitionExpressionB {
    if (isCallExpression(expression) && expression.arguments.length === 2) {
        const hasName = expression.arguments[0].type === "StringLiteral"
        const hasDeclaration = expression.arguments[1].type === "FunctionExpression"
        return hasName && hasDeclaration
    }

    return false
}