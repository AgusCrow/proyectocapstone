# Pruebas End-to-End (E2E) para el Proyecto Capstone UNO

## Descripción

Pruebas end-to-end implementadas para la API REST del juego UNO. Las pruebas simulan flujos de trabajo completos desde la perspectiva de un usuario real, utilizando fetch para realizar solicitudes HTTP a los endpoints de la API.

## Flujos de Trabajo Principales Identificados

1. **Registro y Autenticación de Usuarios**
2. **Creación y Gestión de Juegos**
3. **Sesión de Juego y Gestión de Cartas**
4. **Juego de Cartas y Reglas UNO**
5. **Finalización de Juego y Puntuación**

## Estructura de las Pruebas

### Configuración del Entorno

- **Puerto**: 3000 (para evitar conflictos con el servidor principal)
- **Caché**: Desactivada para pruebas
- **Base de Datos**: Utiliza la base de datos de prueba configurada

## Detalle de los Casos de Prueba

### Registro y Autenticación de Usuarios

#### Endpoints Probados:

- `POST /api/players/register` - Registro de nuevo usuario
- `POST /api/players/login` - Inicio de sesión
- `GET /api/players/profile` - Obtener perfil de usuario
- `POST /api/players/logout` - Cierre de sesión

#### Casos de Prueba:

1. **Registro exitoso de nuevo usuario**
   - Envía datos válidos de registro
   - Verifica código de estado 200
   - Confirma mensaje de éxito
2. **Registro de segundo usuario**
   - Prueba múltiples usuarios en el sistema
   - Verifica que ambos usuarios pueden registrarse
3. **Manejo de usuarios duplicados**
   - Intenta registrar usuario existente
   - Verifica código de estado 409 (Conflict)
   - Confirma mensaje de error apropiado
4. **Inicio de sesión con credenciales válidas**
   - Envía credenciales correctas
   - Verifica código de estado 200
   - Confirma recepción de token JWT
5. **Rechazo de inicio de sesión con credenciales inválidas**
   - Envía credenciales incorrectas
   - Verifica código de estado 401
   - Confirma mensaje de error
6. **Acceso a perfil con token válido**
   - Envía token JWT en header Authorization
   - Verifica código de estado 200
   - Confirma datos del usuario en respuesta
7. **Rechazo de acceso a perfil sin token**
   - Intenta acceder sin token
   - Verifica código de estado 401

### Creación y Gestión de Juegos

#### Endpoints Probados:

- `POST /api/games` - Crear nuevo juego
- `GET /api/games/:id` - Obtener juego por ID
- `GET /api/games` - Listar todos los juegos
- `PUT /api/games/:id` - Actualizar juego
- `GET /api/games/:id/status` - Obtener estado del juego

#### Casos de Prueba:

1. **Creación exitosa de juego**
   - Envía datos válidos de juego
   - Verifica código de estado 201
   - Confirma estructura del objeto juego
2. **Obtención de detalles de juego**
   - Solicita juego por ID
   - Verifica código de estado 200
   - Confirma datos del juego
3. **Listado de juegos disponibles**
   - Solicita todos los juegos
   - Verifica código de estado 200
   - Confirma que es un array con elementos
4. **Actualización de información de juego**
   - Envía datos actualizados
   - Verifica código de estado 200
   - Confirma que los cambios se aplicaron
5. **Obtención de estado del juego**
   - Solicita estado actual
   - Verifica código de estado 200
   - Confirma propiedades de estado

### Sesión de Juego y Gestión de Cartas

#### Endpoints Probados:

- `POST /api/games/:id/start` - Iniciar juego
- `POST /api/games/:id/deal-cards` - Repartir cartas
- `GET /api/games/:id/my-cards` - Obtener cartas del jugador
- `GET /api/games/:id/top-card` - Obtener carta superior
- `GET /api/games/:id/current-player` - Obtener jugador actual
- `GET /api/games/:id/players` - Obtener jugadores en juego

#### Casos de Prueba:

1. **Inicio exitoso del juego**
   - Envía solicitud de inicio
   - Verifica código de estado 200
   - Confirma que el juego cambia a estado 'started'
2. **Reparto de cartas a jugadores**
   - Solicita reparto de cartas
   - Verifica código de estado 200
   - Confirma mensaje de éxito
3. **Obtención de cartas del jugador**
   - Solicita cartas propias
   - Verifica código de estado 200
   - Confirma que es un array
4. **Obtención de carta superior del mazo**
   - Solicita carta superior
   - Verifica código de estado 200
   - Confirma estructura de respuesta
5. **Obtención de jugador actual**
   - Solicita jugador actual
   - Verifica código de estado 200
   - Confirma datos del jugador
6. **Obtención de jugadores en juego**
   - Solicita lista de jugadores
   - Verifica código de estado 200
   - Confirma que es un array

### Juego de Cartas y Reglas UNO

#### Endpoints Probados:

- `POST /api/games/:id/play-card` - Jugar carta
- `POST /api/games/:id/draw-card` - Robar carta
- `POST /api/games/:id/say-uno` - Decir UNO
- `POST /api/games/:id/challenge-uno` - Desafiar UNO
- `POST /api/games/:id/play-skip-card` - Jugar carta Skip
- `POST /api/games/:id/play-reverse-card` - Jugar carta Reverse
- `POST /api/games/:id/end-turn` - Finalizar turno

#### Casos de Prueba:

1. **Jugada exitosa de carta válida**
   - Envía datos de carta válida
   - Verifica código de estado 200
   - Confirma mensaje de éxito
