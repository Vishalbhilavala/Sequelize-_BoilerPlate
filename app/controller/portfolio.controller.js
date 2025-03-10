const db = require('../database/db');
require('dotenv').config();
const logger = require('../services/logger');
const { HandleResponse } = require('../services/errorHandle');
const { response } = require('../utils/enum');
const { StatusCodes } = require('http-status-codes');
const message = require('../utils/message');
const { portfolioValidate } = require('../validation/portfolioValidation');
const e = require('cors');

module.exports = {
  createPortfolio: async (req, res) => {
    try {
      const { category_id, product_name, description, image } = req.body;
      const { error } = portfolioValidate.validate(req.body);

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

      const portfolio = await db.Portfolio.create({
        category_id,
        product_name,
        description,
        image,
      });

      if (image) {
        await db.Imagies.create({
          portfolioId: portfolio.id,
          image,
        });
      }

      logger.info(message.ADD_SUCCESS);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          message.ADD_SUCCESS,
          { Id: portfolio.id }
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
};
