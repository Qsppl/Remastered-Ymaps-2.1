import { type Program } from "@babel/types"

export function extractIIFE(program: Program) {
    if (program.body.length !== 1) return null

    if (program.body[0].type !== 'ExpressionStatement') return null

    if (program.body[0].expression.type !== 'CallExpression') return null

    return program.body[0].expression
}

