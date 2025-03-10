const { gender } = require('../utils/enum');

module.exports = (sequelize, Sequelize) => {
  const userModel = sequelize.define(
    'user',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      firstName: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      lastName: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      hobby: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },

      gender: {
        type: Sequelize.ENUM,
        values: [gender.MALE, gender.FEMALE, gender.OTHER],
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      phone: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isNumeric: true,
        },
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true
      }
    },
    {
      freezeTableName: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  userModel.associate = (models) => {
    userModel.hasMany(models.Imagies, {
      foreignKey: 'userId',
    });
  };
  
  return userModel
};
