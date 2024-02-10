"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaToEnumDeclaration = void 0;
const tslib_1 = require("tslib");
const case_1 = require("case");
const typescript_1 = tslib_1.__importStar(require("typescript"));
const getEnumProperties_1 = require("../utils/getEnumProperties");
const schemaToTypeAliasDeclaration_1 = require("./schemaToTypeAliasDeclaration");
/**
 * Add Enum support when transforming an OpenAPI Schema Object to Typescript Nodes.
 *
 * @param name Name of the schema
 * @param schema OpenAPI Schema object
 * @param context Context
 */
const schemaToEnumDeclaration = (name, schema, context) => {
    const jsDocNode = (0, schemaToTypeAliasDeclaration_1.getJSDocComment)(schema, context);
    const members = getEnumMembers(schema, context);
    const declarationNode = typescript_1.factory.createEnumDeclaration([typescript_1.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], (0, case_1.pascal)(name), members);
    return jsDocNode ? [jsDocNode, declarationNode] : [declarationNode];
};
exports.schemaToEnumDeclaration = schemaToEnumDeclaration;
function getEnumMembers(schema, context) {
    if (!schema.enum || !Array.isArray(schema.enum)) {
        throw new Error("The provided schema does not have an 'enum' property or it is not an array.");
    }
    return schema.enum.map((enumValue, index) => {
        let enumName;
        let enumValueNode = undefined;
        if (typeof enumValue === "string") {
            enumName = enumValue;
            enumValueNode = typescript_1.factory.createStringLiteral(enumValue);
        }
        else if (typeof enumValue === "number") {
            enumName = (0, getEnumProperties_1.convertNumberToWord)(enumValue)
                .toUpperCase()
                .replace(/[-\s]/g, "_");
            enumValueNode = typescript_1.factory.createNumericLiteral(enumValue);
        }
        else if (typeof enumValue === "boolean") {
            enumName = enumValue ? "True" : "False";
        }
        else {
            throw new Error(`Unsupported enum value type: ${typeof enumValue}`);
        }
        return typescript_1.factory.createEnumMember(typescript_1.factory.createIdentifier(enumName), enumValueNode);
    });
}
//# sourceMappingURL=schemaToEnumDeclaration.js.map