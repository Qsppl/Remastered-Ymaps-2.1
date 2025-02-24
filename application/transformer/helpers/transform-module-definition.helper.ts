export function transformModuleDefinition(moduleInfo) {
    const imports = new Set();
    const exports = new Set();

    // Transform dependencies into imports
    moduleInfo.dependencies.forEach(dep => {
        const importName = dep.split('.').pop();
        imports.add({
            source: `ymaps/${dep.replace('.', '/')}`,
            local: importName
        });
    });

    // Handle exports
    if (moduleInfo.implementation) {
        if (t.isFunctionExpression(moduleInfo.implementation)) {
            // Transform function parameters to match imports
            moduleInfo.implementation.params = moduleInfo.dependencies.map(dep => 
                t.identifier(dep.split('.').pop())
            );
        }
        exports.add({
            local: 'default',
            exported: moduleInfo.moduleName
        });
    }

    return { imports, exports };
}