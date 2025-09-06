# UNO Digital - API del Juego

## Descripción

UNO Digital es una API REST para el juego de cartas UNO. El proyecto implementa una arquitectura de tres capas con programación funcional, utilizando Node.js, Express, Sequelize y Jest para testing.

## Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Base de Datos**: MySQL con Sequelize ORM
- **Autenticación**: JWT (JSON Web Tokens)
- **Testing**: Jest, Supertest
- **Programación Funcional**: Ramda, utilidades personalizadas
- **Documentación**: Postman Collection

## Estructura del Proyecto

```
proyectocapstone/
├── src/
│   ├── controllers/     # Controladores de la API
│   ├── services/        # Lógica de negocio
│   ├── models/          # Modelos de datos
│   ├── routes/          # Definición de rutas
│   ├── middleware/      # Middleware personalizado
│   ├── utils/           # Utilidades funcionales
│   ├── orm/             # Configuración ORM
│   └── database/        # Configuración de base de datos
├── tests/
│   ├── controllers/     # Tests unitarios de controladores
│   ├── integration/     # Tests de integración
│   └── routes/          # Tests de rutas API
├── documents/           # Documentación y imágenes
├── postman_collection.json  # Colección de Postman
└── README.md           # Este archivo
```

## Instalación y Configuración

### Prerrequisitos

- Node.js (v14 o superior)
- MySQL (v8.0 o superior)
- npm o yarn

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd proyectocapstone
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crear archivo `.env` en la raíz del proyecto:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASS=tu_password
   DB_NAME=uno_digital
   DB_DIALECT=mysql
   JWT_SECRET=tu_secreto_jwt
   ```

4. **Configurar base de datos**
   ```bash
   # Crear base de datos
   CREATE DATABASE uno_digital;
   
   # Sincronizar modelos (opcional)
   npm run db:init
   ```

5. **Ejecutar el servidor**
   ```bash
   npm start
   ```

## Testing

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con cobertura
npm run test:coverage
```

### Tipos de Tests

- **Tests Unitarios**: Para controladores y servicios
- **Tests de Integración**: Para base de datos y API
- **Tests de Rutas**: Para endpoints de la API

## API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/players/register` | Registrar nuevo usuario |
| POST | `/api/players/login` | Iniciar sesión |
| POST | `/api/players/logout` | Cerrar sesión |
| GET | `/api/players/profile` | Obtener perfil de usuario |

### Jugadores

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/players` | Crear jugador |
| GET | `/api/players/:id` | Obtener jugador por ID |
| PUT | `/api/players/:id` | Actualizar jugador |
| DELETE | `/api/players/:id` | Eliminar jugador |
| GET | `/api/players` | Listar todos los jugadores |

### Juegos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/games` | Crear juego |
| GET | `/api/games/:id` | Obtener juego por ID |
| PUT | `/api/games/:id` | Actualizar juego |
| DELETE | `/api/games/:id` | Eliminar juego |
| GET | `/api/games` | Listar todos los juegos |
| POST | `/api/games/:id/join` | Unirse a un juego |
| POST | `/api/games/:id/start` | Iniciar juego |
| POST | `/api/games/:id/leave` | Salir de un juego |
| POST | `/api/games/:id/end` | Finalizar juego |
| GET | `/api/games/:id/state` | Estado del juego |
| GET | `/api/games/:id/players` | Jugadores en el juego |
| GET | `/api/games/:id/current-player` | Jugador actual |
| GET | `/api/games/:id/top-card` | Carta superior |
| GET | `/api/games/:id/scores` | Puntuaciones del juego |

### Tarjetas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/cards` | Crear tarjeta |
| GET | `/api/cards/:id` | Obtener tarjeta por ID |
| PUT | `/api/cards/:id` | Actualizar tarjeta |
| DELETE | `/api/cards/:id` | Eliminar tarjeta |
| GET | `/api/cards` | Listar todas las tarjetas |
| POST | `/api/cards/initialize` | Inicializar mazo UNO |
| GET | `/api/cards/color/:color` | Tarjetas por color |
| GET | `/api/cards/type/:type` | Tarjetas por tipo |

### Scores

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/scores` | Crear score |
| GET | `/api/scores/:id` | Obtener score por ID |
| PUT | `/api/scores/:id` | Actualizar score |
| DELETE | `/api/scores/:id` | Eliminar score |
| GET | `/api/scores` | Listar todos los scores |
| GET | `/api/scores/player/:id` | Scores por jugador |
| GET | `/api/scores/game/:id` | Scores por juego |
| GET | `/api/scores/top` | Mejores scores |
| GET | `/api/scores/player/:id/stats` | Estadísticas de jugador |
| GET | `/api/scores/game/:id/leaderboard` | Leaderboard del juego |

## Programación Funcional

El proyecto utiliza programación funcional con utilidades personalizadas:

### Utilidades Principales

- **Composición**: `compose`, `pipe`
- **Transformación**: `map`, `filter`, `reduce`
- **Validación**: `isNil`, `isEmpty`
- **Manejo de errores**: `tryCatch`
- **Currying**: `curry`
- **Utilidades de objetos**: `pick`, `omit`, `merge`

### Ejemplo de Uso

```javascript
import { pipe, map, filter, pick } from '../utils/functional.js';

// Transformar datos de jugadores
const transformPlayers = pipe(
    map(player => player.toJSON()),
    map(pick(['id', 'username', 'email'])),
    filter(player => player.active)
);
```

## Testing

### Estructura de Tests

```
tests/
├── controllers/
│   ├── playersController.test.js
│   ├── authController.test.js
│   ├── gamesController.test.js
│   ├── cardsController.test.js
│   └── scoresController.test.js
├── integration/
│   └── database.test.js
└── routes/
    └── api.test.js
```

### Ejemplos de Tests

```javascript
// Test unitario con programación funcional
describe('Players Controller', () => {
  it('debería crear un jugador exitosamente', async () => {
    const req = createMockRequest(validPlayerData);
    const res = createMockResponse();
    
    await playersController.createPlayer(req, res);
    
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expectedResponse);
  });
});
```

## Colección Postman

El proyecto incluye una colección completa de Postman (`postman_collection.json`) con:

- Todas las rutas de la API
- Ejemplos de requests
- Variables de entorno
- Autenticación JWT

### Importar en Postman

1. Abrir Postman
2. Click en "Import"
3. Seleccionar archivo `postman_collection.json`
4. Configurar variables de entorno:
   - `baseUrl`: `http://localhost:3000`
   - `authToken`: Token JWT obtenido del login

## Scripts Disponibles

```bash
# Desarrollo
npm start              # Iniciar servidor
npm run dev           # Modo desarrollo con nodemon

# Testing
npm test              # Ejecutar tests
npm run test:watch    # Tests en modo watch
npm run test:coverage # Tests con cobertura

# Base de datos
npm run db:migrate    # Ejecutar migraciones
``` 

## Autor

Agustin De Luca

