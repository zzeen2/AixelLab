const { DataTypes, Model } = require('sequelize');

class Proposal extends Model {
    static init(sequelize) {
        return super.init({
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            proposal_hash: { type: DataTypes.STRING(100), allowNull: false, unique: true },
            artwork_id_fk: { type: DataTypes.INTEGER, allowNull: false },
            title: { type: DataTypes.STRING(200), allowNull: false },
            description: { type: DataTypes.TEXT, allowNull: true },
            created_by: { type: DataTypes.STRING(50), allowNull: false },
            start_at: { type: DataTypes.DATE, allowNull: false },
            end_at: { type: DataTypes.DATE, allowNull: false },
            min_votes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
            status: { type: DataTypes.ENUM('active', 'closed', 'approved', 'rejected'), defaultValue: 'active' },
            result_approved: { type: DataTypes.BOOLEAN, allowNull: true },
            result_votes_for: { type: DataTypes.INTEGER, defaultValue: 0 },
            result_votes_against: { type: DataTypes.INTEGER, defaultValue: 0 },
            result_total_votes: { type: DataTypes.INTEGER, defaultValue: 0 }
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
        models.Proposal.belongsTo(models.User, { foreignKey: 'created_by', targetKey: 'google_id' });
        models.Proposal.hasMany(models.Vote, { foreignKey: 'proposal_id_fk', sourceKey: 'id' });
    }
}

module.exports = Proposal;
