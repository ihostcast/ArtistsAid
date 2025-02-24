const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
    class User extends Model {
        static associate(models) {
            // Definir asociaciones aquí si es necesario
        }

        async validatePassword(password) {
            return await bcrypt.compare(password, this.password);
        }

        generateVerificationCode() {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            this.verificationCode = code;
            this.verificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
            return code;
        }
    }

    User.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: /^\+?[1-9]\d{1,14}$/ // Formato E.164
            }
        },
        role: {
            type: DataTypes.ENUM('artist', 'producer', 'manager', 'executive_producer', 'sound_engineer', 'photo_producer', 'admin'),
            allowNull: false,
            defaultValue: 'artist'
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        verificationCode: {
            type: DataTypes.STRING,
            allowNull: true
        },
        verificationCodeExpires: {
            type: DataTypes.DATE,
            allowNull: true
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        profilePicture: {
            type: DataTypes.STRING,
            allowNull: true
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        socialLinks: {
            type: DataTypes.JSON,
            defaultValue: {}
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'suspended'),
            defaultValue: 'inactive'
        }
    }, {
        sequelize,
        modelName: 'User',
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    user.password = await bcrypt.hash(user.password, 10);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    user.password = await bcrypt.hash(user.password, 10);
                }
            }
        }
    });

    return User;
};
