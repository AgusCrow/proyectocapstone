import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Player } from '../orm/index.js';

const SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  const existing = await Player.findOne({ where: { username } });
  if (existing) {
    return res.status(409).json({ error: 'User already exists' });
  }
  const hash = await bcrypt.hash(password, 10);
  await Player.create({ username, email, password: hash });
  return res.json({ message: 'User registered successfully' });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }
  const user = await Player.findOne({ where: { username } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '2h' });
  return res.json({ access_token: token });
};

// Para logout, en JWT se suele manejar en el cliente, pero se puede simular
const logout = async (req, res) => {
  // En una implementación real, se podría invalidar el token en una blacklist
  return res.json({ message: 'User logged out successfully' });
};

const profile = async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token requerido' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
        return res.json({ 
      username: decoded.username, 
      id: decoded.id,
      message: 'Profile retrieved from token'
    });
  } catch (e) {
    console.error('Profile error:', e);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export default { register, login, logout, profile };