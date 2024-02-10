"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNamedImport = void 0;
const typescript_1 = require("typescript");
/**
 * Helper to create named imports.
 *
 * @param fnName functions to imports
 * @param filename path of the module
 * @param isTypeOnly whether fnName are used as types only
 * @returns ts.Node of the import declaration
 */
const createNamedImport = (fnName, filename, isTypeOnly = false) => {
    const fnNames = Array.isArray(fnName) ? fnName : [fnName];
    return typescript_1.factory.createImportDeclaration(undefined, typescript_1.factory.createImportClause(isTypeOnly, undefined, typescript_1.factory.createNamedImports(fnNames.map((name) => typescript_1.factory.createImportSpecifier(false, undefined, typescript_1.factory.createIdentifier(name))))), typescript_1.factory.createStringLiteral(filename), undefined);
};
exports.createNamedImport = createNamedImport;
//# sourceMappingURL=createNamedImport.js.map