const db = require('../database/db');
require('dotenv').config();
const logger = require('../services/logger');
const { HandleResponse } = require('../services/errorHandle');
const { response } = require('../utils/enum');
const { StatusCodes } = require('http-status-codes');
const message = require('../utils/message');
const { categoryValidate } = require('../validation/categoryValidation');

module.exports = {
  createCategory: async (req, res) => {
    try {
      const { error } = categoryValidate.validate(req.body);

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

      const addCategory = await db.Category.create(req.body);

      logger.info(`Category ${message.ADD_SUCCESS}`);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `Category ${message.ADD_SUCCESS}`,
          { id: addCategory.id }
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

  getListOfCategory: async (req, res) => {
    try {
      const { page, limit, sortBy, orderBy, searchTerm } = req.body;
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
      const offset = (pageNumber - 1) * limitNumber;

      let filterOperation = {};

      if (searchTerm) {
        filterOperation = {
          [db.Sequelize.Op.or]: [
            { category_name: { [db.Sequelize.Op.like]: `%${searchTerm}%` } },
          ],
        };
      }

      const category = await db.Category.findAll({
        where: {
          ...filterOperation,
        },
        offset: offset,
        limit: limitNumber,
        order: [[sortBy, orderBy]],
      });

      if (!category) {
        logger.error(`Category ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Category ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      logger.info(`Category ${message.GET_SUCCESS}`);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.OK,
          undefined,
          { Category: category }
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

  viewCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await db.Category.findOne({ where: { id } });

      if (!category) {
        logger.error(`Category ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            `Category ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      logger.info(`Category ${message.GET_SUCCESS}`);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          undefined,
          { Category: category }
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

  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = categoryValidate.validate(req.body);

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

      const categoryExisted = await db.Category.findOne({ where: { id } });

      if (!categoryExisted) {
        logger.error(`Category ${message.NOT_EXIST}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            `Category ${message.NOT_EXIST}`,
            undefined
          )
        );
      }

      await db.Category.update(req.body, { where: { id: categoryExisted.id } });

      logger.info(`Category ${message.UPDATED_SUCCESS}`);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `Category ${message.UPDATED_SUCCESS}`,
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

  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await db.Category.findOne({ where: { id } });

      if (!category) {
        logger.error(`Category ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            `Category ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      await db.Category.destroy({ where: { id: category.id } });

      logger.info(`Category ${message.DELETE_SUCCESS}`);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `Category ${message.DELETE_SUCCESS}`,
          undefined
        )
      );
    } catch (error) {
      logger.error(error.message || error);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.INTERNAL_SERVER_ERROR,
          error.message || error,
          undefined,
        )
      );
    }
  },
};
