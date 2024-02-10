"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOperationFetcherFnNodes = void 0;
const tslib_1 = require("tslib");
const typescript_1 = tslib_1.__importStar(require("typescript"));
const camelizedPathParams_1 = require("./camelizedPathParams");
/**
 * Create the declaration of the fetcher function.
 *
 * @returns Array of nodes
 */
const createOperationFetcherFnNodes = ({ dataType, errorType, requestBodyType, queryParamsType, pathParamsType, headersType, variablesType, fetcherFn, operation, url, verb, name, }) => {
    const nodes = [];
    if (operation.description) {
        nodes.push(typescript_1.factory.createJSDocComment(operation.description.trim(), []));
    }
    nodes.push(typescript_1.factory.createVariableStatement([typescript_1.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], typescript_1.factory.createVariableDeclarationList([
        typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier(name), undefined, undefined, typescript_1.factory.createArrowFunction(undefined, undefined, variablesType.kind !== typescript_1.default.SyntaxKind.VoidKeyword
            ? [
                typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("variables"), undefined, variablesType, undefined),
                typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("signal"), typescript_1.factory.createToken(typescript_1.default.SyntaxKind.QuestionToken), typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("AbortSignal"))),
            ]
            : [
                typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("signal"), typescript_1.factory.createToken(typescript_1.default.SyntaxKind.QuestionToken), typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("AbortSignal"))),
            ], undefined, typescript_1.factory.createToken(typescript_1.default.SyntaxKind.EqualsGreaterThanToken), typescript_1.factory.createCallExpression(typescript_1.factory.createIdentifier(fetcherFn), [
            dataType,
            errorType,
            requestBodyType,
            headersType,
            queryParamsType,
            pathParamsType,
        ], [
            typescript_1.factory.createObjectLiteralExpression([
                typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("url"), typescript_1.factory.createStringLiteral((0, camelizedPathParams_1.camelizedPathParams)(url))),
                typescript_1.factory.createPropertyAssignment(typescript_1.factory.createIdentifier("method"), typescript_1.factory.createStringLiteral(verb)),
                ...(variablesType.kind !== typescript_1.default.SyntaxKind.VoidKeyword
                    ? [
                        typescript_1.factory.createSpreadAssignment(typescript_1.factory.createIdentifier("variables")),
                        typescript_1.factory.createShorthandPropertyAssignment(typescript_1.factory.createIdentifier("signal")),
                    ]
                    : [
                        typescript_1.factory.createShorthandPropertyAssignment(typescript_1.factory.createIdentifier("signal")),
                    ]),
            ], false),
        ]))),
    ], typescript_1.default.NodeFlags.Const)));
    return nodes;
};
exports.createOperationFetcherFnNodes = createOperationFetcherFnNodes;
//# sourceMappingURL=createOperationFetcherFnNodes.js.map