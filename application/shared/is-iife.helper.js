import {} from "@babel/types";
export function isIIFE(statement) {
    if (statement.type === 'ExpressionStatement' && statement.expression.type === 'CallExpression' && statement.expression.callee.type === "FunctionExpression")
        return true;
    return false;
}
