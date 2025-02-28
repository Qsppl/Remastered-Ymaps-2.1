import { isYandexModuleDefinitionExpression } from "./is-yandex-module-definition-expression.helper.js";
export function isYandexModuleDefinition(statement) {
    return statement.type === "ExpressionStatement" && isYandexModuleDefinitionExpression(statement.expression);
}
