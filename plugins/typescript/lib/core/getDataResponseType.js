"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataResponseType = void 0;
const tslib_1 = require("tslib");
const typescript_1 = tslib_1.__importStar(require("typescript"));
const openapi3_ts_1 = require("openapi3-ts");
const lodash_1 = require("lodash");
const case_1 = require("case");
const findCompatibleMediaType_1 = require("./findCompatibleMediaType");
const schemaToTypeAliasDeclaration_1 = require("./schemaToTypeAliasDeclaration");
/**
 * Extract types from success responses (2xx)
 */
const getDataResponseType = ({ responses, components, printNodes, }) => {
    const responseTypes = (0, lodash_1.uniqBy)(Object.entries(responses).reduce((mem, [statusCode, response]) => {
        if (!statusCode.startsWith("2"))
            return mem;
        if ((0, openapi3_ts_1.isReferenceObject)(response)) {
            const [hash, topLevel, namespace, name] = response.$ref.split("/");
            if (hash !== "#" || topLevel !== "components") {
                throw new Error("This library only resolve $ref that are include into `#/components/*` for now");
            }
            if (namespace !== "responses") {
                throw new Error("$ref for responses must be on `#/components/responses`");
            }
            return [
                ...mem,
                typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createQualifiedName(typescript_1.factory.createIdentifier("Responses"), typescript_1.factory.createIdentifier((0, case_1.pascal)(name))), undefined),
            ];
        }
        const mediaType = (0, findCompatibleMediaType_1.findCompatibleMediaType)(response);
        if (!mediaType || !mediaType.schema)
            return mem;
        return [
            ...mem,
            (0, schemaToTypeAliasDeclaration_1.getType)(mediaType.schema, {
                currentComponent: null,
                openAPIDocument: { components },
            }),
        ];
    }, []), (node) => printNodes([node]));
    return responseTypes.length === 0
        ? typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.UndefinedKeyword)
        : responseTypes.length === 1
            ? responseTypes[0]
            : typescript_1.factory.createUnionTypeNode(responseTypes);
};
exports.getDataResponseType = getDataResponseType;
//# sourceMappingURL=getDataResponseType.js.map