import { isCallExpression } from "@babel/types";
export function isExpressionA(expression) {
    if (isCallExpression(expression) && expression.arguments.length === 1 && expression.arguments[0].type === "ObjectExpression") {
        const info = expression.arguments[0];
        const properties = info.properties.map(property => property.type === "ObjectProperty" && property.key.type === "StringLiteral" && property.key.value).filter(value => value !== false);
        return properties.includes("name") && properties.includes("declaration");
    }
    return false;
}
