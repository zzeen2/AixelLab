const { DataTypes, Model } = require('sequelize');

class Artwork extends Model {
    static init(sequelize) {
        return super.init({
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            title: { type: DataTypes.STRING(200), allowNull: false },
            description: { type: DataTypes.TEXT, allowNull: true },
            image_ipfs_uri: { type: DataTypes.STRING(500), allowNull: false },
            metadata_ipfs_uri: { type: DataTypes.STRING(500), allowNull: false },
            proposal_id: { type: DataTypes.STRING(100), allowNull: true },
            status: { type: DataTypes.ENUM('pending', 'reviewing', 'approved', 'rejected', 'voting', 'minted'), defaultValue: 'pending'},
            token_id: { type: DataTypes.INTEGER, allowNull: true },
            google_id_fk: { type: DataTypes.STRING(50), allowNull: false }
        }, {
            sequelize,
            timestamps: true,
            modelName: 'Artwork',
            tableName: 'artworks',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci'
        });
    }

    static associate(models) {
        models.Artwork.belongsTo(models.User, { foreignKey: 'google_id_fk', targetKey: 'google_id' });
        models.Artwork.hasOne(models.Proposal, { foreignKey: 'artwork_id_fk', sourceKey: 'id' });
    }
}

module.exports = Artwork;