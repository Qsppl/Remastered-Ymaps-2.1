export function createImportStatement({ source, local }) {
    return t.importDeclaration([t.importDefaultSpecifier(t.identifier(local))], t.stringLiteral(source));
}
