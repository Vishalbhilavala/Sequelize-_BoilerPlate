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
      const { category_name } = req.body;
      const { error } = categoryValidate.validate(req.body);

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

      const findCategory = await db.Category.findOne({
        where: {
          category_name: db.Sequelize.where(
            db.Sequelize.fn('LOWER', db.Sequelize.col('category_name')),
            category_name.toLowerCase()
          ),
        },
      });

      if (findCategory) {
        logger.error(`Category ${message.ALREADY_EXIST}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            `Category ${message.ALREADY_EXIST}`,
            undefined
          )
        );
      }

      const category = await db.Category.create({
        category_name,
      });

      logger.info(`Category ${message.ADD_SUCCESS}`);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `Category ${message.ADD_SUCCESS}`,
          { id: category.id }
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

  getListOfCategory: async (req, res) => {
    try {
      const { page, data, sortBy, orderBy = 'asc', search } = req.body;
      const category = await db.Category.findAll({});
      let filteredCategory = category;

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

      if (search) {
        const searchLower = search.toLowerCase();
        filteredCategory = category.filter((category) =>
          category.category_name.toLowerCase().includes(searchLower)
        );
      }

      if (sortBy && filteredCategory.length > 0) {
        filteredCategory.sort((a, b) => {
          if (orderBy === 'desc') {
            return b[sortBy] > a[sortBy] ? 1 : -1;
          } else {
            return a[sortBy] > b[sortBy] ? 1 : -1;
          }
        });
      }

      let StartIndex = (page - 1) * data;
      let EndIndex = StartIndex + data;
      const show = filteredCategory.slice(StartIndex, EndIndex);

      logger.info(`Category ${message.GET_SUCCESS}`);
      return res.json(
        HandleResponse(
          response.RESPONSE_ERROR,
          StatusCodes.OK,
          `Category ${message.GET_SUCCESS}`,
          { Category: show }
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
          `Category ${message.GET_SUCCESS}`,
          { Category: category }
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

  updateCategory: async (req, res) => {
    try {
      const { id, category_name } = req.body;
      const { error } = categoryValidate.validate({ category_name });

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

      const categoryExisted = await db.Category.findOne({ where: { id } });

      if (!categoryExisted) {
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

      const findCategoryName = await db.Category.findOne({
        where: {
          category_name: db.Sequelize.where(
            db.Sequelize.fn('LOWER', db.Sequelize.col('category_name')),
            category_name.toLowerCase()
          ),
        },
      });

      if (findCategoryName) {
        logger.error(`Category ${message.ALREADY_EXIST}`);
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            `Category ${message.ALREADY_EXIST}`,
            undefined
          )
        );
      }

      await db.Category.update(
        {
          category_name: category_name || categoryExisted.category_name,
        },
        { where: { id: categoryExisted.id } }
      );

      logger.info(`Category ${(message, message.UPDATED_SUCCESS)}`);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `Category ${(message, message.UPDATED_SUCCESS)}`,
          undefined
        )
      );
    } catch (error) {
      logger.error(error);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
          undefined,
          error.message || error
        )
      );
    }
  },

  deleteCategory: async (req, res) => {
    try {
        const { id } = req.params;
        const category = await db.Category.findOne({ where: { id }});

        if(!category){
            logger.error(`Category ${message.NOT_FOUND}`);
            return res.json(
                HandleResponse(
                    response.RESPONSE_ERROR,
                    StatusCodes.BAD_REQUEST,
                    `Category ${message.NOT_FOUND}`,
                    undefined,
                )
            )
        }

        await db.Category.destroy({ where: { id: category.id }})

        logger.info(`Category ${ message.DELETE_SUCCESS }`);
        return res.json(
            HandleResponse(
                response.RESPONSE_SUCCESS,
                StatusCodes.OK,
                `Category ${ message.DELETE_SUCCESS }`,
                undefined
            )
        )
    } catch (error) {   
      logger.error(error);
      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
          undefined,
          error.message || error
        )
      );
    }
  },
};
