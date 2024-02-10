"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJSDocComment = exports.getType = exports.schemaToTypeAliasDeclaration = void 0;
const tslib_1 = require("tslib");
const case_1 = require("case");
const lodash_1 = require("lodash");
const openapi3_ts_1 = require("openapi3-ts");
const pluralize_1 = require("pluralize");
const tsutils_1 = require("tsutils");
const typescript_1 = tslib_1.__importStar(require("typescript"));
const getReferenceSchema_1 = require("./getReferenceSchema");
let useEnumsConfigBase;
/**
 * Transform an OpenAPI Schema Object to Typescript Nodes (comment & declaration).
 *
 * @param name Name of the schema
 * @param schema OpenAPI Schema object
 * @param context Context
 */
const schemaToTypeAliasDeclaration = (name, schema, context, useEnums) => {
    useEnumsConfigBase = useEnums;
    const jsDocNode = (0, exports.getJSDocComment)(schema, context);
    const declarationNode = typescript_1.factory.createTypeAliasDeclaration([typescript_1.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], (0, case_1.pascal)(name), undefined, (0, exports.getType)(schema, context, name));
    return jsDocNode ? [jsDocNode, declarationNode] : [declarationNode];
};
exports.schemaToTypeAliasDeclaration = schemaToTypeAliasDeclaration;
/**
 * Get the type.
 *
 * @param schema OpenAPI Schema
 * @returns ts.TypeNode
 */
const getType = (schema, context, name, isNodeEnum) => {
    if ((0, openapi3_ts_1.isReferenceObject)(schema)) {
        const [hash, topLevel, namespace, name] = schema.$ref.split("/");
        if (hash !== "#" || topLevel !== "components") {
            throw new Error("This library only resolve $ref that are include into `#/components/*` for now");
        }
        if (namespace === context.currentComponent) {
            return typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier((0, case_1.pascal)(name)));
        }
        return typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createQualifiedName(typescript_1.factory.createIdentifier((0, case_1.pascal)(namespace)), typescript_1.factory.createIdentifier((0, case_1.pascal)(name))));
    }
    if (schema["x-openapi-codegen"]?.type === "never") {
        return typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.NeverKeyword);
    }
    if (schema.oneOf) {
        return typescript_1.factory.createUnionTypeNode([
            ...schema.oneOf.map((i) => withDiscriminator((0, exports.getType)({ ...(0, lodash_1.omit)(schema, ["oneOf", "nullable"]), ...i }, context), i, schema.discriminator, context)),
            ...(schema.nullable ? [typescript_1.factory.createLiteralTypeNode(typescript_1.factory.createNull())] : []),
        ]);
    }
    if (schema.anyOf) {
        return typescript_1.factory.createUnionTypeNode([
            ...schema.anyOf.map((i) => withDiscriminator((0, exports.getType)({ ...(0, lodash_1.omit)(schema, ["anyOf", "nullable"]), ...i }, context), i, schema.discriminator, context)),
            ...(schema.nullable ? [typescript_1.factory.createLiteralTypeNode(typescript_1.factory.createNull())] : []),
        ]);
    }
    if (schema.allOf) {
        const adHocSchemas = [];
        if (schema.properties) {
            adHocSchemas.push({
                type: "object",
                properties: schema.properties,
                required: schema.required,
            });
        }
        if (schema.additionalProperties) {
            adHocSchemas.push({
                type: "object",
                additionalProperties: schema.additionalProperties,
            });
        }
        return getAllOf([...schema.allOf, ...adHocSchemas], context);
    }
    if (schema.enum) {
        if (isNodeEnum) {
            return typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier(name || ""));
        }
        const unionTypes = typescript_1.factory.createUnionTypeNode([
            ...schema.enum.map((value) => {
                if (typeof value === "string") {
                    return typescript_1.factory.createLiteralTypeNode(typescript_1.factory.createStringLiteral(value));
                }
                if (typeof value === "number") {
                    return typescript_1.factory.createLiteralTypeNode(typescript_1.factory.createNumericLiteral(value));
                }
                if (typeof value === "boolean") {
                    return typescript_1.factory.createLiteralTypeNode(value ? typescript_1.factory.createTrue() : typescript_1.factory.createFalse());
                }
                return typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.AnyKeyword);
            }),
            ...(schema.nullable ? [typescript_1.factory.createLiteralTypeNode(typescript_1.factory.createNull())] : []),
        ]);
        return unionTypes;
    }
    // Handle implicit object
    if (schema.properties && !schema.type) {
        schema.type = "object";
    }
    // Handle implicit array
    if (schema.items && !schema.type) {
        schema.type = "array";
    }
    // Handle string constant
    if (schema.const && !schema.type) {
        return typescript_1.factory.createLiteralTypeNode(typescript_1.factory.createStringLiteral(schema.const));
    }
    switch (schema.type) {
        case "null":
            return typescript_1.factory.createLiteralTypeNode(typescript_1.factory.createNull());
        case "integer":
        case "number":
            return withNullable(typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.NumberKeyword), schema.nullable);
        case "string":
            if (schema.format === "binary") {
                return typescript_1.factory.createTypeReferenceNode("Blob");
            }
            return withNullable(typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.StringKeyword), schema.nullable);
        case "boolean":
            return withNullable(typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.BooleanKeyword), schema.nullable);
        case "object":
            if (schema.maxProperties === 0) {
                return withNullable(typescript_1.factory.createTypeLiteralNode([]), schema.nullable);
            }
            if (!schema.properties /* free form object */ &&
                !schema.additionalProperties) {
                return withNullable(typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Record"), [
                    typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.StringKeyword),
                    typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.AnyKeyword),
                ]), schema.nullable);
            }
            const members = Object.entries(schema.properties || {}).map(([key, property]) => {
                const isEnum = typeof property === "object" &&
                    "enum" in property &&
                    useEnumsConfigBase;
                const propertyNode = typescript_1.factory.createPropertySignature(undefined, (0, tsutils_1.isValidIdentifier)(key)
                    ? typescript_1.factory.createIdentifier(key)
                    : typescript_1.factory.createComputedPropertyName(typescript_1.factory.createStringLiteral(key)), schema.required?.includes(key)
                    ? undefined
                    : typescript_1.factory.createToken(typescript_1.default.SyntaxKind.QuestionToken), (0, exports.getType)(property, context, `${name}${(0, case_1.pascal)(key)}`.replace(/[^a-zA-Z0-9 ]/g, ""), isEnum));
                const jsDocNode = (0, exports.getJSDocComment)(property, context);
                if (jsDocNode)
                    addJSDocToNode(propertyNode, jsDocNode);
                return propertyNode;
            });
            const additionalPropertiesNode = getAdditionalProperties(schema, context);
            if (additionalPropertiesNode) {
                return withNullable(members.length > 0
                    ? typescript_1.factory.createIntersectionTypeNode([
                        typescript_1.factory.createTypeLiteralNode(members),
                        typescript_1.factory.createTypeLiteralNode([additionalPropertiesNode]),
                    ])
                    : typescript_1.factory.createTypeLiteralNode([additionalPropertiesNode]), schema.nullable);
            }
            return withNullable(typescript_1.factory.createTypeLiteralNode(members), schema.nullable);
        case "array":
            return withNullable(typescript_1.factory.createArrayTypeNode(!schema.items || Object.keys(schema.items).length === 0
                ? typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.AnyKeyword)
                : (0, exports.getType)(schema.items, context)), schema.nullable);
        default:
            return withNullable(typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.VoidKeyword), schema.nullable);
    }
};
exports.getType = getType;
/**
 * Add nullable option if needed.
 *
 * @param node Any node
 * @param nullable Add nullable option if true
 * @returns Type with or without nullable option
 */
