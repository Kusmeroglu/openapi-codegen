import ts from "typescript";
/**
 * Generate the needed imports regarding the generated nodes usage.
 *
 * @param nodes generated nodes
 * @param files files path for dependencies
 */
export declare const getUsedImports: (nodes: ts.Node[], files: {
    requestBodies: string;
    schemas: string;
    parameters: string;
    responses: string;
    utils: string;
}) => {
    keys: string[];
    nodes: ts.Node[];
};
