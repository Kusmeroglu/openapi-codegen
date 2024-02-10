"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReferenceSchema = void 0;
const lodash_1 = require("lodash");
const openapi3_ts_1 = require("openapi3-ts");
/**
 * Get the SchemaObject from a $ref.
 *
 * @param $ref Path of the reference
 * @param context Context
 * @returns The resolved SchemaObject
 */
const getReferenceSchema = ($ref, openAPIDocument) => {
    const [hash, ...refPath] = $ref.split("/");
    if (hash !== "#") {
        throw new Error("This library only resolve local $ref");
    }
    // NOTE: this is a fix for schema names that have '.' characters in them
    // if passed directly to lodash.get they are treated as path traversals instead of a literal schema name
    // get the last element of the refPath, [0] = 'components', [1] = 'schemas'
    const directSchemaName = refPath.at(-1);
    // try a direct access of the name from the schemas object
    const defaultDirectSearch = openAPIDocument.components?.schemas && openAPIDocument.components.schemas[directSchemaName];
    // try to perform the typical ref path search but use the direct search as a fallback
    const referenceSchema = (0, lodash_1.get)(openAPIDocument, refPath.join("."), defaultDirectSearch);
    // if neither ref path nor direct search find the schema then throw that the ref cant be found
    if (!referenceSchema) {
        throw new Error(`${$ref} not found!`);
    }
    if ((0, openapi3_ts_1.isReferenceObject)(referenceSchema)) {
        return (0, exports.getReferenceSchema)(referenceSchema.$ref, openAPIDocument);
    }
    if (!(0, openapi3_ts_1.isSchemaObject)(referenceSchema)) {
        throw new Error(`${$ref} can’t be resolved`);
    }
    return referenceSchema;
};
exports.getReferenceSchema = getReferenceSchema;
//# sourceMappingURL=getReferenceSchema.js.map