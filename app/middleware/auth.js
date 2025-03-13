const jwt = require('jsonwebtoken');
const message = require('../utils/message');
const logger = require('../services/logger');
const { StatusCodes } = require('http-status-codes');
const { response } = require('../utils/enum');
const { HandleResponse } = require('../services/errorHandle');
require('dotenv').config();

module.exports = {
  auth: (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
      logger.error(message.INVALID_CREDENTIALS_PASS);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.NOT_FOUND,
          message.INVALID_CREDENTIALS_PASS,
          undefined
        )
      );
    }

    const secret = process.env.JWT_SECRET_KEY;

    try {
      const token_validation = jwt.verify(token, secret);
      req.user_data = token_validation;
      next();
    } catch (error) {
      logger.error(error.message || error);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.BAD_REQUEST,
          error || error.message,
          undefined
        )
      );
    }
  },
};
