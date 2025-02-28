import { importSpecifier, stringLiteral, importDeclaration, identifier } from "@babel/types";
import path from "node:path";
export function convertDependencyToImport(dependency, aliace) {
    const modulePath = "/" + path.join(...dependency.split(".")) + ".js";
    const featureName = dependency.split(".").pop();
    if (featureName === undefined)
        throw new Error("Invalid dependency name: " + dependency);
    return importDeclaration([importSpecifier(aliace, identifier(featureName))], stringLiteral(modulePath));
}
