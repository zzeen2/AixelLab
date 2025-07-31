const { DataTypes, Model } = require('sequelize');

class User extends Model {
    static init(sequelize) {
        return super.init({
            id: { 
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            google_id: { 
                type: DataTypes.STRING(50), 
                allowNull: true,  
                unique: true 
            },
            email: { 
                type: DataTypes.STRING(100), 
                allowNull: true, 
                unique: true 
            },
            display_name: { 
                type: DataTypes.STRING(50), 
                allowNull: false 
            },
            wallet_address: { 
                type: DataTypes.STRING(42), 
                allowNull: false,
                unique: true
            },
            login_type: {
                type: DataTypes.ENUM('google', 'metamask'),
                allowNull: false,
                defaultValue: 'google'
            },
            is_eligible_voter: { 
                type: DataTypes.BOOLEAN, 
                defaultValue: false 
            },
            vote_weight: { 
                type: DataTypes.INTEGER, 
                defaultValue: 0 
            }
        }, {
            sequelize,
            timestamps: true,
            modelName: 'User',
            tableName: 'users',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci'
        });
    }

    static associate(models) {
        models.User.hasMany(models.Artwork, { foreignKey: 'user_id_fk', sourceKey: 'id' });
    }
}

module.exports = User;
