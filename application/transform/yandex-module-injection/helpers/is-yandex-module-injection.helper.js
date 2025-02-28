import {} from "@babel/types";
import { isYandexModuleDefinition } from "../../yandex-module-definition/helpers/is-yandex-module-definition-statement.helper.js";
export function isYandexModuleInjection(expression) {
    return expression.type === "FunctionExpression" && expression.params.length === 1 && expression.body.body.some(isYandexModuleDefinition);
}
