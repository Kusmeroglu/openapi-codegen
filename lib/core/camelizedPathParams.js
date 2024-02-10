"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.camelizedPathParams = void 0;
const case_1 = require("case");
/**
 * Transform url params case to camel.
 *
 * @example
 * `pet/{pet_id}` -> `pet/{petId}`
 */
const camelizedPathParams = (url) => url.replace(/\{[\w\d\-_.]*\}/g, (match) => `{${(0, case_1.camel)(match)}}`);
exports.camelizedPathParams = camelizedPathParams;
//# sourceMappingURL=camelizedPathParams.js.map