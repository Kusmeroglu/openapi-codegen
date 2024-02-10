"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReactQueryFunctions = void 0;
const tslib_1 = require("tslib");
const typescript_1 = tslib_1.__importStar(require("typescript"));
const c = tslib_1.__importStar(require("case"));
const lodash_1 = require("lodash");
const getUsedImports_1 = require("../core/getUsedImports");
const createWatermark_1 = require("../core/createWatermark");
const createOperationFetcherFnNodes_1 = require("../core/createOperationFetcherFnNodes");
const createOperationQueryFnNodes_1 = require("../core/createOperationQueryFnNodes");
const isVerb_1 = require("../core/isVerb");
const isOperationObject_1 = require("../core/isOperationObject");
const getOperationTypes_1 = require("../core/getOperationTypes");
const createNamedImport_1 = require("../core/createNamedImport");
const fetcher_1 = require("../templates/fetcher");
const context_1 = require("../templates/context");
const utils_1 = require("../templates/utils");
const createNamespaceImport_1 = require("../core/createNamespaceImport");
const camelizedPathParams_1 = require("../core/camelizedPathParams");
const generateReactQueryFunctions = async (context, config) => {
    const sourceFile = typescript_1.default.createSourceFile("index.ts", "", typescript_1.default.ScriptTarget.Latest);
    const printer = typescript_1.default.createPrinter({
        newLine: typescript_1.default.NewLineKind.LineFeed,
        removeComments: false,
    });
    const printNodes = (nodes) => nodes
        .map((node, i, nodes) => {
        return (printer.printNode(typescript_1.default.EmitHint.Unspecified, node, sourceFile) +
            (typescript_1.default.isJSDoc(node) ||
                (typescript_1.default.isImportDeclaration(node) &&
                    nodes[i + 1] &&
                    typescript_1.default.isImportDeclaration(nodes[i + 1]))
                ? ""
                : "\n"));
    })
        .join("\n");
    const filenamePrefix = c.snake(config.filenamePrefix ?? context.openAPIDocument.info.title) + "-";
    const formatFilename = config.filenameCase ? c[config.filenameCase] : c.camel;
    const filename = formatFilename(filenamePrefix + "-functions");
    const fetcherFn = c.camel(`${filenamePrefix}-fetch`);
    const contextTypeName = `${c.pascal(filenamePrefix)}Context`;
    const nodes = [];
    const keyManagerItems = [];
    const fetcherFilename = formatFilename(filenamePrefix + "-fetcher");
    const contextFilename = formatFilename(filenamePrefix + "-context");
    const utilsFilename = formatFilename(filenamePrefix + "-utils");
    if (!context.existsFile(`${fetcherFilename}.ts`)) {
        context.writeFile(`${fetcherFilename}.ts`, (0, fetcher_1.getFetcher)({
            prefix: filenamePrefix,
            contextPath: contextFilename,
            baseUrl: (0, lodash_1.get)(context.openAPIDocument, "servers.0.url"),
        }));
    }
    if (!context.existsFile(`${contextFilename}.ts`)) {
        context.writeFile(`${contextFilename}.ts`, (0, context_1.getContext)(filenamePrefix, filename));
    }
    // Generate `useQuery` & `useMutation`
    const operationIds = [];
    Object.entries(context.openAPIDocument.paths).forEach(([route, verbs]) => {
        Object.entries(verbs).forEach(([verb, operation]) => {
            if (!(0, isVerb_1.isVerb)(verb) || !(0, isOperationObject_1.isOperationObject)(operation))
                return;
            const operationId = c.camel(operation.operationId);
            if (operationIds.includes(operationId)) {
                throw new Error(`The operationId "${operation.operationId}" is duplicated in your schema definition!`);
            }
            operationIds.push(operationId);
            const { dataType, errorType, requestBodyType, pathParamsType, variablesType, queryParamsType, headersType, declarationNodes, } = (0, getOperationTypes_1.getOperationTypes)({
                openAPIDocument: context.openAPIDocument,
                operation,
                operationId,
                printNodes,
                injectedHeaders: config.injectedHeaders,
                pathParameters: verbs.parameters,
                variablesExtraPropsType: typescript_1.factory.createIndexedAccessTypeNode(typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier(contextTypeName), undefined), typescript_1.factory.createLiteralTypeNode(typescript_1.factory.createStringLiteral("fetcherOptions"))),
            });
            const operationFetcherFnName = `fetch${c.pascal(operationId)}`;
            const operationQueryFnName = `${c.pascal(operationId)}Query`;
            const component = operation["x-openapi-codegen-component"] ||
                (verb === "get" ? "useQuery" : "useMutate");
            if (!["useQuery", "useMutate"].includes(component)) {
                throw new Error(`[x-openapi-codegen-component] Invalid value for ${operation.operationId} operation
          Valid options: "useMutate", "useQuery"`);
            }
            if (component === "useQuery") {
                nodes.push(...declarationNodes);
                keyManagerItems.push(typescript_1.factory.createTypeLiteralNode([
                    typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("path"), undefined, typescript_1.factory.createLiteralTypeNode(typescript_1.factory.createStringLiteral((0, camelizedPathParams_1.camelizedPathParams)(route)))),
                    typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("operationId"), undefined, typescript_1.factory.createLiteralTypeNode(typescript_1.factory.createStringLiteral(operationId))),
                    typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("variables"), undefined, variablesType),
                ]));
                nodes.push(...(0, createOperationFetcherFnNodes_1.createOperationFetcherFnNodes)({
                    dataType,
                    errorType,
                    requestBodyType,
                    pathParamsType,
                    variablesType,
                    queryParamsType,
                    headersType,
                    operation,
                    fetcherFn,
                    url: route,
                    verb,
                    name: operationFetcherFnName,
                }), ...(0, createOperationQueryFnNodes_1.createOperationQueryFnNodes)({
                    operationFetcherFnName,
                    dataType,
                    errorType,
                    requestBodyType,
                    pathParamsType,
                    variablesType,
                    queryParamsType,
                    headersType,
                    operation,
                    fetcherFn,
                    url: route,
                    verb,
                    name: operationQueryFnName,
                }));
            }
        });
    });
    if (operationIds.length === 0) {
        console.log(`⚠️ You don't have any operation with "operationId" defined!`);
    }
    const queryKeyManager = typescript_1.factory.createTypeAliasDeclaration([typescript_1.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], "QueryOperation", undefined, keyManagerItems.length > 0
        ? typescript_1.factory.createUnionTypeNode(keyManagerItems)
        : typescript_1.factory.createTypeLiteralNode([
            typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("path"), undefined, typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.StringKeyword)),
            typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("operationId"), undefined, typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.NeverKeyword)),
            typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("variables"), undefined, typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.UnknownKeyword)),
        ]));
    const { nodes: usedImportsNodes, keys: usedImportsKeys } = (0, getUsedImports_1.getUsedImports)(nodes, {
        ...config.schemasFiles,
        utils: utilsFilename,
    });
    if (usedImportsKeys.includes("utils")) {
        await context.writeFile(`${utilsFilename}.ts`, (0, utils_1.getUtils)());
    }
    await context.writeFile(filename + ".ts", printNodes([
        (0, createWatermark_1.createWatermark)(context.openAPIDocument.info),
        createReactQueryImport(),
        (0, createNamedImport_1.createNamedImport)([contextTypeName, "queryKeyFn"], `./${contextFilename}`),
        (0, createNamespaceImport_1.createNamespaceImport)("Fetcher", `./${fetcherFilename}`),
        (0, createNamedImport_1.createNamedImport)(fetcherFn, `./${fetcherFilename}`),
        ...usedImportsNodes,
        ...nodes,
        queryKeyManager,
    ]));
};
exports.generateReactQueryFunctions = generateReactQueryFunctions;
const createReactQueryImport = () => typescript_1.factory.createImportDeclaration(undefined, typescript_1.factory.createImportClause(false, undefined, typescript_1.factory.createNamespaceImport(typescript_1.factory.createIdentifier("reactQuery"))), typescript_1.factory.createStringLiteral("@tanstack/react-query"), undefined);
//# sourceMappingURL=generateReactQueryFunctions.js.map