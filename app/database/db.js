const Sequelize = require('sequelize');
const logger = require('../services/logger')
require('dotenv').config()

const sequelize = new Sequelize(
    'sequelize-boiler-plate',
    'root',
    'RAMJIBHAI@BHILAVALA78',
    {
        dialect: 'mysql',
        host: 'localhost',
        port: 3306,
        logging: false
    }
);

sequelize.authenticate().then(()=>{
    logger.info('Connection has been established successfully.')
}).catch((error) =>{
    logger.error('Unable to connect to the database: ', error)
})

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.userModel = require('../models/userModel')(sequelize, Sequelize)
db.Imagies = require('../models/imagies')(sequelize, Sequelize)
db.OTPS = require('../models/otp_verifications')(sequelize, Sequelize)
db.Category = require('../models/categoryModel')(sequelize, Sequelize);
db.Portfolio = require('../models/portfolioModel')(sequelize, Sequelize);

db.Portfolio.associate(db);
db.Imagies.associate(db);

db.userModel.associate(db)

db.sequelize.sync({force: false}).then(() =>{
    logger.info('Database synchronized successfully.')
}).catch((error) => {
    logger.error('Error synchronizing database:', error);
});

module.exports = db;