import { SchemaObject } from "openapi3-ts";
import ts from "typescript";
import { Context } from "./schemaToTypeAliasDeclaration";
/**
 * Add Enum support when transforming an OpenAPI Schema Object to Typescript Nodes.
 *
 * @param name Name of the schema
 * @param schema OpenAPI Schema object
 * @param context Context
 */
export declare const schemaToEnumDeclaration: (name: string, schema: SchemaObject, context: Context) => ts.Node[];
