import { functionDeclaration, identifier } from "@babel/types";
export function createYandexModuleInjectionAST(injection) {
    const declaration = functionDeclaration(identifier("inject"), injection.params, injection.body);
    /// @ts-expect-error
    return parse(generate(program([declaration])).code);
}
