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
        },
        {
            freezeTableName: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );

    Portfolio.associate = (models) => {
        Portfolio.hasMany(models.Imagies, {
            foreignKey: 'portfolioId',
            as: 'imagies'
        });
    };
    return Portfolio;
}