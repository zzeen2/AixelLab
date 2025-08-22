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
                unique: 'users_google_id_uq'
            },
            email: { 
                type: DataTypes.STRING(100), 
                allowNull: true, 
                unique: 'users_email_uq'
            },
            display_name: { 
                type: DataTypes.STRING(50), 
                allowNull: false 
            },
            wallet_address: { 
                type: DataTypes.STRING(42), 
                allowNull: false,
                unique: 'users_wallet_address_uq'
            },
            eoa_address: {
                type: DataTypes.STRING(42),
                allowNull: true,
                unique: 'users_eoa_address_uq'
            },
            password_hash: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            wallet_created: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            login_type: {
                type: DataTypes.ENUM('google', 'metamask'),
                allowNull: false,
                defaultValue: 'google'
            },
            avatar_color: {
                type: DataTypes.STRING(7),
                allowNull: true,
            },
            is_eligible_voter: { 
                type: DataTypes.BOOLEAN, 
                defaultValue: false 
            },
            vote_weight: { 
                type: DataTypes.INTEGER, 
                defaultValue: 0 
            },
            // cache columns
            smart_account_address: {
                type: DataTypes.STRING(42),
                allowNull: true,
            },
            axc_balance_units: {
                type: DataTypes.BIGINT,
                allowNull: true,
            },
            balances_updated_at: {
                type: DataTypes.DATE,
                allowNull: true,
            }
        }, {
            sequelize,
            timestamps: true,
            modelName: 'User',
            tableName: 'users',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
            indexes: [
                { unique: true, fields: ['google_id'], name: 'users_google_id_uq' },
                { unique: true, fields: ['email'], name: 'users_email_uq' },
                { unique: true, fields: ['wallet_address'], name: 'users_wallet_address_uq' },
                { unique: true, fields: ['eoa_address'], name: 'users_eoa_address_uq' },
            ]
        });
    }

    static associate(models) {
        models.User.hasMany(models.Artwork, { foreignKey: 'user_id_fk', sourceKey: 'id' });
    }
}

module.exports = User;
