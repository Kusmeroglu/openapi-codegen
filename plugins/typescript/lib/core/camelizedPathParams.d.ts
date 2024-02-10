/**
 * Transform url params case to camel.
 *
 * @example
 * `pet/{pet_id}` -> `pet/{petId}`
 */
export declare const camelizedPathParams: (url: string) => string;