const withNullable = (node, nullable) => {
    return nullable
        ? typescript_1.factory.createUnionTypeNode([node, typescript_1.factory.createLiteralTypeNode(typescript_1.factory.createNull())])
        : node;
};
/**
 * Combine the original type with the discriminator mapping value.
 *
 * @param node
 * @param discriminator
 * @returns
 */
const withDiscriminator = (node, schema, discriminator, context) => {
    if (!discriminator || !discriminator.propertyName || !discriminator.mapping) {
        return node;
    }
    const discriminatedValue = (0, lodash_1.findKey)(discriminator.mapping, (i) => i === schema.$ref);
    if (discriminatedValue) {
        const propertyNameAsLiteral = typescript_1.factory.createTypeLiteralNode([
            typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier(discriminator.propertyName), undefined, typescript_1.factory.createLiteralTypeNode(typescript_1.factory.createStringLiteral(discriminatedValue))),
        ]);
        const spec = (0, lodash_1.get)(context.openAPIDocument, schema.$ref.slice(2).replace(/\//g, "."));
        if (spec && (0, openapi3_ts_1.isSchemaObject)(spec) && spec.properties) {
            const property = spec.properties[discriminator.propertyName];
            if (property &&
                (0, openapi3_ts_1.isSchemaObject)(property) &&
                property.enum?.length === 1 &&
                property.enum[0] === discriminatedValue &&
                spec.required?.includes(discriminator.propertyName)) {
                return node;
            }
            if (!property) {
                return typescript_1.factory.createIntersectionTypeNode([node, propertyNameAsLiteral]);
            }
        }
        const baseTypeWithoutPropertyName = typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("Omit"), [
            node,
            typescript_1.factory.createLiteralTypeNode(typescript_1.factory.createStringLiteral(discriminator.propertyName)),
        ]);
        return typescript_1.factory.createIntersectionTypeNode([
            baseTypeWithoutPropertyName,
            propertyNameAsLiteral,
        ]);
    }
    return node;
};
/**
 * Get `allOf` type.
 */
