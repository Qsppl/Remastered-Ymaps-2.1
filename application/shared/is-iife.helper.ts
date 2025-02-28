import { type CallExpression, type ExpressionStatement, type FunctionExpression, type Statement } from "@babel/types"

export interface IIIFEExpression extends CallExpression {
    callee: FunctionExpression
}

export interface IIIFEStatement extends ExpressionStatement {
    expression: IIIFEExpression
}

export function isIIFE(statement: Statement): statement is IIIFEStatement {
    if (statement.type === 'ExpressionStatement' && statement.expression.type === 'CallExpression' && statement.expression.callee.type === "FunctionExpression") return true
    return false
}
