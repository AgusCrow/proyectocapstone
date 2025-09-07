import { Player } from '../orm/index.js';
import functional from '../utils/functional.js';

const { 
    map, 
    identity, 
    prop, 
    pick, 
    omit, 
    isNil, 
    isEmpty, 
    when, 
    unless, 
    tryCatch, 
    tap, 
    find, 
    filter,
    compose,
    pipe,
    curry,
    head
} = functional;


// Funciones puras para validación
const isValidPlayerData = (data) => {
    const requiredFields = ['username', 'email', 'password'];
    return requiredFields.every(field => !isEmpty(data[field]));
};

const sanitizePlayerData = pick(['username', 'email', 'password']);

const excludePassword = omit(['password']);

// Función pura para transformar datos del jugador
const transformPlayerData = pipe(
    excludePassword,
    tap(player => console.log('Player data transformed:', player))
);

// Función pura para validar email único
const isEmailUnique = curry(async (email, players) => {
    return !players.some(player => player.email === email);
});


// Función pura para encontrar jugador por criterio
const findPlayerBy = curry((predicate) => async (players) => {
    return find(predicate)(players);
});

// Crear un nuevo jugador 
const createPlayer = async (playerData) => {
  try {
    // Validar datos de entrada
    if (!isValidPlayerData(playerData)) {
      throw new Error('Datos de jugador inválidos');
    }
    
    const player = await Player.create(playerData);
    return player.toJSON(); // Devuelve solo los datos, no la instancia del modelo
  } catch (error) {
    // Re-lanzar errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError') {
      throw new Error('Validation error');
    }
    throw error;
  }
};

// Obtener jugador por ID
const getPlayerById = async (id) => {
    return tryCatch(
        async () => {
            if (isNil(id)) {
                throw new Error('ID de jugador requerido');
            }

            const player = await Player.findByPk(id);
            
            return when(
                player => !isNil(player)
            )(
                transformPlayerData
            )(player);
        }
    )(
        (error) => {
            console.error('Error getting player by ID:', error);
            return null;
        }
    )();
};

// Actualizar jugado
const updatePlayer = async (id, data) => {
    return tryCatch(
        async () => {
            if (isNil(id)) {
                throw new Error('ID de jugador requerido');
            }

            const player = await Player.findByPk(id);
            
            if (isNil(player)) {
                return null;
            }

            // Sanitizar datos de actualización
            const sanitizedData = sanitizePlayerData(data);
            
            const updatedPlayer = await player.update(sanitizedData);
            
            return transformPlayerData(updatedPlayer.toJSON());
        }
    )(
        (error) => {
            console.error('Error updating player:', error);
            return null;
        }
    )();
};

// Eliminar jugador
const deletePlayer = async (id) => {
    return tryCatch(
        async () => {
            if (isNil(id)) {
                throw new Error('ID de jugador requerido');
            }

            const player = await Player.findByPk(id);
            
            if (isNil(player)) {
                return null;
            }

            await player.destroy();
            return true;
        }
    )(
        (error) => {
            console.error('Error deleting player:', error);
            return null;
        }
    )();
};

// Listar todos los jugadores
const listPlayers = async () => {
    return tryCatch(
        async () => {
            const players = await Player.findAll();
            
            return pipe(
                map(player => player.toJSON()),
                map(transformPlayerData)
            )(players);
        }
    )(
        (error) => {
            console.error('Error listing players:', error);
            return [];
        }
    )();
};

// Buscar jugador por nombre de usuario
const findPlayerByUsername = async (username) => {
    return tryCatch(
        async () => {
            if (isEmpty(username)) {
                throw new Error('Username requerido');
            }

            const players = await Player.findAll({ where: { username } });
            
            return pipe(
                head,
                when(
                    player => !isNil(player)
                )(
                    player => transformPlayerData(player.toJSON())
                )
            )(players);
        }
    )(
        (error) => {
            console.error('Error finding player by username:', error);
            return null;
        }
    )();
};

// Buscar jugador por email
const findPlayerByEmail = async (email) => {
    return tryCatch(
        async () => {
            if (isEmpty(email)) {
                throw new Error('Email requerido');
            }

            const players = await Player.findAll({ where: { email } });
            
            return pipe(
                head,
                when(
                    player => !isNil(player)
                )(
                    player => transformPlayerData(player.toJSON())
                )
            )(players);
        }
    )(
        (error) => {
            console.error('Error finding player by email:', error);
            return null;
        }
    )();
};

// Obtener jugadores activos
const getActivePlayers = async () => {
    return tryCatch(
        async () => {
            const players = await Player.findAll();
            
            return pipe(
                map(player => player.toJSON()),
                filter(player => player.activo !== false), // Asumiendo campo activo
                map(transformPlayerData)
            )(players);
        }
    )(
        (error) => {
            console.error('Error getting active players:', error);
            return [];
        }
    )();
};

// Validar credenciales de jugador
const validateCredentials = async (username, password) => {
    return tryCatch(
        async () => {
            if (isEmpty(username) || isEmpty(password)) {
                return null;
            }

            const player = await findPlayerByUsername(username);
            
            if (isNil(player)) {
                return null;
            }
            return player;
        }
    )(
        (error) => {
            console.error('Error validating credentials:', error);
            return null;
        }
    )();
};

// Estadísticas de jugadores
const getPlayerStats = async () => {
    return tryCatch(
        async () => {
            const players = await Player.findAll();
            const playersData = map(player => player.toJSON())(players);
            
            return {
                total: playersData.length,
                active: filter(player => player.activo !== false)(playersData).length,
                inactive: filter(player => player.activo === false)(playersData).length
            };
        }
    )(
        (error) => {
            console.error('Error getting player stats:', error);
            return { total: 0, active: 0, inactive: 0 };
        }
    )();
};

export default {
    createPlayer,
    getPlayerById,
    updatePlayer,
    deletePlayer,
    listPlayers,
    findPlayerByUsername,
    findPlayerByEmail,
    getActivePlayers,
    validateCredentials,
    getPlayerStats,
    isEmailUnique,
    findPlayerBy
};