const getAllOf = (members, context) => {
    const initialValue = {
        isSchemaObjectOnly: true,
        isWritableWithIntersection: true,
        mergedSchema: {},
        intersectionMembers: [],
    };
    const { mergedSchema, isSchemaObjectOnly, isWritableWithIntersection, intersectionMembers, } = members.reduce((acc, member, i) => {
        if (i === 0 && (0, openapi3_ts_1.isSchemaObject)(member)) {
            return {
                ...acc,
                mergedSchema: member,
                intersectionMembers: [(0, exports.getType)(member, context)],
            };
        }
        if ((0, openapi3_ts_1.isSchemaObject)(member)) {
            const { mergedSchema, isColliding } = mergeSchemas(acc.mergedSchema, member);
            return {
                ...acc,
                mergedSchema,
                isWritableWithIntersection: acc.isWritableWithIntersection && !isColliding,
                intersectionMembers: [
                    ...acc.intersectionMembers,
                    (0, exports.getType)(member, context),
                ],
            };
        }
        if ((0, openapi3_ts_1.isReferenceObject)(member)) {
            const referenceSchema = (0, getReferenceSchema_1.getReferenceSchema)(member.$ref, context.openAPIDocument);
            const { mergedSchema, isColliding } = mergeSchemas(acc.mergedSchema, referenceSchema);
            return {
                ...acc,
                isWritableWithIntersection: acc.isWritableWithIntersection && !isColliding,
                isSchemaObjectOnly: false,
                mergedSchema,
                intersectionMembers: [
                    ...acc.intersectionMembers,
                    (0, exports.getType)(member, context),
                ],
            };
        }
        return acc;
    }, initialValue);
    if (isSchemaObjectOnly) {
        return (0, exports.getType)(mergedSchema, context);
    }
    if (isWritableWithIntersection) {
        return typescript_1.factory.createIntersectionTypeNode(intersectionMembers);
    }
    return (0, exports.getType)(mergedSchema, context);
};
/**
 * Merge two schema objects
 *
 * @param a
 * @param b
 * @returns the merged schema and a flag to know if the schema was colliding
 */
const mergeSchemas = (a, b) => {
    if (Boolean(a.type) && Boolean(b.type) && a.type !== b.type) {
        return {
            mergedSchema: {
                ...(0, lodash_1.merge)(a, b),
                ["x-openapi-codegen"]: {
                    type: "never",
                },
            },
            isColliding: true,
        };
    }
    if (a.properties && b.properties) {
        let isColliding = false;
        const properties = Object.entries(a.properties).reduce((mergedProperties, [key, propertyA]) => {
            const propertyB = b.properties?.[key];
            if (propertyB) {
                isColliding = true;
            }
            if (propertyB &&
                (0, openapi3_ts_1.isSchemaObject)(propertyB) &&
                (0, openapi3_ts_1.isSchemaObject)(propertyA) &&
                Boolean(propertyB.type) &&
                Boolean(propertyA.type) &&
                propertyA.type !== propertyB.type) {
                return {
                    ...mergedProperties,
                    [key]: {
                        ...propertyA,
                        ...propertyB,
                        ["x-openapi-codegen"]: {
                            type: "never",
                        },
                    },
                };
            }
            return { ...mergedProperties, [key]: propertyA };
        }, {});
        return {
            mergedSchema: {
                ...(0, lodash_1.merge)({}, a, b),
                properties: (0, lodash_1.merge)({}, properties, b.properties),
            },
            isColliding,
        };
    }
    let isColliding = false;
    if (a.required &&
        b.properties &&
        (0, lodash_1.intersection)(a.required, Object.keys(b.properties)).length > 0) {
        isColliding = true;
    }
    if (a.properties &&
        b.required &&
        (0, lodash_1.intersection)(b.required, Object.keys(a.properties)).length > 0) {
        isColliding = true;
    }
    return { mergedSchema: (0, lodash_1.merge)({}, a, b), isColliding };
};
const keysToExpressAsJsDocProperty = [
    "minimum",
    "maximum",
    "default",
    "minLength",
    "maxLength",
    "format",
    "pattern",
    "example",
    "examples",
    "multipleOf",
    "exclusiveMaximum",
    "exclusiveMinimum",
    "maxLength",
    "maxItems",
    "minItems",
    "uniqueItems",
    "maxProperties",
    "minProperties",
    "deprecated",
];
/**
 * Get JSDocComment from an OpenAPI Schema.
 *
 * @param schema
 * @param context
 * @returns JSDoc node
 */
