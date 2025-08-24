const { DataTypes, Model } = require('sequelize');

class Artwork extends Model {
    static init(sequelize) {
        return super.init({
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            title: { type: DataTypes.STRING(200), allowNull: false },
            description: { type: DataTypes.TEXT, allowNull: true },
            image_ipfs_uri: { type: DataTypes.STRING(500), allowNull: false },
            metadata_ipfs_uri: { type: DataTypes.STRING(500), allowNull: true }, // 구매한 NFT는 metadata가 없을 수 있음
            proposal_id: { type: DataTypes.INTEGER, allowNull: true },
            status: { type: DataTypes.ENUM('pending', 'reviewing', 'approved', 'rejected', 'voting', 'minted'), defaultValue: 'pending'},
            token_id: { type: DataTypes.INTEGER, allowNull: true },
            user_id_fk: { type: DataTypes.INTEGER, allowNull: true }, // 구매한 NFT는 user_id가 없을 수 있음
            creator: { type: DataTypes.STRING(42), allowNull: true }, // NFT 생성자 주소 (Smart Account)
            owner_address: { type: DataTypes.STRING(42), allowNull: true }, // 현재 소유자 주소 (Smart Account)
            contract_address: { type: DataTypes.STRING(42), allowNull: true }, // NFT 컨트랙트 주소
            is_purchased: { type: DataTypes.BOOLEAN, defaultValue: false }, // 구매한 NFT 여부
            purchase_date: { type: DataTypes.DATE, allowNull: true }, // 구매 날짜
            purchase_transaction_hash: { type: DataTypes.STRING(66), allowNull: true } // 구매 트랜잭션 해시
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
        models.Artwork.belongsTo(models.User, { foreignKey: 'user_id_fk', targetKey: 'id' });
        models.Artwork.belongsTo(models.Proposal, { foreignKey: 'proposal_id', targetKey: 'id' });
    }
}

module.exports = Artwork;