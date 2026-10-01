import { SPRITE_BASE_URL } from "./config.js";

export function getIdFromUrl(url) {
  // url looks like "https://pokeapi.co/api/v2/pokemon/25/"
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

export function capitalize(name) {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function getSpriteUrl(id) {
  return `${SPRITE_BASE_URL}/${id}.png`;
}

export const TYPE_COLORS = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

export function getTypeColor(type) {
  return TYPE_COLORS[type] || "#777";
}

export function getStatColor(statName) {
  switch (statName) {
    case "hp": return "#78C850"; // Green
    case "attack": return "#F08030"; // Orange
    case "defense": return "#F8D030"; // Yellow
    case "special-attack": return "#6890F0"; // Blue
    case "special-defense": return "#A890F0"; // Purple
    case "speed": return "#F85888"; // Pink
    default: return "#cc0000"; // Default red
  }
}