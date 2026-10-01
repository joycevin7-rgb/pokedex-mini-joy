import { useState } from "react";
import SearchForm from "../components/SearchForm.jsx";
import PokemonList from "../components/PokemonList.jsx";

function ListPage() {
  const [selectedType, setSelectedType] = useState("all");

  return (
    <>
      <SearchForm selectedType={selectedType} onTypeChange={setSelectedType} />
      <PokemonList selectedType={selectedType} />
    </>
  );
}

export default ListPage;