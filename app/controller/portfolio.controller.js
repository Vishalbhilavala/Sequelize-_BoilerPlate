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
      const { error } = portfolioValidate.validate(req.body);

      if (error) {
        logger.error(message.VALIDATION_ERROR);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            error.details[0].message,
            undefined,
          )
        );
      }

      const portfolio = await db.Portfolio.create(req.body);

      if (req.body.image) {
        await db.Imagies.create({
          portfolioId: portfolio.id,
          imagePath: req.body.image,
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
          error.message || error,
          undefined,
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
          error.message || error,
          undefined,
        )
      );
    }
  },

  getListOfPortfolio: async (req, res) => {
    try {
      const { page, limit, sortBy, orderBy, searchTerm } = req.body;
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
      const offset = (pageNumber - 1) * limitNumber;

      let filterOperation = {};

      if (searchTerm) {
        filterOperation = {
          [db.Sequelize.Op.or]: [
            { product_name: { [db.Sequelize.Op.like]: `%${searchTerm}%` } },
            { description: { [db.Sequelize.Op.like]: `%${searchTerm}%` } },
          ],
        };
      }

      const portfolio = await db.Portfolio.findAll({
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
          error.message || error,
          undefined,
        )
      );
    }
  },

  updatePortfolio: async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = portfolioUpdateValidate.validate( req.body );

      if (error) {
        logger.error(message.VALIDATION_ERROR);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            error.details[0].message,
            undefined,
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
        req.body,
        { where: { id: portfolio.id } }
      );

      const updatedPortfolio = await db.Portfolio.findOne({ where: { id } });

      if(req.body.image) {
        const image = await db.Imagies.findOne({ where: { portfolioId: updatedPortfolio.id } })
        if(image) {
          await db.Imagies.update(
            { imagePath: req.body.image },
            { where: { portfolioId: updatedPortfolio.id } }
          );
        } else {
          await db.Imagies.create({
            portfolioId: updatedPortfolio.id,
            imagePath: req.body.image,
          });
        }
      }

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
          error.message || error,
          undefined,
        )
      );
    }
  },
};
