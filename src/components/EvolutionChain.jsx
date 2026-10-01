import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getIdFromUrl, capitalize, getSpriteUrl } from "../utils.js";

function parseChain(node) {
  const speciesName = node.species.name;
  const speciesId = getIdFromUrl(node.species.url);
  const spriteUrl = getSpriteUrl(speciesId);
  
  let evolutionDetails = null;
  if (node.evolution_details && node.evolution_details.length > 0) {
    const details = node.evolution_details[0];
    if (details.min_level) {
      evolutionDetails = `Lvl ${details.min_level}`;
    } else if (details.item) {
      evolutionDetails = capitalize(details.item.name.replace("-", " "));
    } else if (details.trigger) {
      evolutionDetails = capitalize(details.trigger.name.replace("-", " "));
    }
  }

  const evolvesTo = node.evolves_to.map(child => parseChain(child));

  return {
    name: speciesName,
    id: speciesId,
    sprite: spriteUrl,
    details: evolutionDetails,
    evolvesTo: evolvesTo
  };
}

function EvolutionNode({ node }) {
  return (
    <div className="evo-node">
      <div className="evo-pokemon">
        <Link to={`/pokemon/${node.name}`} className="evo-link">
          <img src={node.sprite} alt={node.name} width={72} height={72} />
          <span className="evo-name">{capitalize(node.name)}</span>
        </Link>
      </div>
      
      {node.evolvesTo.length > 0 && (
        <div className="evo-branches">
          {node.evolvesTo.map(child => (
            <div key={child.name} className="evo-branch">
              <div className="evo-details">
                {child.details && <span className="evo-trigger">{child.details}</span>}
                <span className="evo-arrow">→</span>
              </div>
              <EvolutionNode node={child} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EvolutionChain({ speciesUrl }) {
  const [chain, setChain] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadEvolutionChain() {
      setIsLoading(true);
      setError(null);

      try {
        const speciesRes = await fetch(speciesUrl);
        if (!speciesRes.ok) throw new Error("Failed to fetch species data");
        const speciesData = await speciesRes.json();

        if (!speciesData.evolution_chain) {
            if (isCurrent) setChain(null);
            return;
        }

        const chainRes = await fetch(speciesData.evolution_chain.url);
        if (!chainRes.ok) throw new Error("Failed to fetch evolution chain data");
        const chainData = await chainRes.json();

        if (isCurrent) {
          setChain(parseChain(chainData.chain));
        }
      } catch (err) {
        if (isCurrent) setError(err.message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    if (speciesUrl) {
      loadEvolutionChain();
    }

    return () => {
      isCurrent = false;
    };
  }, [speciesUrl]);

  if (isLoading) return <p className="status">Loading evolution chain…</p>;
  if (error) return <p className="status status-error">{error}</p>;
  if (!chain) return null;

  return (
    <div className="evolution-container">
      <h3 className="evolution-title">Evolution Chain</h3>
      <div className="evolution-tree">
        <EvolutionNode node={chain} />
      </div>
    </div>
  );
}

export default EvolutionChain;
