const express = require('express');
const app = express();
require('dotenv').config();
const logger = require('./app/services/logger')

const cors = require('cors');
app.use(cors());

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use('/', require('./app/routes/route'))

const port = process.env.PORT || 3000

app.listen(port, ()=>{
    logger.info(`Server listening on ${port}`)
})
