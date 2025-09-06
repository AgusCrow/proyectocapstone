// Definición del modelo Card
export default (sequelize, DataTypes) => {
  const Card = sequelize.define('Card', {
    color: DataTypes.STRING,
    value: DataTypes.STRING,
    type: DataTypes.STRING,
  });
  return Card;
};