"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertNumberToWord = exports.getEnumProperties = void 0;
const case_1 = require("case");
/**
 * Extracts all the properties with enum values from an array of schema objects.
 * @param schemaArray An array of OpenAPI schema objects
 * @returns A tuple array containing the property names with enum values and their corresponding schema objects
 */
const getEnumProperties = (schemaArray) => {
    const enumProperties = [];
    schemaArray.forEach((schemaObj) => {
        const name = schemaObj[0];
        const schema = schemaObj[1];
        if (schema.enum) {
            enumProperties.push([name, schema]);
        }
        else if (schema.type === "object" && schema.properties) {
            Object.entries(schema.properties).forEach(([propertyName, propertySchema]) => {
                processProperty(enumProperties, `${name}${(0, case_1.pascal)(propertyName)}`, propertySchema);
            });
        }
    });
    return enumProperties;
};
exports.getEnumProperties = getEnumProperties;
const processProperty = (enumProperties, propertyName, propertySchema) => {
    if (propertySchema.enum) {
        enumProperties.push([`${(0, case_1.pascal)(propertyName)}`, propertySchema]);
    }
    else if (propertySchema.type === "object" && propertySchema.properties) {
        Object.entries(propertySchema.properties).forEach(([nestedPropertyName, nestedPropertySchema]) => {
            processProperty(enumProperties, `${propertyName}${(0, case_1.pascal)(nestedPropertyName)}`, nestedPropertySchema);
        });
    }
};
const ones = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
];
const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
];
const convertNumberToWord = (n) => {
    if (n < 20) {
        return ones[n];
    }
    const digit = n % 10;
    if (n < 100) {
        return tens[Math.floor(n / 10)] + (digit ? "-" + ones[digit] : "");
    }
    if (n < 1000) {
        const hundred = Math.floor(n / 100);
        const remainder = n % 100;
        return (ones[hundred] +
            " hundred" +
            (remainder ? " " + (0, exports.convertNumberToWord)(remainder) : ""));
    }
    const thousand = Math.floor(n / 1000);
    const remainder = n % 1000;
    return ((0, exports.convertNumberToWord)(thousand) +
        " thousand" +
        (remainder ? " " + (0, exports.convertNumberToWord)(remainder) : ""));
};
exports.convertNumberToWord = convertNumberToWord;
//# sourceMappingURL=getEnumProperties.js.map