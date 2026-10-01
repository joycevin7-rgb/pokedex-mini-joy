import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import { getIdFromUrl, capitalize, getSpriteUrl, getTypeColor } from "../utils.js";

function PokemonList({ selectedType }) {
  const [pokemons, setPokemons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPokemons() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch 100 species to ensure we get enough base forms to display
        const response = await fetch(`${API_BASE_URL}/pokemon-species?limit=100`);

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const data = await response.json();
        const speciesUrls = data.results.map((s) => s.url);
        
        // Fetch detailed species data in parallel
        const detailedSpeciesPromises = speciesUrls.map((url) => fetch(url).then(r => r.json()));
        const detailedSpeciesData = await Promise.all(detailedSpeciesPromises);

        // Filter only base forms (evolves_from_species is null)
        const baseForms = detailedSpeciesData.filter(species => species.evolves_from_species === null);
        
        // Map back to the expected pokemons array format and fetch pokemon details for types
        const pokemonPromises = baseForms.slice(0, 50).map(species => 
          fetch(`${API_BASE_URL}/pokemon/${species.id}/`).then(r => r.json())
        );
        
        const detailedPokemons = await Promise.all(pokemonPromises);
        
        const finalPokemons = detailedPokemons.map(p => ({
          name: p.name,
          url: `${API_BASE_URL}/pokemon/${p.id}/`,
          types: p.types.map(t => t.type.name)
        }));

        setPokemons(finalPokemons); // Display exactly 50 base forms
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadPokemons();
  }, []);

  if (isLoading) {
    return <p className="status">Loading Pokémon…</p>;
  }

  if (error) {
    return <p className="status status-error">Couldn't load the list: {error}</p>;
  }

  const filteredPokemons = selectedType === "all" 
    ? pokemons 
    : pokemons.filter(p => p.types && p.types.includes(selectedType));

  return (
    <ul className="pokemon-list">
      {filteredPokemons.map((pokemon) => {
        const id = getIdFromUrl(pokemon.url);
        return (
          <li key={pokemon.name} className="pokemon-list-item">
            <Link to={`/pokemon/${pokemon.name}`} className="pokemon-link">
              <img
                className="pokemon-sprite"
                src={getSpriteUrl(id)}
                alt={pokemon.name}
                width={72}
                height={72}
              />
              <span className="pokemon-id">#{id.padStart(3, "0")}</span>
              <span className="pokemon-name">{capitalize(pokemon.name)}</span>
              {pokemon.types && (
                <div className="pokemon-types" style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  {pokemon.types.map(type => (
                    <span 
                      key={type} 
                      className="type-badge" 
                      style={{ 
                        backgroundColor: getTypeColor(type),
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default PokemonList;