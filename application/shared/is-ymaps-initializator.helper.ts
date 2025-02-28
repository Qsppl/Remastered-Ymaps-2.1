import { type Statement } from "@babel/types"
import { isIIFE, type IIIFEStatement } from "./is-iife.helper.js"

export function isYmapsInitializator(statement: Statement): statement is IIIFEStatement {
    if (isIIFE(statement) && statement.expression.callee.id?.name === "ymapsInit") return true
    return false
}
