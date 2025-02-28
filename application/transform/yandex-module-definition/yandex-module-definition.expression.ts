import type { ArrayExpression, CallExpression, FunctionExpression, ObjectExpression, StringLiteral } from "@babel/types"

/**
 * See `(method) ymaps.modules.define()`:
 * @example
 * function define(param1: any, param2: any, param3: any, param4: any) {
 *     let name, depends, declaration, context
 *     let key, storage, dynamicDepends, exports
 * 
 *     if (typeof param1 === 'object') {
 *         name = param1.name
 *         storage = param1.storage
 *         key = param1.key
 *         depends = param1.depends
 *         declaration = param1.declaration
 *         context = param1.context
 *         dynamicDepends = param1.dynamicDepends
 *         exports = param1.exports
 *     } else if (arguments.length === 2) {
 *         name = param1
 *         declaration = param2
 *     } else {
 *         name = param1
 *         depends = param2
 *         declaration = param3
 *         context = param4
 *     }
 * 
 *     this._define(new Definition(STATE.DECLARED, name, storage, key, depends, declaration, context, dynamicDepends, exports))
 * };
 */

export type TYandexModuleDefinitionExpression = IYandexModuleDefinitionExpressionA | IYandexModuleDefinitionExpressionB | IYandexModuleDefinitionExpressionC

export interface IYandexModuleDefinitionExpressionA extends CallExpression {
    arguments: [ObjectExpression]
}

export interface IYandexModuleDefinitionExpressionB extends CallExpression {
    arguments: [StringLiteral, FunctionExpression]
}

export interface IYandexModuleDefinitionExpressionC extends CallExpression {
    arguments: [StringLiteral, ArrayExpression, FunctionExpression]
}