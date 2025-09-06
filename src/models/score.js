// Definición del modelo Score
export default (sequelize, DataTypes) => {
  const Score = sequelize.define('Score', {
    playerId: DataTypes.INTEGER,
    gameId: DataTypes.INTEGER,
    points: DataTypes.INTEGER,
  });
  return Score;
};