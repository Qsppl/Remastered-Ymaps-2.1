import {} from "@babel/types";
import { isIIFE } from "./is-iife.helper.js";
export function isYmapsInitializator(statement) {
    if (isIIFE(statement) && statement.expression.callee.id?.name === "ymapsInit")
        return true;
    return false;
}
