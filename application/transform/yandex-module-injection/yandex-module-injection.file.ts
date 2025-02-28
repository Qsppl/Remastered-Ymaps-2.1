import type { File, FunctionDeclaration } from "@babel/types"

export interface IYandexModuleInjectionFile extends File {
    body: [FunctionDeclaration]
}