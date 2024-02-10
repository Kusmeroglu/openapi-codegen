import { OperationObject } from "openapi3-ts";
import ts from "typescript";
/**
 * Create the declaration of the fetcher function.
 *
 * @returns Array of nodes
 */
export declare const createOperationFetcherFnNodes: ({ dataType, errorType, requestBodyType, queryParamsType, pathParamsType, headersType, variablesType, fetcherFn, operation, url, verb, name, }: {
    dataType: ts.TypeNode;
    errorType: ts.TypeNode;
    requestBodyType: ts.TypeNode;
    headersType: ts.TypeNode;
    pathParamsType: ts.TypeNode;
    queryParamsType: ts.TypeNode;
    variablesType: ts.TypeNode;
    operation: OperationObject;
    fetcherFn: string;
    url: string;
    verb: string;
    name: string;
}) => ts.Node[];
