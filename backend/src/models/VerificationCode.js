const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class VerificationCode extends Model {
        static associate(models) {
            VerificationCode.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user'
            });
        }
    }

    VerificationCode.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('email', 'sms'),
            allowNull: false
        },
        attempts: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'VerificationCode',
        tableName: 'verification_codes'
    });

    return VerificationCode;
};
