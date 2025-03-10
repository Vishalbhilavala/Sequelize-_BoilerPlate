const express = require('express')
const route = express.Router()
const portfolioRouter = require('../../controller/portfolio.controller')

route.post('/createPortfolio', portfolioRouter.createPortfolio);


module.exports = route