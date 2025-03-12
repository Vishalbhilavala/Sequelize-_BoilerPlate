const express = require('express')
const route = express.Router()

const categoryRouter = require('../../controller/category.controller')

route.post('/createCategory', categoryRouter.createCategory);
route.get('/getListOfCategory', categoryRouter.getListOfCategory);
route.get('/viewCategory/:id', categoryRouter.viewCategory);
route.put('/updateCategory/:id', categoryRouter.updateCategory);
route.delete('/deleteCategory/:id', categoryRouter.deleteCategory);

module.exports = route