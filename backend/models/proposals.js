const { DataTypes, Model } = require('sequelize');

class Proposal extends Model {
    static init(sequelize) {
        return super.init({
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            snapshot_proposal_id: { type: DataTypes.STRING(100), allowNull: false },
            artwork_id_fk: { type: DataTypes.INTEGER, allowNull: false },
            title: { type: DataTypes.STRING(200), allowNull: false },
            description: { type: DataTypes.TEXT, allowNull: true },
            end_at: { type: DataTypes.DATE, allowNull: false },
            status: { type: DataTypes.ENUM('active', 'closed'), defaultValue: 'active' },
            result_approved: { type: DataTypes.BOOLEAN, allowNull: true },
            result_votes_for: { type: DataTypes.INTEGER, defaultValue: 0 },
            result_votes_against: { type: DataTypes.INTEGER, defaultValue: 0 },
            result_snapshot_data: { type: DataTypes.JSON, allowNull: true }
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
        models.Proposal.belongsTo(models.Artwork, { foreignKey: 'artwork_id_fk', targetKey: 'id' });
    }
}

module.exports = Proposal;
