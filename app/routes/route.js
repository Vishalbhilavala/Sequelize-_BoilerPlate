const express = require('express')
const router = express.Router()

const userRouter = require('./routers/userRoute')

router.use('/api/users', userRouter)

module.exports = router