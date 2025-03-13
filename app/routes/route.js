const express = require('express')
const router = express.Router()

const userRouter = require('./routers/userRoute')
const categoryRouter = require('./routers/categoryRoute')

router.use('/api/users', userRouter)
router.use('/api/category', categoryRouter)

module.exports = router