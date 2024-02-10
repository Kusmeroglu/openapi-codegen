"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findCompatibleMediaType = void 0;
/**
 * Returns the first compatible media type.
 *
 * @param requestBodyOrResponseObject
 * @returns
 */
const findCompatibleMediaType = (requestBodyOrResponseObject) => {
    if (!requestBodyOrResponseObject.content)
        return;
    for (let contentType of Object.keys(requestBodyOrResponseObject.content)) {
        if (contentType.startsWith("*/*") ||
            contentType.startsWith("application/json") ||
            contentType.startsWith("application/octet-stream") ||
            contentType.startsWith("multipart/form-data")) {
            return requestBodyOrResponseObject.content[contentType];
        }
    }
};
exports.findCompatibleMediaType = findCompatibleMediaType;
//# sourceMappingURL=findCompatibleMediaType.js.map