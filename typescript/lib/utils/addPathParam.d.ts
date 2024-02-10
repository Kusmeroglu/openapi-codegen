import { OpenAPIObject, PathItemObject } from "openapi3-ts";
/**
 * Util to add a path param to an openAPI operation
 */
export declare const addPathParam: ({ openAPIDocument, pathParam, required, condition, }: {
    /**
     * The openAPI document to transform
     */
    openAPIDocument: OpenAPIObject;
    /**
     * Path param to inject in all requests
     */
    pathParam: string;
    /**
     * If the path param is required
     */
    required: boolean;
    /**
     * Condition to include/exclude the path param
     */
    condition?: ((key: string, pathParam: PathItemObject) => boolean) | undefined;
}) => OpenAPIObject;
