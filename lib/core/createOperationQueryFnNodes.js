"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOperationQueryFnNodes = void 0;
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const typescript_1 = tslib_1.__importStar(require("typescript"));
const camelizedPathParams_1 = require("./camelizedPathParams");
/**
 * Create the declaration of the react-router queries.
 *
 * @returns Array of nodes
 */
const createOperationQueryFnNodes = ({ operationFetcherFnName, dataType, errorType, requestBodyType, queryParamsType, pathParamsType, headersType, variablesType, fetcherFn, operation, url, verb, name, }) => {
    const nodes = [];
    if (operation.description) {
        nodes.push(typescript_1.factory.createJSDocComment(operation.description.trim(), []));
    }
    nodes.push(typescript_1.factory.createVariableStatement([typescript_1.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], typescript_1.factory.createVariableDeclarationList([
        typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier((0, lodash_1.camelCase)(name)), undefined, undefined, typescript_1.factory.createArrowFunction(undefined, undefined, [
            typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("variables"), undefined, variablesType, undefined),
        ], typescript_1.factory.createTupleTypeNode([
            typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createQualifiedName(typescript_1.factory.createIdentifier("reactQuery"), typescript_1.factory.createIdentifier("QueryKey")), undefined),
            typescript_1.factory.createFunctionTypeNode(undefined, verb === "get"
                ? [
                    typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createObjectBindingPattern([
                        typescript_1.factory.createBindingElement(undefined, undefined, typescript_1.factory.createIdentifier("signal"), undefined),
                    ]), undefined, typescript_1.factory.createTypeLiteralNode([
                        typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("signal"), typescript_1.factory.createToken(typescript_1.default.SyntaxKind.QuestionToken), typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("AbortSignal"), undefined)),
                    ]), undefined),
                ]
                : [
                    typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createObjectBindingPattern([
                        typescript_1.factory.createBindingElement(undefined, undefined, typescript_1.factory.createIdentifier("variables"), undefined),
                        typescript_1.factory.createBindingElement(undefined, undefined, typescript_1.factory.createIdentifier("signal"), undefined),
                    ]), undefined, typescript_1.factory.createTypeLiteralNode([
                        typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("variables"), undefined, variablesType),
                        typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("signal"), typescript_1.factory.createToken(typescript_1.default.SyntaxKind.QuestionToken), typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("AbortSignal"), undefined)),
                    ]), undefined),
                ], typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Promise"), [
                dataType,
            ])),
        ]), typescript_1.factory.createToken(typescript_1.default.SyntaxKind.EqualsGreaterThanToken), typescript_1.factory.createArrayLiteralExpression([
            typescript_1.factory.createCallExpression(typescript_1.factory.createIdentifier("queryKeyFn"), undefined, [
                typescript_1.factory.createObjectLiteralExpression([
                    typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("path"), typescript_1.factory.createStringLiteral((0, camelizedPathParams_1.camelizedPathParams)(url))),
                    typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("operationId"), typescript_1.factory.createStringLiteral(operation.operationId)),
                    typescript_1.factory.createShorthandPropertyAssignment(typescript_1.factory.createIdentifier("variables"), undefined),
                ], true),
            ]),
            typescript_1.factory.createArrowFunction([typescript_1.factory.createModifier(typescript_1.default.SyntaxKind.AsyncKeyword)], undefined, verb === "get"
                ? [
                    typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createObjectBindingPattern([
                        typescript_1.factory.createBindingElement(undefined, undefined, typescript_1.factory.createIdentifier("signal"), undefined),
                    ]), undefined, typescript_1.factory.createTypeLiteralNode([
                        typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("signal"), typescript_1.factory.createToken(typescript_1.default.SyntaxKind.QuestionToken), typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("AbortSignal"), undefined)),
                    ]), undefined),
                ]
                : [
                    typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createObjectBindingPattern([
                        typescript_1.factory.createBindingElement(undefined, undefined, typescript_1.factory.createIdentifier("variables"), undefined),
                        typescript_1.factory.createBindingElement(undefined, undefined, typescript_1.factory.createIdentifier("signal"), undefined),
                    ]), undefined, typescript_1.factory.createTypeLiteralNode([
                        typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("variables"), undefined, variablesType),
                        typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("signal"), typescript_1.factory.createToken(typescript_1.default.SyntaxKind.QuestionToken), typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("AbortSignal"), undefined)),
                    ]), undefined),
                ], undefined, typescript_1.factory.createToken(typescript_1.default.SyntaxKind.EqualsGreaterThanToken), typescript_1.factory.createCallExpression(typescript_1.factory.createIdentifier(operationFetcherFnName), undefined, [
                typescript_1.factory.createObjectLiteralExpression([
                    typescript_1.factory.createSpreadAssignment(typescript_1.factory.createIdentifier("variables")),
                ], false),
                typescript_1.factory.createIdentifier("signal"),
            ])),
        ], true))),
    ], typescript_1.default.NodeFlags.Const)));
    return nodes;
};
exports.createOperationQueryFnNodes = createOperationQueryFnNodes;
//# sourceMappingURL=createOperationQueryFnNodes.js.map