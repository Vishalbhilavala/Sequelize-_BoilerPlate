const express = require('express')
const route = express.Router()
const userModel = require('../../controller/user.controller')
const { auth } = require('../../middleware/auth')
const { upload } = require('../../middleware/multer.auth')

route.post('/registration', userModel.registration);
route.post('/login', userModel.login);
route.post('/commanFileUpload', upload.single('photo'), userModel.commanFileUpload);
route.get('/getListOfUser', userModel.getListOfUser);
route.get('/viewProfile', auth, userModel.viewProfile);
route.put('/updateProfile', auth, userModel.updateProfile);
route.put('/updatePassword', auth, userModel.updatePassword);
route.post('/forgotPassword', userModel.forgotPassword);
route.post('/verifyEmail', userModel.verifyEmail);
route.post('/verifyOTP', userModel.verifyOTP);


module.exports = route