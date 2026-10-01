import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import { capitalize, getTypeColor, getStatColor } from "../utils.js";
import EvolutionChain from "../components/EvolutionChain.jsx";

function DetailPage() {
  const { name } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isShiny, setIsShiny] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function loadPokemon() {
      setIsLoading(true);
      setError(null);
      setPokemon(null);
      setSpecies(null);
      setIsShiny(false);

      try {
        const response = await fetch(`${API_BASE_URL}/pokemon/${name}`);

        if (!response.ok) {
          throw new Error(`No Pokémon named "${name}" — check the spelling.`);
        }

        const data = await response.json();
        
        let speciesData = null;
        if (data.species && data.species.url) {
          const speciesRes = await fetch(data.species.url);
          if (speciesRes.ok) {
            speciesData = await speciesRes.json();
          }
        }

        if (isCurrent) {
          setPokemon(data);
          setSpecies(speciesData);
        }
      } catch (err) {
        if (isCurrent) {
          setError(err.message);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadPokemon();

    return () => {
      isCurrent = false;
    };
  }, [name]);

  if (isLoading) return <p className="status">Loading {name}…</p>;
  if (error) return <p className="status status-error">{error}</p>;

  // Extract English flavor text
  let flavorText = "";
  if (species && species.flavor_text_entries) {
    const enEntry = species.flavor_text_entries.find(entry => entry.language.name === "en");
    if (enEntry) {
      flavorText = enEntry.flavor_text.replace(/\f/g, " "); // Remove form feed characters
    }
  }
  
  const playCry = () => {
    if (pokemon.cries && pokemon.cries.latest) {
      const audio = new Audio(pokemon.cries.latest);
      audio.play();
    }
  };

  const spriteUrl = isShiny 
    ? (pokemon.sprites.other["official-artwork"]?.front_shiny || pokemon.sprites.front_shiny) 
    : (pokemon.sprites.other["official-artwork"]?.front_default || pokemon.sprites.front_default);

  return (
    <div className="detail-page">
      <Link to="/" className="back-link" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        background: '#f0f0f0',
        color: '#333',
        textDecoration: 'none',
        borderRadius: '20px',
        fontWeight: '600',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        marginBottom: '24px'
      }}>
        ← Back to list
      </Link>
      
      <div className="pokemon-image-container" style={{ position: "relative", width: "200px", margin: "0 auto" }}>
        <img
          src={spriteUrl}
          alt={pokemon.name}
          width={200}
          height={200}
          style={{ transition: "all 0.3s" }}
        />
      </div>

      <div className="action-bar" style={{ 
        display: "inline-flex", 
        alignItems: "center", 
        gap: "16px", 
        background: "#fff", 
        padding: "8px 24px", 
        borderRadius: "30px", 
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)", 
        margin: "16px 0" 
      }}>
        {pokemon.cries && pokemon.cries.latest && (
          <button 
            onClick={playCry} 
            className="cry-button-inline"
            title="Play Cry"
            style={{
              background: "none",
              border: "none",
              fontSize: "1.2rem",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center"
            }}
          >
            🔊
          </button>
        )}
        
        <div style={{ width: "1px", height: "24px", background: "#eee" }}></div>
        
        <label className="shiny-switch-label" style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "600", color: "#555" }}>
          <span style={{ fontSize: "0.9rem" }}>✨ Shiny</span>
          <div className={`modern-switch ${isShiny ? 'active' : ''}`}>
            <div className="modern-switch-thumb"></div>
          </div>
          <input 
            type="checkbox" 
            checked={isShiny} 
            onChange={(e) => setIsShiny(e.target.checked)} 
            style={{ display: "none" }}
          />
        </label>
      </div>

      <h2 style={{ fontSize: '2rem', marginTop: '16px', marginBottom: '8px' }}>{capitalize(pokemon.name)}</h2>
      
      {flavorText && (
        <p className="flavor-text">
          "{flavorText}"
        </p>
      )}

      <div className="pokemon-types" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
        {pokemon.types.map((t) => (
          <span 
            key={t.type.name} 
            className="type-badge" 
            style={{ 
              backgroundColor: getTypeColor(t.type.name),
              color: 'white',
              padding: '4px 16px',
              borderRadius: '20px',
              fontWeight: '600',
              textTransform: 'capitalize'
            }}
          >
            {t.type.name}
          </span>
        ))}
      </div>
      
      <ul className="stat-list">
        {pokemon.stats.map((s) => (
          <li key={s.stat.name}>
            <span className="stat-name">{s.stat.name.replace('-', ' ')}</span>
            <span className="stat-value">{s.base_stat}</span>
            <div className="stat-bar-bg">
              <div 
                className="stat-bar-fill" 
                style={{ 
                  width: `${Math.min(100, (s.base_stat / 255) * 100)}%`,
                  backgroundColor: getStatColor(s.stat.name) 
                }}
              ></div>
            </div>
          </li>
        ))}
      </ul>
      
      {pokemon.species && pokemon.species.url && (
        <EvolutionChain speciesUrl={pokemon.species.url} />
      )}
    </div>
  );
}

export default DetailPage;