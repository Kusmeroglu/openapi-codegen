"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequestBodyType = void 0;
const tslib_1 = require("tslib");
const typescript_1 = tslib_1.__importStar(require("typescript"));
const openapi3_ts_1 = require("openapi3-ts");
const case_1 = require("case");
const findCompatibleMediaType_1 = require("./findCompatibleMediaType");
const schemaToTypeAliasDeclaration_1 = require("./schemaToTypeAliasDeclaration");
/**
 * Extract types from request body
 */
const getRequestBodyType = ({ requestBody, components, }) => {
    if (!requestBody) {
        return typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.UndefinedKeyword);
    }
    if ((0, openapi3_ts_1.isReferenceObject)(requestBody)) {
        const [hash, topLevel, namespace, name] = requestBody.$ref.split("/");
        if (hash !== "#" || topLevel !== "components") {
            throw new Error("This library only resolve $ref that are include into `#/components/*` for now");
        }
        if (namespace !== "requestBodies") {
            throw new Error("$ref for requestBody must be on `#/components/requestBodies`");
        }
        return typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createQualifiedName(typescript_1.factory.createIdentifier("RequestBodies"), typescript_1.factory.createIdentifier((0, case_1.pascal)(name))), undefined);
    }
    const mediaType = (0, findCompatibleMediaType_1.findCompatibleMediaType)(requestBody);
    if (!mediaType) {
        return typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.UndefinedKeyword);
    }
    if ((0, openapi3_ts_1.isReferenceObject)(mediaType)) {
        const [hash, topLevel, namespace, name] = mediaType.$ref.split("/");
        if (hash !== "#" || topLevel !== "components") {
            throw new Error("This library only resolve $ref that are include into `#/components/*` for now");
        }
        if (namespace !== "schemas") {
            throw new Error("$ref for schemas must be on `#/components/schemas`");
        }
        return typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createQualifiedName(typescript_1.factory.createIdentifier("Schemas"), typescript_1.factory.createIdentifier((0, case_1.pascal)(name))), undefined);
    }
    if (!mediaType.schema) {
        return typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.UndefinedKeyword);
    }
    return (0, schemaToTypeAliasDeclaration_1.getType)(mediaType.schema, {
        currentComponent: null,
        openAPIDocument: { components },
    });
};
exports.getRequestBodyType = getRequestBodyType;
//# sourceMappingURL=getRequestBodyType.js.map