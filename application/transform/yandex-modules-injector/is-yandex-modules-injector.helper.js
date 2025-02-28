import { isIIFE } from "#root/shared/is-iife.helper.js";
import {} from "@babel/types";
export function isYandexModulesInjector(statement) {
    if (!isIIFE(statement))
        return false;
    const iifeParameters = statement.expression.arguments;
    // The injector IIFE should have the only argument with type "array"
    if (iifeParameters.length !== 1 || iifeParameters[0].type !== "ArrayExpression")
        return false;
    const iifeCallbackParameters = statement.expression.callee.params;
    // The injector should have the only argument with name "modules"
    if (iifeCallbackParameters.length !== 1 || iifeCallbackParameters[0].type !== "Identifier" || iifeCallbackParameters[0].name !== "modules")
        return false;
    return true;
}
