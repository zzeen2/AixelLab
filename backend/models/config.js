require('dotenv').config();
const Sequelize = require('sequelize');
const User = require('./users');
const Artwork = require('./artworks');
const Proposal = require('./proposals');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'aixellab',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false,
    }
);

const users = User.init(sequelize);
const artworks = Artwork.init(sequelize);
const proposals = Proposal.init(sequelize);

const db = {
    User: users,
    Artwork: artworks,
    Proposal: proposals,
    sequelize
};

users.associate(db);
artworks.associate(db);
proposals.associate(db);

sequelize.sync({ force: false }).then(() => {
    console.log('database on~');
}).catch(console.log);

module.exports = db;