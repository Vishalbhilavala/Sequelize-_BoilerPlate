module.exports = (sequelize, Sequelize) => {
    const OTPS = sequelize.define(
        'otp_verifications',
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            email: {
                type: Sequelize.STRING(255),
                allowNull: false,
                validate: {
                    isEmail: true
                },
            },
            otp: {
                type: Sequelize.STRING(6),
                allowNull: false
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
            },
            expiresAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        },
        {
            freezeTableName: true,
            timestamps: false,
        }
    )
    return OTPS
}