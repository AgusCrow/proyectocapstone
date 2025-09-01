import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

import ApiStatModel from '../models/apiStat.js';
import CardModel from '../models/card.js';
import GameModel from '../models/game.js';
import PlayerModel from '../models/player.js';
import PlayerCardModel from '../models/playerCard.js';
import ScoreModel from '../models/score.js';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false
  }
);

const Player = PlayerModel(sequelize, Sequelize.DataTypes);
const Game = GameModel(sequelize, Sequelize.DataTypes);
const Card = CardModel(sequelize, Sequelize.DataTypes);
const Score = ScoreModel(sequelize, Sequelize.DataTypes);
const PlayerCard = PlayerCardModel(sequelize, Sequelize.DataTypes);
const ApiStat = ApiStatModel(sequelize, Sequelize.DataTypes);

// Relaciones existentes
Player.belongsToMany(Game, { through: 'GamePlayers' });
Game.belongsToMany(Player, { through: 'GamePlayers' });

// Relaciones para PlayerCard
Player.hasMany(PlayerCard, { foreignKey: 'playerId' });
Game.hasMany(PlayerCard, { foreignKey: 'gameId' });
Card.hasMany(PlayerCard, { foreignKey: 'cardId' });

PlayerCard.belongsTo(Player, { foreignKey: 'playerId' });
PlayerCard.belongsTo(Game, { foreignKey: 'gameId' });
PlayerCard.belongsTo(Card, { foreignKey: 'cardId' });

export { ApiStat, Card, Game, Player, PlayerCard, Score, sequelize };

