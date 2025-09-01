// Definición del modelo ApiStat
export default (sequelize, DataTypes) => {
  const ApiStat = sequelize.define('ApiStat', {
    endpointAccess: {
      type: DataTypes.STRING,
      allowNull: false
    },
    requestMethod: {
      type: DataTypes.STRING,
      allowNull: false
    },
    statusCode: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    responseTimeMs: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });
  return ApiStat;
};


