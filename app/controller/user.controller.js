const db = require('../database/db');
require('dotenv').config();
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const sendOTPToEmail = require('../middleware/otpSend');
const logger = require('../services/logger');
const { HandleResponse } = require('../services/errorHandle');
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
      const { password, ...rest } = req.body;

      const { error } = registration_Validation.validate(req.body);

      if (error) {
        logger.error(error.details[0].message);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            error.details[0].message,
            undefined
          )
        );
      }

      const existingUser = await db.userModel.findOne({
        where: { email: req.body.email },
      });

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

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await db.userModel.create({
        password: hashedPassword,
        ...rest,
      });

      if (req.body.image) {
        await db.Imagies.create({
          userId: user.id,
          imagePath: req.body.image,
        });
      }

      logger.info(message.REGISTER_SUCCESS);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.CREATED,
          message.REGISTER_SUCCESS,
          { id: user.id }
        )
      );
    } catch (error) {
      logger.error(error.message || error);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          error.message || error,
          undefined
        )
      );
    }
  },

  login: async (req, res) => {
    try {
      const { error } = login_validation.validate(req.body);

      if (error) {
        logger.error(error.details[0].message);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            error.details[0].message,
            undefined
          )
        );
      }

      const user = await db.userModel.findOne({
        where: { email: req.body.email },
      });

      if (!user) {
        logger.error(`Email ${message.NOT_EXIST}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Email ${message.NOT_EXIST}`,
            undefined
          )
        );
      }

      const isPasswordCorrect = await bcrypt.compare(
        req.body.password,
        user.password
      );

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
      logger.error(error.message || error);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          error.message || error,
          undefined
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
      logger.error(error.message || error);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          error.message || error,
          undefined
        )
      );
    }
  },

  getListOfUser: async (req, res) => {
    try {
      const { page, limit, sortBy, orderBy, searchTerm } = req.body;
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
      const offset = (pageNumber - 1) * limitNumber;

      let filterOperation = {};

      if (searchTerm) {
        filterOperation = {
          [db.Sequelize.Op.or]: [
            { firstName: { [db.Sequelize.Op.like]: `%${searchTerm}%` } },
            { lastName: { [db.Sequelize.Op.like]: `%${searchTerm}%` } },
            { email: { [db.Sequelize.Op.like]: `%${searchTerm}%` } },
            { phone: { [db.Sequelize.Op.like]: `%${searchTerm}%` } },
          ],
        };
      }

      const users = await db.userModel.findAll({
        where: {
          ...filterOperation,
        },
        offset: offset,
        limit: limitNumber,
        order: [[sortBy, orderBy]],
        include: {
          model: db.Imagies,
          as: 'imagies',
          attributes: ['imagePath'],
        },
      });

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

      logger.info(`Users ${message.GET_SUCCESS}`);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          undefined,
          { users }
        )
      );
    } catch (error) {
      logger.error(error.message || error);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          error.message || error,
          undefined
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

      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          undefined,
          { user }
        )
      );
    } catch (error) {
      logger.error(error);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          error.message || error,
          undefined
        )
      );
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { id } = req.user_data;

      const { error } = update_Validation.validate(req.body);

      if (error) {
        logger.error(error.details[0].message);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            error.details[0].message,
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

      await db.userModel.update(req.body, { where: { id: findUser.id } });

      const updatedUser = await db.userModel.findOne({
        where: { id: findUser.id },
      });

      if (req.body.image) {
        const image = await db.Imagies.findOne({ where: { userId: updatedUser.id } });
        if(image){
          await db.Imagies.update(
            { imagePath: req.body.image },
            { where: { userId: updatedUser.id } }
          );
        }else{
          await db.Imagies.create({
            userId: updatedUser.id,
            imagePath: req.body.image,
          });
        }
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
          error.message || error,
          undefined,
        )
      );
    }
  },

  updatePassword: async (req, res) => {
    try {
      const { id } = req.user_data;

      const { error } = updatePassword_Validation.validate(req.body);

      if (error) {
        logger.error(error.details[0].message);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            error.details[0].message,
            undefined,
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

      const isPasswordCorrect = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );

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

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

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
          error.message || error,
          undefined,
        )
      );
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const { error } = emailValidate.validate(req.body);

      if (error) {
        logger.error(error.details[0].message);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            error.details[0].message,
            undefined,
          )
        );
      }

      const user = await db.userModel.findOne({
        where: { email: req.body.email },
      });

      if (!user) {
        logger.error(`Email ${message.NOT_EXIST}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Email ${message.NOT_EXIST}`,
            undefined
          )
        );
      }

      await sendOTPToEmail(user.email);

      logger.info(`${message.OTP_SENT} Email: ${user.email}`);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `${message.OTP_SENT} Email: ${user.email}`,
          undefined
        )
      );
    } catch (error) {
      logger.error(error);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          error.message || error,
          undefined,
        )
      );
    }
  },

  verifyOTP: async (req, res) => {
    try {
      const { error } = otp_validate.validate(req.body);

      if (error) {
        logger.error(error.details[0].message);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            error.details[0].message,
            undefined,
          )
        );
      }

      const user = await db.userModel.findOne({
        where: { email: req.body.email },
      });

      if (!user) {
        logger.error(`Email ${message.NOT_EXIST}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Email ${message.NOT_EXIST}`,
            undefined
          )
        );
      }

      const otpData = await db.OTPS.findOne({ where: { email: user.email } });

      if (!otpData) {
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

      if (otpData.otp !== req.body.otp) {
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

      if (otpData.expiresAt < currentTime) {
        await db.OTPS.destroy({ where: { email: user.email } });
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

      await db.OTPS.destroy({ where: { email: user.email } });
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
          error.message || error,
          undefined,
        )
      );
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { error } = forgotPassword_validate.validate(req.body);

      if (error) {
        logger.error(error.details[0].message);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            error.details[0].message,
            undefined,
          )
        );
      }

      const user = await db.userModel.findOne({
        where: { email: req.body.email },
      });

      if (!user) {
        logger.error(`Email ${message.NOT_EXIST}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Email ${message.NOT_EXIST}`,
            undefined
          )
        );
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

      await db.userModel.update(
        { password: hashedPassword },
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
      logger.error(error.message || error);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          error.message || error,
          undefined,
        )
      );
    }
  },
};
