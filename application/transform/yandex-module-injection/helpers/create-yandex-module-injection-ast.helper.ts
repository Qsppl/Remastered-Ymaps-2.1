import type { ParseResult } from "@babel/parser"
import { type FunctionExpression, functionDeclaration, identifier } from "@babel/types"
import type { IYandexModuleInjectionFile } from "../yandex-module-injection.file.js"

export function createYandexModuleInjectionAST(injection: FunctionExpression): ParseResult<IYandexModuleInjectionFile> {
    const declaration = functionDeclaration(identifier("inject"), injection.params, injection.body)
    /// @ts-expect-error
    return parse(generate(program([declaration])).code)
}