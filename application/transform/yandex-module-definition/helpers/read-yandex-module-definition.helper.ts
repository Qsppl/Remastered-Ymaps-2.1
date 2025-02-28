import type { ObjectMethod, ObjectProperty, SpreadElement } from "@babel/types"
import type { IYandexModuleDefinitionInfo } from "../yandex-module-definition-info.entity.js"
import type { IYandexModuleDefinitionStatement } from "../yandex-module-definition.statement.js"
import { isExpressionA } from "./is-expression-a.helper.js"
import { isExpressionB } from "./is-expression-b.helper.js"
import { isExpressionC } from "./is-expression-c.helper.js"

export function readYandexModuleDefinition(statement: IYandexModuleDefinitionStatement): IYandexModuleDefinitionInfo {
    const expression = statement.expression

    if (isExpressionA(expression)) {
        const info = expression.arguments[0]

        const nameLiteral = info.properties.find((property) => isPropertyWithName(property, "name"))?.value
        if (nameLiteral === undefined) throw new Error("Cannot find module name")
        if (nameLiteral.type !== "StringLiteral") throw new Error("Unexpcted value of property \"name\"")
        const name = nameLiteral.value

        const dependenciesExpression = info.properties.find((property) => isPropertyWithName(property, "depends"))?.value
        if (dependenciesExpression === undefined) throw new Error("Cannot find module dependencies")
        if (dependenciesExpression.type !== "ArrayExpression") throw new Error("Unexpcted value of property \"depends\"")
        const dependencies = dependenciesExpression.elements.map(element => {
            if (element?.type !== "StringLiteral") throw new Error("Unexpected value in array of dependencies")
            return element.value
        })

        const declaration = info.properties.find(property => isPropertyWithName(property, "declaration"))?.value
        if (declaration === undefined) throw new Error("Cannot find module declaration")
        if (declaration.type !== "FunctionExpression") throw new Error("Unexpcted value of property \"declaration\"")

        return { name, dependencies, declaration }
    }

    else if (isExpressionB(expression)) {
        const name = expression.arguments[0].value
        const dependencies = new Array<string>()
        const declaration = expression.arguments[1]

        return { name, dependencies, declaration }
    }

    else if (isExpressionC(expression)) {
        const name = expression.arguments[0].value

        const dependenciesExpression = expression.arguments[1]
        const dependencies = dependenciesExpression.elements.map(element => {
            if (element?.type !== "StringLiteral") throw new Error("Unexpected value in array of dependencies")
            return element.value
        })

        const declaration = expression.arguments[2]

        return { name, dependencies, declaration }
    }

    else throw new Error("Unknown call signature of module.define() method")
}

function isPropertyWithName(property: ObjectMethod | ObjectProperty | SpreadElement, name: string): property is ObjectProperty {
    return property.type === "ObjectProperty" && property.key.type === "Identifier" && property.key.name === name
}