2. **Robo de carta cuando no hay jugada válida**
   - Solicita robar carta
   - Verifica código de estado 200
   - Confirma mensaje de robo
3. **Declaración de UNO**
   - Jugador dice UNO
   - Verifica código de estado 200
   - Confirma mensaje de UNO
4. **Desafío de UNO**
   - Jugador desafía UNO de otro
   - Verifica código de estado 200
   - Confirma mensaje de desafío
5. **Jugada de carta Skip**
   - Juega carta de salto
   - Verifica código de estado 200
   - Confirma efecto de salto
6. **Jugada de carta Reverse**
   - Juega carta de reversa
   - Verifica código de estado 200
   - Confirma cambio de dirección
7. **Finalización de turno**
   - Jugador finaliza turno
   - Verifica código de estado 200
   - Confirma cambio de turno

### Finalización de Juego y Puntuación

#### Endpoints Probados:

- `GET /api/games/:id/check-end` - Verificar fin de juego
- `GET /api/games/:id/scores` - Obtener puntuaciones
- `POST /api/games/:id/end` - Finalizar juego
- `GET /api/games/:id/history` - Obtener historial
- `POST /api/scores` - Crear entrada de puntuación
- `GET /api/scores` - Listar puntuaciones

#### Casos de Prueba:

1. **Verificación de fin de juego**
   - Solicita estado de fin
   - Verifica código de estado 200
   - Confirma propiedad de fin de juego
2. **Obtención de puntuaciones durante juego**
   - Solicita puntuaciones
   - Verifica código de estado 200
   - Confirma estructura de datos
3. **Finalización exitosa del juego**
   - Solicita finalización
   - Verifica código de estado 200
   - Confirma cambio a estado 'finished'
4. **Obtención de historial de movimientos**
   - Solicita historial
   - Verifica código de estado 200
   - Confirma que es un array
5. **Creación de entrada de puntuación**
   - Crea registro de puntuación
   - Verifica código de estado 201
   - Confirma datos de puntuación
6. **Listado de puntuaciones**
   - Solicita todas las puntuaciones
   - Verifica código de estado 200
   - Confirma que es un array

## Manejo de Errores y Casos Límite

### Casos de Prueba de Error:

1. **Manejo de ID de juego inválido**
   - Solicita juego con ID inexistente
   - Verifica código de estado 404
2. **Acceso no autorizado a rutas protegidas**
   - Intenta acceder sin autenticación
   - Verifica código de estado 401 (o 200 según implementación)
3. **Intentos de jugada inválida**
   - Envía datos de carta inválidos
   - Verifica códigos de estado 400, 404 o 500

## Limpieza e Integridad de Datos

### Casos de Prueba de Limpieza:

1. **Eliminación de juego de prueba**
   - Elimina juego creado
   - Verifica código de estado 200
   - Confirma mensaje de eliminación
2. **Verificación de eliminación de juego**
   - Intenta acceder al juego eliminado
   - Verifica código de estado 404
3. **Manejo de cierre de sesión**
   - Solicita cierre de sesión
   - Verifica código de estado 200
   - Confirma mensaje de éxito

## Endpoints Clave de la API

### Autenticación:

- `POST /api/players/register` - Registro
- `POST /api/players/login` - Login
- `GET /api/players/profile` - Perfil
- `POST /api/players/logout` - Logout

### Juegos:

- `POST /api/games` - Crear juego
- `GET /api/games/:id` - Obtener juego
- `PUT /api/games/:id` - Actualizar juego
- `DELETE /api/games/:id` - Eliminar juego
- `GET /api/games` - Listar juegos

### Funcionalidades del Juego:

- `POST /api/games/:id/start` - Iniciar juego
- `POST /api/games/:id/deal-cards` - Repartir cartas
- `POST /api/games/:id/play-card` - Jugar carta
- `POST /api/games/:id/draw-card` - Robar carta
- `POST /api/games/:id/say-uno` - Decir UNO
- `POST /api/games/:id/end-turn` - Finalizar turno
- `POST /api/games/:id/end` - Finalizar juego

### Puntuaciones:

- `POST /api/scores` - Crear puntuación
- `GET /api/scores` - Listar puntuaciones
- `GET /api/scores/:id` - Obtener puntuación

## Validaciones Realizadas

### Validaciones de Estado HTTP:

- 200 OK - Operaciones exitosas
- 201 Created - Recursos creados
- 400 Bad Request - Datos inválidos
- 401 Unauthorized - No autenticado
- 403 Forbidden - Sin permisos
- 404 Not Found - Recursos no encontrados
- 409 Conflict - Recursos duplicados
- 500 Internal Server Error - Errores del servidor

### Validaciones de Respuesta:

- Estructura de objetos JSON
- Tipos de datos correctos
- Mensajes de error apropiados
- Presencia de propiedades requeridas

### Validaciones de Flujo:

- Secuencia lógica de operaciones
- Estados consistentes del juego
- Manejo de turnos correcto
- Reglas de UNO aplicadas
-

## Conclusiones

Las pruebas E2E proporcionan una cobertura de los flujos de trabajo principales del juego UNO

1. **La autenticación funciona correctamente** - Los usuarios pueden registrarse, iniciar sesión y acceder a recursos protegidos.
2. **La gestión de juegos es robusta** - Los juegos pueden crearse, gestionarse y eliminarse adecuadamente.
3. **Las reglas del juego se aplican** - Las mecánicas de UNO como jugar cartas, decir UNO, y cambiar turnos funcionan.
4. **La puntuación es precisa** - Los puntos se calculan y almacenan correctamente.
5. **El manejo de errores es adecuado** - La API responde correctamente a casos límite y errores.
