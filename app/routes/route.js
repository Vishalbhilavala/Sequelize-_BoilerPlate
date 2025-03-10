const express = require('express')
const router = express.Router()

const userRouter = require('./routers/userRoute')
const categoryRouter = require('./routers/categoryRoute')
const portfolioRouter = require('./routers/portfolioRoute')

router.use('/api/users', userRouter)
router.use('/api/category', categoryRouter)
router.use('/api/portfolio', portfolioRouter)

module.exports = router