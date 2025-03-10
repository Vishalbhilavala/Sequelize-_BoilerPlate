module.exports = (sequelize, Sequelize) => {
    const Portfolio = sequelize.define(
        'Portfolios',
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            category_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Categories',
                    key: 'id',
                },
            },
            product_name: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
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
    return Portfolio;
}