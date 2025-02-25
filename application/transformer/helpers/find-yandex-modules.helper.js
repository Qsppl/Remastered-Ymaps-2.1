export function findYandexModules(path) {
    if (!t.isCallExpression(path.node))
        return null;
    const args = path.node.arguments;
    if (args.length < 2)
        return null;
    const moduleName = args[0].value;
    const dependencies = args[1].elements?.map(el => el.value) || [];
    const implementation = args[2];
    return {
        moduleName,
        dependencies,
        implementation
    };
}
