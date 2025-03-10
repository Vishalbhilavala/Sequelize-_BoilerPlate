const joi = require('joi');

const portfolioValidate = joi.object({
    category_id: joi.number().empty().required().messages({
        "number.base": "category id must be a number.",
        "number.empty": "category id cannot be empty.",
        "any.required": "category id is a required field.",
    }),
    product_name: joi.string().empty().required().messages({
        "string.base": "product name must be a string.",
        "string.empty": "product name cannot be empty.",
        "any.required": "product name is a required field.",
    }),
    description: joi.string().empty().messages({
        "string.base": "description must be a string.",
        "string.empty": "description cannot be empty.",
    }),
    image: joi.string().empty().messages({
        "string.base": "image must be a string.",
        "string.empty": "image cannot be empty.",
    }),
});

module.exports =  { portfolioValidate }