"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUtils = void 0;
const getErrorResponseType_1 = require("../core/getErrorResponseType");
const getUtils = () => `type ComputeRange<
 N extends number,
 Result extends Array<unknown> = []
> = Result["length"] extends N
 ? Result
 : ComputeRange<N, [...Result, Result["length"]]>;

export type ${getErrorResponseType_1.clientErrorStatus} = Exclude<ComputeRange<500>[number], ComputeRange<400>[number]>;
export type ${getErrorResponseType_1.serverErrorStatus} = Exclude<ComputeRange<600>[number], ComputeRange<500>[number]>;`;
exports.getUtils = getUtils;
//# sourceMappingURL=utils.js.map