import { Card } from "../orm/index.js";
import functional from "../utils/functional.js";
const { map, identity } = functional;

// Inicializar el mazo de UNO (colores y valores estándar)
const initDeck = async () => {
  const colors = ["red", "yellow", "green", "blue"];
  const values = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "skip",
    "reverse",
    "draw2",
  ];
  const specials = [
    { color: "black", value: "wild", type: "special" },
    { color: "black", value: "wild_draw4", type: "special" },
  ]; // Generar cartas normales

  let deck = [];
  colors.forEach((color) => {
    values.forEach((value) => {
      deck.push({ color, value, type: "normal" });
      if (value !== "0") deck.push({ color, value, type: "normal" }); // Dos de cada excepto 0
    });
  }); // Agregar cartas especiales (4 de cada)

  specials.forEach((card) => {
    for (let i = 0; i < 4; i++) deck.push(card);
  }); // Guardar en la base de datos

  await Card.destroy({ where: {} }); // Limpiar mazo anterior
  await Card.bulkCreate(deck);
  return deck;
};

// Crear una tarjeta individual
const createCard = async (data) => {
  return await Card.create(data);
};

// Obtener tarjeta por ID
const getCardById = async (id) => {
  return await Card.findByPk(id);
};

// Actualizar tarjeta
const updateCard = async (id, data) => {
  const card = await Card.findByPk(id);
  if (!card) return null;
  return await card.update(data);
};

// Eliminar tarjeta
const deleteCard = async (id) => {
  const card = await Card.findByPk(id);
  if (!card) return null;
  await card.destroy();
  return true;
};

// Listar todas las tarjetas
const listCards = async () => {
  const cards = await Card.findAll();
  return map(identity)(cards);
};

// Filtrar cartas por color
const getCardsByColor = async (color) => {
  const cards = await Card.findAll({ where: { color } });
  return map(identity)(cards);
};

// Filtrar cartas por tipo
const getCardsByType = async (type) => {
  const cards = await Card.findAll({ where: { type } });
  return map(identity)(cards);
};

export default {
  initDeck,
  createCard,
  getCardById,
  updateCard,
  deleteCard,
  listCards,
  getCardsByColor,
  getCardsByType,
};
