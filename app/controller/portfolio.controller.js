const db = require('../database/db');
require('dotenv').config();
const logger = require('../services/logger');
const { HandleResponse } = require('../services/errorHandle');
const { response } = require('../utils/enum');
const { StatusCodes } = require('http-status-codes');
const message = require('../utils/message');
const {
  portfolioValidate,
  portfolioUpdateValidate,
} = require('../validation/portfolioValidation');

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
      });

      if (image) {
        await db.Imagies.create({
          portfolioId: portfolio.id,
          imagePath: image,
        });
      }

      logger.info(`Portfolio ${message.ADD_SUCCESS}`);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `Portfolio ${message.ADD_SUCCESS}`,
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

  commanFileupload: async (req, res) => {
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

  getListOfPortfolio: async (req, res) => {
    try {
      const { page, data, sortBy, orderBy = 'asc', search } = req.body;
      const portfolio = await db.Portfolio.findAll({
        include: {
          model: db.Imagies,
          as: 'imagies',
          attributes: ['imagePath'],
        },
      });
      let filteredPortfolio = portfolio;

      if (!portfolio) {
        logger.error(`Portfolio ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Portfolio ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filteredPortfolio = portfolio.filter((portfolio) => {
          return portfolio.product_name.toLowerCase().includes(searchLower);
        });
      }

      if (sortBy && filteredPortfolio.length > 0) {
        filteredPortfolio.sort((a, b) => {
          if (orderBy === 'desc') {
            return b[sortBy] > a[sortBy] ? 1 : -1;
          } else {
            return a[sortBy] > b[sortBy] ? 1 : -1;
          }
        });
      }

      let StartIndex = (page - 1) * data;
      let EndIndex = StartIndex + data;

      let portfolioData = filteredPortfolio.slice(StartIndex, EndIndex);

      logger.info(`Portfolio ${message.GET_SUCCESS}`);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `Portfolio ${message.GET_SUCCESS}`,
          { portfolioData }
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

  viewPortfolio: async (req, res) => {
    try {
      const { id } = req.params;
      const portfolio = await db.Portfolio.findOne({ where: { id } });

      if (!portfolio) {
        logger.error(`Portfolio ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Portfolio ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      logger.info(`Portfolio ${message.GET_SUCCESS}`);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `Portfolio ${message.GET_SUCCESS}`,
          { portfolio }
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

  updatePortfolio: async (req, res) => {
    try {
      const { id, product_name, description, image } = req.body;
      const { error } = portfolioUpdateValidate.validate(req.body);

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

      if (!product_name && !description && !image) {
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

      const portfolio = await db.Portfolio.findOne({ where: { id } });

      if (!portfolio) {
        logger.error(`Portfolio ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Portfolio ${message.NOT_FOUND}`,
            undefined
          )
        );
      }
      
      await db.Portfolio.update(
        {
          product_name: product_name || portfolio.product_name,
          description: description || portfolio.description,
          image: image || portfolio.image,
        },
        { where: { id: portfolio.id } }
      );

      logger.info(`Portfolio ${message.UPDATED_SUCCESS}`);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `Portfolio ${message.UPDATED_SUCCESS}`,
          undefined
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

  deletePortfolio: async (req, res) => {
    try {
      const { id } = req.params;
      const portfolio = await db.Portfolio.findOne({ where: { id } });

      if (!portfolio) {
        logger.error(`Portfolio ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Portfolio ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      await db.Portfolio.destroy({ where: { id: portfolio.id } });

      logger.info(`Portfolio ${message.DELETE_SUCCESS}`);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `Portfolio ${message.DELETE_SUCCESS}`,
          undefined
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
