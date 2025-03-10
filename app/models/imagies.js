module.exports = (sequelize, Sequelize) => {
    const Imagies = sequelize.define(
      'user-imagies',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'user',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        imagePath: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  
    Imagies.associate = (models) => {
      Imagies.belongsTo(models.userModel, {
        foreignKey: 'userId',
        as : ''
      });
    };
    return Imagies;
  };
  