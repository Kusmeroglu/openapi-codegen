"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSchemaTypes = void 0;
const tslib_1 = require("tslib");
const c = tslib_1.__importStar(require("case"));
const typescript_1 = tslib_1.__importDefault(require("typescript"));
const createWatermark_1 = require("../core/createWatermark");
const getUsedImports_1 = require("../core/getUsedImports");
const schemaToTypeAliasDeclaration_1 = require("../core/schemaToTypeAliasDeclaration");
const getEnumProperties_1 = require("../utils/getEnumProperties");
const openapi3_ts_1 = require("openapi3-ts");
const findCompatibleMediaType_1 = require("../core/findCompatibleMediaType");
const schemaToEnumDeclaration_1 = require("../core/schemaToEnumDeclaration");
/**
 * Generate schemas types (components & responses)
 * @param context CLI Context
 * @param config Configuration
 */
const generateSchemaTypes = async (context, config = {}) => {
    const { components } = context.openAPIDocument;
    if (!components) {
        throw new Error("No components founds!");
    }
    const sourceFile = typescript_1.default.createSourceFile("index.ts", "", typescript_1.default.ScriptTarget.Latest);
    const printer = typescript_1.default.createPrinter({
        newLine: typescript_1.default.NewLineKind.LineFeed,
        removeComments: false,
    });
    const printNodes = (nodes) => nodes
        .map((node) => {
        return (printer.printNode(typescript_1.default.EmitHint.Unspecified, node, sourceFile) +
            (typescript_1.default.isJSDoc(node) ? "" : "\n"));
    })
        .join("\n");
    const handleTypeAlias = (componentSchema) => componentSchema.reduce((mem, [name, schema]) => [
        ...mem,
        ...(0, schemaToTypeAliasDeclaration_1.schemaToTypeAliasDeclaration)(name, schema, {
            openAPIDocument: context.openAPIDocument,
            currentComponent: "schemas",
        }, config.useEnums),
    ], []);
    const filenamePrefix = c.snake(config.filenamePrefix ?? context.openAPIDocument.info.title) + "-";
    const formatFilename = config.filenameCase ? c[config.filenameCase] : c.camel;
    const files = {
        requestBodies: formatFilename(filenamePrefix + "-request-bodies"),
        schemas: formatFilename(filenamePrefix + "-schemas"),
        parameters: formatFilename(filenamePrefix + "-parameters"),
        responses: formatFilename(filenamePrefix + "-responses"),
        utils: formatFilename(filenamePrefix + "-utils"),
    };
    // Generate `components/schemas` types
    if (components.schemas) {
        const schemas = [];
        const componentSchemaEntries = Object.entries(components.schemas);
        if (config.useEnums) {
            const enumSchemaEntries = (0, getEnumProperties_1.getEnumProperties)(componentSchemaEntries);
            const enumSchemas = enumSchemaEntries.reduce((mem, [name, schema]) => [
                ...mem,
                ...(0, schemaToEnumDeclaration_1.schemaToEnumDeclaration)(name, schema, {
                    openAPIDocument: context.openAPIDocument,
                    currentComponent: "schemas",
                }),
            ], []);
            const componentsSchemas = handleTypeAlias(componentSchemaEntries.filter(([name]) => !enumSchemaEntries.some(([enumName]) => name === enumName)));
            schemas.push(...enumSchemas, ...componentsSchemas);
        }
        else {
            const componentsSchemas = handleTypeAlias(componentSchemaEntries);
            schemas.push(...componentsSchemas);
        }
        await context.writeFile(files.schemas + ".ts", printNodes([
            (0, createWatermark_1.createWatermark)(context.openAPIDocument.info),
            ...(0, getUsedImports_1.getUsedImports)(schemas, files).nodes,
            ...schemas,
        ]));
    }
    // Generate `components/responses` types
    if (components.responses) {
        const componentsResponses = Object.entries(components.responses).reduce((mem, [name, responseObject]) => {
            if ((0, openapi3_ts_1.isReferenceObject)(responseObject))
                return mem;
            const mediaType = (0, findCompatibleMediaType_1.findCompatibleMediaType)(responseObject);
            return [
                ...mem,
                ...(0, schemaToTypeAliasDeclaration_1.schemaToTypeAliasDeclaration)(name, mediaType?.schema || {}, {
                    openAPIDocument: context.openAPIDocument,
                    currentComponent: "responses",
                }),
            ];
        }, []);
        if (componentsResponses.length) {
            await context.writeFile(files.responses + ".ts", printNodes([
                (0, createWatermark_1.createWatermark)(context.openAPIDocument.info),
                ...(0, getUsedImports_1.getUsedImports)(componentsResponses, files).nodes,
                ...componentsResponses,
            ]));
        }
    }
    // Generate `components/requestBodies` types
    if (components.requestBodies) {
        const componentsRequestBodies = Object.entries(components.requestBodies).reduce((mem, [name, requestBodyObject]) => {
            if ((0, openapi3_ts_1.isReferenceObject)(requestBodyObject))
                return mem;
            const mediaType = (0, findCompatibleMediaType_1.findCompatibleMediaType)(requestBodyObject);
            if (!mediaType || !mediaType.schema)
                return mem;
            return [
                ...mem,
                ...(0, schemaToTypeAliasDeclaration_1.schemaToTypeAliasDeclaration)(name, mediaType.schema, {
                    openAPIDocument: context.openAPIDocument,
                    currentComponent: "requestBodies",
                }),
            ];
        }, []);
        if (componentsRequestBodies.length) {
            await context.writeFile(files.requestBodies + ".ts", printNodes([
                (0, createWatermark_1.createWatermark)(context.openAPIDocument.info),
                ...(0, getUsedImports_1.getUsedImports)(componentsRequestBodies, files).nodes,
                ...componentsRequestBodies,
            ]));
        }
    }
    // Generate `components/parameters` types
    if (components.parameters) {
        const componentsParameters = Object.entries(components.parameters).reduce((mem, [name, parameterObject]) => {
            if ((0, openapi3_ts_1.isReferenceObject)(parameterObject) || !parameterObject.schema) {
                return mem;
            }
            return [
                ...mem,
                ...(0, schemaToTypeAliasDeclaration_1.schemaToTypeAliasDeclaration)(name, parameterObject.schema, {
                    openAPIDocument: context.openAPIDocument,
                    currentComponent: "parameters",
                }),
            ];
        }, []);
        await context.writeFile(files.parameters + ".ts", printNodes([
            (0, createWatermark_1.createWatermark)(context.openAPIDocument.info),
            ...(0, getUsedImports_1.getUsedImports)(componentsParameters, files).nodes,
            ...componentsParameters,
        ]));
    }
    return {
        schemasFiles: files,
    };
};
exports.generateSchemaTypes = generateSchemaTypes;
//# sourceMappingURL=generateSchemaTypes.js.map