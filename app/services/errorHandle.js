const { StatusCodes } = require('http-status-codes');
const {response} = require('../utils/enum')

function HandleResponse(status, statusCode, message, data, error) {
    if (status === response.RESPONSE_SUCCESS) {
      return {
        status,
        statusCode: statusCode || StatusCodes.OK,
        message,
        data,
        error,
      };
    }
    return {
      status,
      statusCode: statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
      message,
      data,
      error,
    };
  }
  
  module.exports = {HandleResponse};