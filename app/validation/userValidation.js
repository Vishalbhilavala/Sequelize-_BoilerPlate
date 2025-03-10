const joi = require('joi');
const { gender } = require('../utils/enum');

const registration_Validation = joi.object({
  firstName: joi.string().empty().required().messages({
    'string.base': 'firstName must be a string.',
    'string.empty': 'firstName cannot be empty.',
    'any.required': 'firstName is required.',
  }),

  lastName: joi.string().empty().required().messages({
    'string.base': 'lastName must be a string.',
    'string.empty': 'lastName cannot be empty.',
    'any.required': 'lastName is required.',
  }),

  hobby: joi.string().empty().messages({
    'string.base': 'hobby must be a string.',
    'string.empty': 'hobby cannot be empty.',
  }),

  gender: joi
    .string()
    .empty()
    .valid(gender.MALE, gender.FEMALE, gender.OTHER)
    .required()
    .messages({
      'string.base': 'gender must be a string.',
      'string.empty': 'gender cannot be empty.',
      'any.only': `Gender must be one of the following values: ${gender.MALE}, ${gender.FEMALE}, ${gender.OTHER}.`,
      'any.required': 'gender is required.',
    }),

  email: joi.string().email().empty().required().messages({
    'string.base': 'email must be a string.',
    'string.email': 'email must be a valid email address.',
    'string.empty': 'email cannot be empty.',
    'any.required': 'email is a required.',
  }),

  password: joi.string().empty().required().messages({
    'string.base': 'password must be a string.',
    'string.empty': 'password cannot be empty.',
    'any.required': 'password is a required.',
  }),

  phone: joi
    .string()
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.base': 'Phone number must be a string.',
      'string.pattern.base':
        'Phone number must be numeric and contain only digits.',
      'string.empty': 'Phone number cannot be empty.',
      'any.required': 'Phone number is required.',
    }),
  image: joi.string().empty().messages({
    'string.base': 'image ID must be an string.',
    'string.empty': 'image cannot be empty.',
  }),
});

const login_validation = joi.object({
  email: joi.string().email().empty().required().messages({
    'string.base': 'email must be a string.',
    'string.email': 'email must be a valid email address.',
    'string.empty': 'email cannot be empty.',
    'any.required': 'email is a required.',
  }),

  password: joi.string().empty().required().messages({
    'string.base': 'password must be a string.',
    'string.empty': 'password cannot be empty.',
    'any.required': 'password is a required.',
  }),
});

const update_Validation = joi.object({
  id: joi.number().integer().positive().required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.positive': 'ID must be a positive number',
    'any.required': 'password is a required.',
  }),

  firstName: joi.string().empty().messages({
    'string.base': 'firstName must be a string.',
    'string.empty': 'firstName cannot be empty.',
  }),

  lastName: joi.string().empty().messages({
    'string.base': 'lastName must be a string.',
    'string.empty': 'lastName cannot be empty.',
  }),

  hobby: joi.string().empty().messages({
    'string.base': 'hobby must be a string.',
    'string.empty': 'hobby cannot be empty.',
  }),

  gender: joi
    .string()
    .empty()
    .valid(gender.MALE, gender.FEMALE, gender.OTHER)
    .messages({
      'string.base': 'gender must be a string.',
      'string.empty': 'gender cannot be empty.',
      'any.only': `Gender must be one of the following values: ${gender.MALE}, ${gender.FEMALE}, ${gender.OTHER}.`,
    }),
  phone: joi
    .string()
    .pattern(/^[0-9]+$/)
    .messages({
      'string.base': 'Phone number must be a string.',
      'string.pattern.base':
        'Phone number must be numeric and contain only digits.',
      'string.empty': 'Phone number cannot be empty.',
    }),
  image: joi.string().empty().messages({
    'string.base': 'image ID must be an string.',
    'string.empty': 'image cannot be empty.',
  }),
});

const updatePassword_Validation = joi.object({
  id: joi.number().integer().positive().required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.positive': 'ID must be a positive number',
    'any.required': 'ID is a required.',
  }),
  newPassword: joi.string().empty().required().messages({
    'string.base': 'newPassword must be a string.',
    'string.empty': 'newPassword cannot be empty.',
    'any.required': 'newPassword is a required field.',
  }),
  confirmNewPassword: joi
    .string()
    .empty()
    .required()
    .valid(joi.ref('newPassword'))
    .messages({
      'string.base': 'confirmNewPassword must be a string.',
      'any.only': 'new password and confirmNewPassword must match.',
      'string.empty': 'confirmNewPassword cannot be empty.',
      'any.required': 'confirmNewPassword is a required field.',
    }),
});

const emailValidate = joi.object({
  email: joi.string().email().empty().required().messages({
    'string.base': 'email must be a string.',
    'string.email': 'email must be a valid email address.',
    'string.empty': 'email cannot be empty.',
    'any.required': 'email is a required.',
  }),
});

const otp_validate = joi.object({
  email: joi.string().email().empty().required().messages({
    'string.email': 'invalid email format.',
    'string.empty': 'password cannot be empty.',
    'any.required': 'email is required.',
  }),
  otp: joi.string().empty().required().min(6).message({
    'string.empty': 'OTP is required.',
    'string.min': 'OTP must be 6 characters.',
    'any.required': 'email is required.',
  }),
});
const forgotPassword_validate = joi.object({
  email: joi.string().email().empty().required().messages({
    'string.email': 'invalid email format.',
    'string.empty': 'password cannot be empty.',
    'any.required': 'email is required.',
  }),
  newPassword: joi.string().empty().required().messages({
    'string.base': 'newPassword must be a string.',
    'string.empty': 'newPassword cannot be empty.',
    'any.required': 'newPassword is a required field.',
  }),
  confirmNewPassword: joi
    .string()
    .empty()
    .required()
    .valid(joi.ref('newPassword'))
    .messages({
      'string.base': 'confirmNewPassword must be a string.',
      'any.only': 'new password and confirmNewPassword must match.',
      'string.empty': 'confirmNewPassword cannot be empty.',
      'any.required': 'confirmNewPassword is a required field.',
    }),
});

module.exports = {
  registration_Validation,
  login_validation,
  update_Validation,
  updatePassword_Validation,
  emailValidate,
  otp_validate,
  forgotPassword_validate
};
