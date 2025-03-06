const express = require('express')
const router = express.Router()

const userRouter = require('./routers/userRoute')

router.use('/api/user', userRouter)

module.exports = router