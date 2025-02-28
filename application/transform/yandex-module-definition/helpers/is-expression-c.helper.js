import { isCallExpression } from "@babel/types";
export function isExpressionC(expression) {
    if (isCallExpression(expression) && expression.arguments.length >= 2) {
        const hasName = expression.arguments[0].type === "StringLiteral";
        const hasDeclaration = expression.arguments[2].type === "FunctionExpression";
        return hasName && hasDeclaration;
    }
    return false;
}
