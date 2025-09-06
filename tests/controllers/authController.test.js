jest.mock("bcrypt", () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
    compare: jest.fn(),
  },
}));

jest.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: {
    sign: jest.fn(),
    verify: jest.fn(),
  },
}));

jest.mock("../../src/orm/index.js", () => ({
  __esModule: true,
  Player: {
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
  },
}));

// Funciones puras para testing
const createMockRequest = (body = {}, params = {}, headers = {}) => ({
  body,
  params,
  headers,
  json: jest.fn(),
  status: jest.fn().mockReturnThis(),
});

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Importar después de los mocks
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authController from "../../src/controllers/authController.js";
import { Player } from "../../src/orm/index.js";

describe("Auth Controller Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("debería registrar un usuario exitosamente", async () => {
      // Arrange
      const req = createMockRequest({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });
      const res = createMockResponse();
      const hashedPassword = "hashedPassword123";

      Player.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      Player.create.mockResolvedValue({
        id: 1,
        username: "testuser",
        email: "test@example.com",
      });

      // Act
      await authController.register(req, res);

      // Assert
      expect(Player.findOne).toHaveBeenCalledWith({
        where: { username: "testuser" },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(Player.create).toHaveBeenCalledWith({
        username: "testuser",
        email: "test@example.com",
        password: hashedPassword,
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "User registered successfully",
      });
    });

    it("debería retornar error 400 cuando faltan campos requeridos", async () => {
      // Arrange
      const req = createMockRequest({
        username: "testuser",
        // Falta email y password
      });
      const res = createMockResponse();

      // Act
      await authController.register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Faltan campos obligatorios",
      });
    });

    it("debería retornar error 409 cuando el usuario ya existe", async () => {
      // Arrange
      const req = createMockRequest({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });
      const res = createMockResponse();

      Player.findOne.mockResolvedValue({ id: 1, username: "testuser" });

      // Act
      await authController.register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: "User already exists",
      });
    });
  });

  describe("login", () => {
    it("debería iniciar sesión exitosamente", async () => {
      // Arrange
      const req = createMockRequest({
        username: "testuser",
        password: "password123",
      });
      const res = createMockResponse();
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        password: "hashedPassword123",
      };
      const mockToken = "mock.jwt.token";

      Player.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue(mockToken);

      // Act
      await authController.login(req, res);

      // Assert
      expect(Player.findOne).toHaveBeenCalledWith({
        where: { username: "testuser" },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedPassword123"
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockUser.id, username: mockUser.username },
        "secreto_ultra_seguro",
        { expiresIn: "2h" }
      );
      expect(res.json).toHaveBeenCalledWith({
        access_token: mockToken,
      });
    });

    it("debería retornar error 400 cuando faltan campos requeridos", async () => {
      // Arrange
      const req = createMockRequest({
        username: "testuser",
        // Falta password
      });
      const res = createMockResponse();

      // Act
      await authController.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Faltan credenciales",
      });
    });

    it("debería retornar error 401 cuando el usuario no existe", async () => {
      // Arrange
      const req = createMockRequest({
        username: "nonexistent",
        password: "password123",
      });
      const res = createMockResponse();

      Player.findOne.mockResolvedValue(null);

      // Act
      await authController.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid credentials",
      });
    });

    it("debería retornar error 401 cuando la contraseña es incorrecta", async () => {
      // Arrange
      const req = createMockRequest({
        username: "testuser",
        password: "wrongpassword",
      });
      const res = createMockResponse();
      const mockUser = {
        id: 1,
        username: "testuser",
        password: "hashedPassword123",
      };

      Player.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      // Act
      await authController.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid credentials",
      });
    });
  });

  describe("logout", () => {
    it("debería cerrar sesión exitosamente", async () => {
      // Arrange
      const req = createMockRequest();
      const res = createMockResponse();

      // Act
      await authController.logout(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        message: "User logged out successfully",
      });
    });
  });

  describe("profile", () => {
    it("debería obtener el perfil del usuario autenticado", async () => {
      // Arrange (sin cambios)
      const req = createMockRequest(
        {},
        {},
        {
          authorization: "Bearer valid.token",
        }
      );
      const res = createMockResponse();
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
      };
      jwt.verify.mockReturnValue({ id: 1, username: "testuser" });
      Player.findByPk.mockResolvedValue(mockUser);

      // Act (sin cambios)
      await authController.profile(req, res);

      // Assert (corregido)
      expect(jwt.verify).toHaveBeenCalledWith(
        "valid.token",
        "secreto_ultra_seguro"
      );
      expect(Player.findByPk).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        username: mockUser.username,
        id: mockUser.id,
        message: "Profile retrieved from token",
      });
    });

    it("debería retornar error 401 cuando no hay token", async () => {
      // Arrange
      const req = createMockRequest({}, {}, {});
      const res = createMockResponse();

      // Act
      await authController.profile(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Token requerido",
      });
    });

    it("debería retornar error 404 cuando el usuario no existe", async () => {
      // Arrange
      const req = createMockRequest(
        {},
        {},
        {
          authorization: "Bearer valid.token",
        }
      );
      const res = createMockResponse();

      jwt.verify.mockReturnValue({ id: 999, username: "testuser" });
      Player.findByPk.mockResolvedValue(null);

      // Act
      await authController.profile(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Usuario no encontrado",
      });
    });
  });
});
