const joi = require('joi')

const categoryValidate = joi.object({
    category_name: joi.string().empty().required().messages({
        "string.base": "category name must be a string.",
        "string.empty": "category name cannot be empty.",
        "any.required": "category name is a required field.",
    }),
});

module.exports =  { categoryValidate }