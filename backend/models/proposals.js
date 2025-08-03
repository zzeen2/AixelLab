const { DataTypes, Model } = require('sequelize');

class Proposal extends Model {
    static init(sequelize) {
        return super.init({
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            artwork_id_fk: { type: DataTypes.INTEGER, allowNull: false },
            created_by: { type: DataTypes.INTEGER, allowNull: false },
            start_at: { type: DataTypes.DATE, allowNull: false },
            end_at: { type: DataTypes.DATE, allowNull: false },
            min_votes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
            status: { type: DataTypes.ENUM('active', 'closed', 'approved', 'rejected'), defaultValue: 'active' },
            result_approved: { type: DataTypes.BOOLEAN, allowNull: true },
            result_votes_for: { type: DataTypes.INTEGER, defaultValue: 0 },
            result_votes_against: { type: DataTypes.INTEGER, defaultValue: 0 },
            result_total_votes: { type: DataTypes.INTEGER, defaultValue: 0 },
            
            // NFT 민팅 관련 필드
            nft_minted: { type: DataTypes.BOOLEAN, defaultValue: false },
            nft_token_id: { type: DataTypes.INTEGER, allowNull: true },
            nft_transaction_hash: { type: DataTypes.STRING(66), allowNull: true },
            minted_at: { type: DataTypes.DATE, allowNull: true },
            artist_wallet_address: { type: DataTypes.STRING(42), allowNull: true }
        }, {
            sequelize,
            timestamps: true,
            modelName: 'Proposal',
            tableName: 'proposals',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci'
        });
    }

    static associate(models) {
        models.Proposal.belongsTo(models.Artwork, { foreignKey: 'artwork_id_fk', targetKey: 'id', as: 'artwork' });
        models.Proposal.belongsTo(models.User, { foreignKey: 'created_by', targetKey: 'id', as: 'author' });
        models.Proposal.hasMany(models.Vote, { foreignKey: 'proposal_id_fk', sourceKey: 'id', as: 'votes' });
    }
}

module.exports = Proposal; 