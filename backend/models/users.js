const { DataTypes, Model } = require('sequelize');

class User extends Model {
    static init(sequelize) {
        return super.init({
            google_id: { type: DataTypes.STRING(50), primaryKey: true, allowNull: false },
            email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
            display_name: { type: DataTypes.STRING(50), allowNull: false },
            wallet_address: { type: DataTypes.STRING(50), allowNull: false },
            is_eligible_voter: { type: DataTypes.BOOLEAN, defaultValue: false },
            vote_weight: { type: DataTypes.INTEGER, defaultValue: 0 }
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
        models.User.hasMany(models.Artwork, { foreignKey: 'google_id_fk', sourceKey: 'google_id' });
    }
}

module.exports = User;