const getJSDocComment = (schema, context) => {
    // `allOf` can add some documentation to the schema, let’s merge all items as first step
    const schemaWithAllOfResolved = schema.allOf
        ? schema.allOf.reduce((mem, allOfItem) => {
            if ((0, openapi3_ts_1.isReferenceObject)(allOfItem)) {
                const referenceSchema = (0, getReferenceSchema_1.getReferenceSchema)(allOfItem.$ref, context.openAPIDocument);
                return mergeSchemas(mem, referenceSchema).mergedSchema;
            }
            else {
                return mergeSchemas(mem, allOfItem).mergedSchema;
            }
        }, schema)
        : schema;
    const getJsDocIdentifier = (value) => {
        const multilineEndChar = "*/";
        if (typeof value === "string" && !value.includes(multilineEndChar)) {
            return typescript_1.factory.createIdentifier(value);
        }
        if (typeof value === "object" &&
            !JSON.stringify(value).includes(multilineEndChar)) {
            return typescript_1.factory.createIdentifier(JSON.stringify(value));
        }
        if (typeof value === "boolean" || typeof value === "number") {
            return typescript_1.factory.createIdentifier(value.toString());
        }
        // Value is not stringifiable
        // See https://github.com/fabien0102/openapi-codegen/issues/36, https://github.com/fabien0102/openapi-codegen/issues/57
        return typescript_1.factory.createIdentifier("[see original specs]");
    };
    const propertyTags = [];
    Object.entries(schemaWithAllOfResolved)
        .filter(([key, value]) => keysToExpressAsJsDocProperty.includes(key) ||
        (/^x-/.exec(key) && typeof value !== "object"))
        .forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((v) => propertyTags.push(typescript_1.factory.createJSDocPropertyTag(typescript_1.factory.createIdentifier((0, pluralize_1.singular)(key)), getJsDocIdentifier(v), false)));
        }
        else if (typeof value !== "undefined") {
            propertyTags.push(typescript_1.factory.createJSDocPropertyTag(typescript_1.factory.createIdentifier(key), getJsDocIdentifier(value), false));
        }
    });
    if (schemaWithAllOfResolved.description || propertyTags.length > 0) {
        return typescript_1.factory.createJSDocComment(schemaWithAllOfResolved.description
            ? schemaWithAllOfResolved.description.trim() +
                (propertyTags.length ? "\n" : "")
            : undefined, propertyTags);
    }
    return undefined;
};
exports.getJSDocComment = getJSDocComment;
/**
 * Add js comment to a node (mutate the original node).
 *
 * We need to do this because JSDoc are not part of Typescript AST.
 *
 * @param node
 * @param jsDocComment
 */
const addJSDocToNode = (node, jsDocComment) => {
    const sourceFile = typescript_1.default.createSourceFile("index.ts", "", typescript_1.default.ScriptTarget.Latest);
    const printer = typescript_1.default.createPrinter({
        newLine: typescript_1.default.NewLineKind.LineFeed,
        removeComments: false,
    });
    const jsDocString = printer
        .printNode(typescript_1.default.EmitHint.Unspecified, jsDocComment, sourceFile)
        .replace(/^( )*(\/\*)?\*?( *)/g, "") // Remove opening comment notations
        .replace("*/", ""); // Remove closing comment notation
    typescript_1.default.addSyntheticLeadingComment(node, typescript_1.default.SyntaxKind.MultiLineCommentTrivia, "*" + jsDocString, // https://github.com/microsoft/TypeScript/issues/17146
    true);
};
/**
 * Get IndexSignatureDeclaration from `schema.additionalProperties`.
 *
 * @param schema
 * @param context
 * @returns Index signature node
 */
const getAdditionalProperties = (schema, context) => {
    if (!schema.additionalProperties)
        return undefined;
    return typescript_1.factory.createIndexSignature(undefined, [
        typescript_1.factory.createParameterDeclaration(undefined, undefined, typescript_1.factory.createIdentifier("key"), undefined, typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.StringKeyword), undefined),
    ], schema.additionalProperties === true ||
        Object.keys(schema.additionalProperties).length === 0
        ? typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.AnyKeyword)
        : (0, exports.getType)(schema.additionalProperties, context));
};
//# sourceMappingURL=schemaToTypeAliasDeclaration.js.map