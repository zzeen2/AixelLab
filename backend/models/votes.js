const { DataTypes, Model } = require('sequelize');

class Vote extends Model {
    static init(sequelize) {
        return super.init({
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            proposal_id_fk: { type: DataTypes.INTEGER, allowNull: false },
            voter_google_id_fk: { type: DataTypes.STRING(50), allowNull: false },
            vote_type: { type: DataTypes.ENUM('for', 'against'), allowNull: false },
            vote_weight: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
            created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
        }, {
            sequelize,
            timestamps: true,
            modelName: 'Vote',
            tableName: 'votes',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci'
        });
    }

    static associate(models) {
        models.Vote.belongsTo(models.Proposal, { 
            foreignKey: 'proposal_id_fk', 
            targetKey: 'id' 
        });
        models.Vote.belongsTo(models.User, { 
            foreignKey: 'voter_google_id_fk', 
            targetKey: 'google_id' 
        });
    }
}

module.exports = Vote; 