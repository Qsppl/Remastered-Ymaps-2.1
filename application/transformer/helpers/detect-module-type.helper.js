export function detectModuleType(node) {
    if (t.isCallExpression(node) &&
        t.isMemberExpression(node.callee) &&
        node.callee.object.name === 'ymaps' &&
        node.callee.property.name === 'modules') {
        return 'ymaps';
    }
    return null;
}
