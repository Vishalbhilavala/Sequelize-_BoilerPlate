const express = require('express')
const route = express.Router()
const portfolioRouter = require('../../controller/portfolio.controller')
const { upload } = require('../../middleware/multer.auth')

route.post('/createPortfolio', portfolioRouter.createPortfolio);
route.post('/commanFileUpload', upload.single('photo'), portfolioRouter.commanFileupload);
route.get('/getListOfPortfolio', portfolioRouter.getListOfPortfolio);
route.get('/viewPortfolio/:id', portfolioRouter.viewPortfolio);
route.put('/updatePortfolio', portfolioRouter.updatePortfolio);
route.delete('/deletePortfolio/:id', portfolioRouter.deletePortfolio);


module.exports = route