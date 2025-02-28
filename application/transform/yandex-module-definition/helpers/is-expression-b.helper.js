import { isCallExpression } from "@babel/types";
export function isExpressionB(expression) {
    if (isCallExpression(expression) && expression.arguments.length === 2) {
        const hasName = expression.arguments[0].type === "StringLiteral";
        const hasDeclaration = expression.arguments[1].type === "FunctionExpression";
        return hasName && hasDeclaration;
    }
    return false;
}
