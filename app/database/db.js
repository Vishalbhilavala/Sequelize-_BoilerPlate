const Sequelize = require('sequelize');
const logger = require('../services/logger');
require('dotenv').config({
  path: require('path').join(__dirname, '../../.env'),
});

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER_NAME,
  process.env.DATABASE_PASSWORD,
  {
    dialect: process.env.DIALECT,
    host: process.env.HOST,
    port: process.env.DB_PORT,
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => {
    logger.info('Connection has been established successfully.');
  })
  .catch((error) => {
    logger.error('Unable to connect to the database: ', error);
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.userModel = require('../models/userModel')(sequelize, Sequelize)
db.Imagies = require('../models/imagies')(sequelize, Sequelize)
db.OTPS = require('../models/otp_verifications')(sequelize, Sequelize)
db.Category = require('../models/categoryModel')(sequelize, Sequelize);

db.userModel.associate(db)

db.sequelize
  .sync({ force: false })
  .then(() => {
    logger.info('Database synchronized successfully.');
  })
  .catch((error) => {
    logger.error('Error synchronizing database:', error);
  });

module.exports = db;
