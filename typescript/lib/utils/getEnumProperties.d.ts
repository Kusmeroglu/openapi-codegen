import { SchemaObject } from "openapi3-ts";
/**
 * Extracts all the properties with enum values from an array of schema objects.
 * @param schemaArray An array of OpenAPI schema objects
 * @returns A tuple array containing the property names with enum values and their corresponding schema objects
 */
export declare const getEnumProperties: (schemaArray: SchemaObject[]) => [string, SchemaObject][];
export declare const convertNumberToWord: (n: number) => string;
