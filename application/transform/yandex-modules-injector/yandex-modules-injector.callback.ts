import type { FunctionExpression, Identifier } from "@babel/types"

export interface IYandexModulesInjectorCallback extends FunctionExpression {
    params: [Identifier & { name: "modules" }]
}