// Definición del modelo PlayerCard (cartas en mano de cada jugador)
export default (sequelize, DataTypes) => {
  const PlayerCard = sequelize.define('PlayerCard', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Players',
        key: 'id'
      }
    },
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Games',
        key: 'id'
      }
    },
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Cards',
        key: 'id'
      }
    },
    isPlayed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    playedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'PlayerCards',
    timestamps: true
  });

  return PlayerCard;
}; 