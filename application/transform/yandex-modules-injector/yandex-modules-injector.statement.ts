import type { IIIFEStatement } from "#root/shared/is-iife.helper.js"
import type { IYandexModulesInjectorExpression } from "./yandex-modules-injector.expression.js"

export interface IYandexModulesInjectorStatement extends IIIFEStatement {
    expression: IYandexModulesInjectorExpression
}