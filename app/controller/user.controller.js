const db = require('../database/db');
const Bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const sendOTPToEmail = require('../middleware/otpSend');
const logger = require('../services/logger');
const { HandleResponse } = require('../services/errorHandle');
const { GeneralError, BadRequest } = require('../utils/error');
const { response } = require('../utils/enum');
const { StatusCodes } = require('http-status-codes');
const message = require('../utils/message');
const { GeneralResponse } = require('../utils/responce');
const {
  registration_Validation,
  login_validation,
  update_Validation,
  updatePassword_Validation,
  emailValidate,
  otp_validate,
  forgotPassword_validate,
} = require('../validation/userValidation');

module.exports = {
  registration: async (req, res) => {
    try {
      const { email, password, image, ...rest } = req.body;
      const { error } = registration_Validation.validate(req.body);

      if (error) {
        logger.error(message.VALIDATION_ERROR);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            message.VALIDATION_ERROR,
            undefined,
            error.details[0].message
          )
        );
      }

      const existingUser = await db.userModel.findOne({ where: { email } });

      if (existingUser) {
        logger.error(`User ${message.ALREADY_EXIST}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            `User ${message.ALREADY_EXIST}`,
            undefined
          )
        );
      }

      const salt = await Bcrypt.genSalt(10);
      const hashedPassword = await Bcrypt.hash(password, salt);

      const user = await db.userModel.create({
        email,
        password: hashedPassword,
        ...rest,
      });

      if (image) {
        await db.Imagies.create({
          userId: user.id,
          imagePath: image,
        });
      }

      logger.info(message.REGISTER_SUCCESS);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.CREATED,
          message.RESPONSE_SUCCESS,
          { id: user.id }
        )
      );
    } catch (error) {
      logger.error(error);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
          undefined,
          error.message || error
        )
      );
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const { error } = login_validation.validate(req.body);

      if (error) {
        logger.error(message.VALIDATION_ERROR);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            message.VALIDATION_ERROR,
            undefined,
            error.details[0].message
          )
        );
      }

      const user = await db.userModel.findOne({ where: { email } });

      if (!user) {
        logger.error(`User ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `User ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      const isPasswordCorrect = await Bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
        logger.error(message.INVALID_CREDENTIALS_PASS);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.UNAUTHORIZED,
            message.INVALID_CREDENTIALS_PASS,
            undefined
          )
        );
      }

      const secret = process.env.JWT_SECRET_KEY;
      const token = jwt.sign({ id: user.id, email: user.email }, secret, {
        expiresIn: '5d',
      });

      logger.info(message.LOGIN_SUCCESS);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          message.LOGIN_SUCCESS,
          { token }
        )
      );
    } catch (error) {
      logger.error(error);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
          undefined,
          error.message || error
        )
      );
    }
  },

  commanFileUpload: async (req, res) => {
    try {
      if (!req.file) {
        logger.error(message.FILE_NOT_FOUND);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            message.FILE_NOT_FOUND,
            undefined
          )
        );
      }

      let image = req.file.filename;

      logger.info(`Image ${message.ADD_SUCCESS}`);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `Image ${message.ADD_SUCCESS}`,
          { imagePath: image }
        )
      );
    } catch (error) {
      logger.error(error.message);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
          undefined,
          error.message || error
        )
      );
    }
  },

  getListOfUser: async (req, res) => {
    try {
      const {page, data, sortBy, orderBy = "asc", search } = req.body;
      const users = await db.userModel.findAll({
        include: {
          model: db.Imagies,
          as: "imagies",
          attributes: ["imagePath"],
        }
      });
      let filteredUser = users;

      if (!users) {
        logger.error(`Users ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Users ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filteredUser = users.filter((user) => {
          return user.email.toLowerCase().includes(searchLower) ||
            user.firstName.toLowerCase().includes(searchLower) ||
            user.lastName.toLowerCase().includes(searchLower);
        });
      }

      if (sortBy && filteredUser.length > 0) {
        filteredUser.sort((a, b) => {
          if (orderBy === "desc") {
            return b[sortBy] > a[sortBy] ? 1 : -1;
          } else {
            return a[sortBy] > b[sortBy] ? 1 : -1;
          }
        });
      }

      let StartIndex = (page - 1) * data;
      let EndIndex = StartIndex + data;
      const show = filteredUser.slice(StartIndex, EndIndex);


      logger.info(`Users ${message.GET_SUCCESS}`);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.OK,
          `Users ${message.GET_SUCCESS}`,
          { users: show }
        )
      );
    } catch (error) {
      logger.error(error.message);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
          undefined,
          error.message || error
        )
      );
    }
  },

  viewProfile: async (req, res) => {
    try {
      const { id } = req.user_data;
      const user = await db.userModel.findOne({
        where: { id },
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        logger.error(`User ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `User ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      return res
        .status(200)
        .json(
          HandleResponse(
            response.RESPONSE_SUCCESS,
            StatusCodes.OK,
            `User ${message.GET_SUCCESS}`,
            { user }
          )
        );
    } catch (error) {
      logger.error(error);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
          undefined,
          error.message || error
        )
      );
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { id } = req.user_data;
      const { firstName, lastName, hobby, gender, phone, image } = req.body;
      const { error } = update_Validation.validate({
        id,
        firstName,
        lastName,
        hobby,
        gender,
        phone,
        image,
      });

      if (error) {
        logger.error(message.VALIDATION_ERROR);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            message.VALIDATION_ERROR,
            undefined,
            error.details[0].message
          )
        );
      }

      if (!firstName && !lastName && !hobby && !gender && !phone && !image) {
        logger.error(message.AT_LEAST_ONE);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            message.AT_LEAST_ONE,
            undefined
          )
        );
      }

      const findUser = await db.userModel.findOne({ where: { id } });

      if (!findUser) {
        logger.error(`User ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `User ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      await db.userModel.update(
        {
          firstName: firstName || findUser.firstName,
          lastName: lastName || findUser.lastName,
          hobby: hobby || findUser.hobby,
          gender: gender || findUser.gender,
          phone: phone || findUser.phone,
          image: image || findUser.image,
        },
        { where: { id: findUser.id } }
      );

      const updatedUser = await db.userModel.findOne({
        where: { id: findUser.id },
      });

      if (image) {
        await db.Imagies.upsert({
          userId: findUser.id,
          imagePath: image,
        });
      }

      logger.info(`User ${message.UPDATED_SUCCESS}`);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `User ${message.UPDATED_SUCCESS}`,
          undefined
        )
      );
    } catch (error) {
      logger.error(error);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
          undefined,
          error.message || error
        )
      );
    }
  },

  updatePassword: async (req, res) => {
    try {
      const { id } = req.user_data;
      const { newPassword, confirmNewPassword } = req.body;
      const { error } = updatePassword_Validation.validate({
        id,
        newPassword,
        confirmNewPassword,
      });

      if (error) {
        logger.error(message.VALIDATION_ERROR);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            message.VALIDATION_ERROR,
            undefined,
            error.details[0].message
          )
        );
      }

      const user = await db.userModel.findOne({ where: { id } });

      if (!user) {
        logger.error(`User ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `User ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      const salt = await Bcrypt.genSalt(10);
      const hashedPassword = await Bcrypt.hash(newPassword, salt);

      await db.userModel.update(
        { password: hashedPassword },
        { where: { id: user.id } }
      );

      logger.info(`Password ${message.UPDATED_SUCCESS}`);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `Password ${message.UPDATED_SUCCESS}`,
          undefined
        )
      );
    } catch (error) {
      logger.error(error);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
          undefined,
          error.message || error
        )
      );
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const { email } = req.body;
      const { error } = emailValidate.validate({ email });

      if (error) {
        logger.error(message.VALIDATION_ERROR);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            message.VALIDATION_ERROR,
            undefined,
            error.details[0].message
          )
        );
      }

      const user = await db.userModel.findOne({ where: { email } });

      if (!user) {
        logger.error(`User ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `User ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      await sendOTPToEmail(user.email);

      logger.info(`${message.OTP_SENT} Email`);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `${message.OTP_SENT} Email`,
          undefined
        )
      );
    } catch (error) {
      logger.error(error);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.OTP_ERROR,
          undefined,
          error.message || error
        )
      );
    }
  },

  verifyOTP: async (req, res) => {
    try {
      const { otp, email } = req.body;
      const { error } = otp_validate.validate(req.body);

      if (error) {
        logger.error(message.VALIDATION_ERROR);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            message.VALIDATION_ERROR,
            undefined,
            error.details[0].message
          )
        );
      }

      const user = await db.userModel.findOne({ where: { email } });

      if (!user) {
        logger.error(`User ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `User ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      const otp_user = await db.OTPS.findOne({ where: { email } });

      if (!otp_user) {
        await db.OTPS.destroy({ where: { email } });
        logger.error(message.OTP_EXPIRED);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            message.OTP_EXPIRED,
            undefined
          )
        );
      }

      if (otp_user.otp !== otp) {
        await db.OTPS.destroy({ where: { email } });
        logger.error(message.OTP_INVALID);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            message.OTP_INVALID,
            undefined
          )
        );
      }

      const currentTime = new Date();

      if (otp_user.expiresAt < currentTime) {
        await db.OTPS.destroy({ where: { email } });
        logger.error(message.OTP_EXPIRED);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            message.OTP_EXPIRED,
            undefined
          )
        );
      }

      await db.OTPS.destroy({ where: { email } });
      logger.info(`OTP ${message.OTP_VERIFIED_SUCCESS}`);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `OTP ${message.OTP_VERIFIED_SUCCESS}`,
          undefined
        )
      );
    } catch (error) {
      logger.error(error);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
          undefined,
          error.message || error
        )
      );
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email, newPassword, confirmNewPassword } = req.body;
      const { error } = forgotPassword_validate.validate(req.body);

      if (error) {
        logger.error(message.VALIDATION_ERROR);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            message.VALIDATION_ERROR,
            undefined,
            error.details[0].message
          )
        );
      }

      const user = await db.userModel.findOne({ where: { email } });

      if (!user) {
        logger.error(`User ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `User ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      await db.userModel.update(
        { password: newPassword },
        { where: { email: user.email } }
      );

      logger.info(`Password ${message.UPDATED_SUCCESS}`);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `Password ${message.UPDATED_SUCCESS}`,
          undefined
        )
      );
    } catch (error) {
      logger.error(error);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
          undefined,
          error.message || error
        )
      );
    }
  },
};
