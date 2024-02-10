"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOperationTypes = void 0;
const tslib_1 = require("tslib");
const case_1 = require("case");
const typescript_1 = tslib_1.__importStar(require("typescript"));
const getParamsGroupByType_1 = require("./getParamsGroupByType");
const getRequestBodyType_1 = require("./getRequestBodyType");
const getDataResponseType_1 = require("./getDataResponseType");
const getVariablesType_1 = require("./getVariablesType");
const isRequestBodyOptional_1 = require("./isRequestBodyOptional");
const paramsToSchema_1 = require("./paramsToSchema");
const schemaToTypeAliasDeclaration_1 = require("./schemaToTypeAliasDeclaration");
const getErrorResponseType_1 = require("./getErrorResponseType");
/**
 * Get operation types (data, error, params) and associated declaration nodes.
 */
const getOperationTypes = ({ operationId, operation, openAPIDocument, printNodes, pathParameters = [], injectedHeaders = [], variablesExtraPropsType, }) => {
    const declarationNodes = [];
    // Retrieve dataType
    let dataType = (0, getDataResponseType_1.getDataResponseType)({
        responses: operation.responses,
        components: openAPIDocument.components,
        printNodes,
    });
    // Retrieve errorType
    let errorType = (0, getErrorResponseType_1.getErrorResponseType)({
        responses: operation.responses,
        components: openAPIDocument.components,
        printNodes,
    });
    // Retrieve requestBodyType
    let requestBodyType = (0, getRequestBodyType_1.getRequestBodyType)({
        requestBody: operation.requestBody,
        components: openAPIDocument.components,
    });
    // Generate params types
    const { pathParams, queryParams, headerParams } = (0, getParamsGroupByType_1.getParamsGroupByType)([...pathParameters, ...(operation.parameters || [])], openAPIDocument.components);
    // Check if types can be marked as optional (all properties are optional)
    const requestBodyOptional = (0, isRequestBodyOptional_1.isRequestBodyOptional)({
        requestBody: operation.requestBody,
        components: openAPIDocument.components,
    });
    const headersOptional = headerParams.reduce((mem, p) => {
        if (injectedHeaders.includes(p.name))
            return mem;
        return mem && !p.required;
    }, true);
    const pathParamsOptional = pathParams.reduce((mem, p) => {
        return mem && !p.required;
    }, true);
    const queryParamsOptional = queryParams.reduce((mem, p) => {
        return mem && !p.required;
    }, true);
    if (pathParams.length > 0) {
        declarationNodes.push(...(0, schemaToTypeAliasDeclaration_1.schemaToTypeAliasDeclaration)(`${operationId}PathParams`, (0, paramsToSchema_1.paramsToSchema)(pathParams), {
            currentComponent: null,
            openAPIDocument,
        }));
    }
    if (queryParams.length > 0) {
        declarationNodes.push(...(0, schemaToTypeAliasDeclaration_1.schemaToTypeAliasDeclaration)(`${operationId}QueryParams`, (0, paramsToSchema_1.paramsToSchema)(queryParams), {
            currentComponent: null,
            openAPIDocument,
        }));
    }
    if (headerParams.length > 0) {
        declarationNodes.push(...(0, schemaToTypeAliasDeclaration_1.schemaToTypeAliasDeclaration)(`${operationId}Headers`, (0, paramsToSchema_1.paramsToSchema)(headerParams, injectedHeaders), {
            currentComponent: null,
            openAPIDocument,
        }));
    }
    // Export error type
    const errorTypeIdentifier = (0, case_1.pascal)(`${operationId}Error`);
    declarationNodes.push(typescript_1.factory.createTypeAliasDeclaration([typescript_1.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], typescript_1.factory.createIdentifier(errorTypeIdentifier), undefined, errorType));
    errorType = typescript_1.factory.createTypeReferenceNode(errorTypeIdentifier);
    // Export data type if needed
    if (shouldExtractNode(dataType)) {
        const dataTypeIdentifier = (0, case_1.pascal)(`${operationId}Response`);
        declarationNodes.push(typescript_1.factory.createTypeAliasDeclaration([typescript_1.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], typescript_1.factory.createIdentifier(dataTypeIdentifier), undefined, dataType));
        dataType = typescript_1.factory.createTypeReferenceNode(dataTypeIdentifier);
    }
    // Export requestBody type if needed
    if (shouldExtractNode(requestBodyType)) {
        const requestBodyIdentifier = (0, case_1.pascal)(`${operationId}RequestBody`);
        declarationNodes.push(typescript_1.factory.createTypeAliasDeclaration([typescript_1.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], typescript_1.factory.createIdentifier(requestBodyIdentifier), undefined, requestBodyType));
        requestBodyType = typescript_1.factory.createTypeReferenceNode(requestBodyIdentifier);
    }
    const pathParamsType = pathParams.length > 0
        ? typescript_1.factory.createTypeReferenceNode(`${(0, case_1.pascal)(operationId)}PathParams`)
        : typescript_1.factory.createTypeLiteralNode([]);
    const queryParamsType = queryParams.length > 0
        ? typescript_1.factory.createTypeReferenceNode(`${(0, case_1.pascal)(operationId)}QueryParams`)
        : typescript_1.factory.createTypeLiteralNode([]);
    const headersType = headerParams.length > 0
        ? typescript_1.factory.createTypeReferenceNode(`${(0, case_1.pascal)(operationId)}Headers`)
        : typescript_1.factory.createTypeLiteralNode([]);
    // Generate fetcher variables type
    const variablesIdentifier = (0, case_1.pascal)(`${operationId}Variables`);
    let variablesType = (0, getVariablesType_1.getVariablesType)({
        requestBodyType,
        headersType,
        pathParamsType,
        queryParamsType,
        headersOptional,
        pathParamsOptional,
        queryParamsOptional,
        requestBodyOptional,
    });
    if (variablesExtraPropsType.kind !== typescript_1.default.SyntaxKind.VoidKeyword) {
        variablesType =
            variablesType.kind === typescript_1.default.SyntaxKind.VoidKeyword
                ? variablesExtraPropsType
                : typescript_1.factory.createIntersectionTypeNode([
                    variablesType,
                    variablesExtraPropsType,
                ]);
    }
    if (variablesType.kind !== typescript_1.default.SyntaxKind.VoidKeyword) {
        declarationNodes.push(typescript_1.factory.createTypeAliasDeclaration([typescript_1.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], typescript_1.factory.createIdentifier(variablesIdentifier), undefined, variablesType));
        variablesType = typescript_1.factory.createTypeReferenceNode(variablesIdentifier);
    }
    return {
        dataType,
        errorType,
        declarationNodes,
        headersType,
        pathParamsType,
        queryParamsType,
        requestBodyType,
        variablesType,
    };
};
exports.getOperationTypes = getOperationTypes;
/**
 * Define if the type should be extracted.
 */
const shouldExtractNode = (node) => typescript_1.default.isIntersectionTypeNode(node) ||
    (typescript_1.default.isTypeLiteralNode(node) && node.members.length > 0) ||
    typescript_1.default.isArrayTypeNode(node);
//# sourceMappingURL=getOperationTypes.js.map