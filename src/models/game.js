// Definición del modelo Game
export default (sequelize, DataTypes) => {
  const Game = sequelize.define('Game', {
    name: DataTypes.STRING,
    status: DataTypes.STRING,
    creatorId: DataTypes.INTEGER,
  });
  return Game;
};