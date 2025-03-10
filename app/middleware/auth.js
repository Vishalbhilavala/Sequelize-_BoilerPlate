const jwt = require('jsonwebtoken');
const message = require('../utils/message');
const logger = require('../services/logger');
const { StatusCodes } = require('http-status-codes');
const { response } = require('../utils/enum');
require('dotenv').config();

module.exports = {
  auth: (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
      logger.error(message.INVALID_CREDENTIALS_PASS);
      return res.status(200).json({
        statusCode: StatusCodes.NOT_FOUND,
        status: response.RESPONSE_ERROR,
        message: message.INVALID_CREDENTIALS_PASS,
      });
    }

    const secret = process.env.JWT_SECRET_KEY;
    
    try {
      const token_validation = jwt.verify(token, secret);
      req.user_data = token_validation;
      next();
    } catch (error) {
      logger.error(error);
      return res.status(400).json({
        statusCode: StatusCodes.BAD_REQUEST,
        status: response.RESPONSE_ERROR,
        error: error,
      });
    }
  },
};
