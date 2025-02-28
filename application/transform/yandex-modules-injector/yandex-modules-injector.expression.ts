import type { IIIFEExpression } from "#root/shared/is-iife.helper.js"
import type { ArrayExpression } from "@babel/types"
import type { IYandexModulesInjectorCallback } from "./yandex-modules-injector.callback.js"

export interface IYandexModulesInjectorExpression extends IIIFEExpression {
    arguments: [ArrayExpression]
    callee: IYandexModulesInjectorCallback
}
