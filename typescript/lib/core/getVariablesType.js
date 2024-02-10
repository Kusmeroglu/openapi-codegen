"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariablesType = void 0;
const tslib_1 = require("tslib");
const typescript_1 = tslib_1.__importStar(require("typescript"));
/**
 * Get fetcher variables types from the operation types
 */
const getVariablesType = ({ requestBodyType, requestBodyOptional, headersType, headersOptional, pathParamsType, pathParamsOptional, queryParamsType, queryParamsOptional, }) => {
    const variablesItems = [];
    const hasProperties = (node) => {
        return ((!typescript_1.default.isTypeLiteralNode(node) || node.members.length > 0) &&
            node.kind !== typescript_1.default.SyntaxKind.UndefinedKeyword);
    };
    if (hasProperties(requestBodyType)) {
        variablesItems.push(typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("body"), requestBodyOptional
            ? typescript_1.factory.createToken(typescript_1.default.SyntaxKind.QuestionToken)
            : undefined, requestBodyType));
    }
    if (hasProperties(headersType)) {
        variablesItems.push(typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("headers"), headersOptional
            ? typescript_1.factory.createToken(typescript_1.default.SyntaxKind.QuestionToken)
            : undefined, headersType));
    }
    if (hasProperties(pathParamsType)) {
        variablesItems.push(typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("pathParams"), pathParamsOptional
            ? typescript_1.factory.createToken(typescript_1.default.SyntaxKind.QuestionToken)
            : undefined, pathParamsType));
    }
    if (hasProperties(queryParamsType)) {
        variablesItems.push(typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("queryParams"), queryParamsOptional
            ? typescript_1.factory.createToken(typescript_1.default.SyntaxKind.QuestionToken)
            : undefined, queryParamsType));
    }
    return variablesItems.length === 0
        ? typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.VoidKeyword)
        : typescript_1.factory.createTypeLiteralNode(variablesItems);
};
exports.getVariablesType = getVariablesType;
//# sourceMappingURL=getVariablesType.js.map