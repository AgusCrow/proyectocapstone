// Definición del modelo Player
export default (sequelize, DataTypes) => {
  const Player = sequelize.define('Player', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
  });
  return Player;
};