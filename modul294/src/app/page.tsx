'use client';

import {useState, useEffect} from 'react';
import Image from "next/image";

export default function HomePage() {
    const [pokemons, setPokemons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [offset, setOffset] = useState(151);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [filteredPokemons, setFilteredPokemons] = useState([]);

    // Mapping of Pokémon types to their respective colors
    const typeColors = {
        fire: '#F08030',
        water: '#6890F0',
        grass: '#78C850',
        electric: '#F8D030',
        psychic: '#F85888',
        ice: '#98D8D8',
        dragon: '#7038F8',
        dark: '#705848',
        fairy: '#EE99AC',
        normal: '#A8A878',
        fighting: '#C03028',
        flying: '#A890F0',
        poison: '#A040A0',
        ground: '#E0C068',
        rock: '#B8A038',
        bug: '#A8B820',
        ghost: '#705898',
        steel: '#B8B8D0',
        death: '#4B0082',
        time: '#00CED1',
        light: '#FFFFE0',
        cosmic: '#9370DB',
        sound: '#FF6347',
        space: '#778899',
    };

    // Function to fetch Pokémon with offset and limit
    const fetchPokemon = async (offset = 0, limit = 151) => {
        try {
            setLoading(true);
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();

            // Fetch detailed data for each Pokémon to get images and names in German
            const detailedPokemonPromises = data.results.map(async (pokemon) => {
                const res = await fetch(pokemon.url);
                if (!res.ok) throw new Error(`Failed to fetch details for ${pokemon.name}`);
                const detailedData = await res.json();

                // Fetch species data to get names in German
                const speciesRes = await fetch(detailedData.species.url);
                if (!speciesRes.ok) throw new Error(`Failed to fetch species details for ${detailedData.name}`);
                const speciesData = await speciesRes.json();

                // Get the German name from the species data
                const germanName = speciesData.names.find(name => name.language.name === 'de')?.name || detailedData.name;

                // Extract Pokémon types
                const types = detailedData.types.map(typeInfo => typeInfo.type.name);

                // Return Pokémon data with the German name and types
                return {
                    ...detailedData,
                    name: germanName,
                    types,
                };
            });

            const detailedPokemon = await Promise.all(detailedPokemonPromises);
            setPokemons((prevPokemons) => [...prevPokemons, ...detailedPokemon]);
        } catch (error) {
            console.error('Error fetching Pokémon:', error);
            setError(error);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchPokemon(0, 151); // Initial fetch of the first 151 Pokémon
        setOffset(151); // Update offset after the first fetch
    }, []);

    // Update filteredPokemons when search or selectedTypes changes
    useEffect(() => {
        console.log('Filtering with selected types:', selectedTypes); // Debugging output
        const filtered = pokemons.filter((pokemon) => {
            const matchesSearch = pokemon.name.toLowerCase().includes(search);
            const matchesType = selectedTypes.length > 0
                ? selectedTypes.some(type => pokemon.types.includes(type))
                : true; // Show all if no type is selected
            return matchesSearch && matchesType;
        });
        setFilteredPokemons(filtered);
        console.log('Filtered Pokemons:', filtered); // Debugging output
    }, [search, selectedTypes, pokemons]);


    // Example check to see the types of each Pokémon
    useEffect(() => {
        pokemons.forEach(pokemon => {
            console.log(pokemon.name, pokemon.types); // Output Pokémon name and types
        });
    }, [pokemons]);


    // Handle search input
    const handleSearch = (e) => {
        setSearch(e.target.value.toLowerCase());
    };

    // Handle type selection
    // Check if the handleTypeSelect is updating selectedTypes correctly
    const handleTypeSelect = (type) => {
        setSelectedTypes(prevTypes => {
            const newTypes = prevTypes.includes(type)
                ? prevTypes.filter(t => t !== type)  // Remove type if already selected
                : [...prevTypes, type];              // Add type if not selected
            console.log('Selected Types:', newTypes); // Debugging output
            return newTypes;
        });
    };
    // Function to handle loading more Pokémon
    const loadMorePokemon = () => {
        setIsLoadingMore(true);
        fetchPokemon(offset, 100); // Use the current offset and limit
        setOffset(offset + 100); // Update offset correctly after fetching more Pokémon
    };

    if (loading && pokemons.length === 0) {
        return <p className="text-center text-lg text-blue-500">Loading the Pokemon list...</p>;
    }

    if (error) {
        return <p className="text-center text-lg text-red-500">{error.message}</p>;
    }

    // List of Pokémon types for visual display
    const pokemonTypes = Object.keys(typeColors);

    return (
        <main className="p-6 relative">
            <iframe className="border-radius:12px"
                    src="https://open.spotify.com/embed/track/4es7tZLsvmqc8kpyHOtHDI?utm_source=generator&theme=0"
                    width="100%"
                    height="252"
                    allowFullScreen=""
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy">
            </iframe>
            <h1 className="text-3xl font-bold mb-4">Welcome to the Pokemon App</h1>

            <input
                type="text"
                placeholder="Search Pokemon by name"
                value={search}
                onChange={handleSearch}
                className="w-full p-2 mb-4 border border-gray-300 rounded text-black"
            />

            <div className="flex flex-wrap gap-2 mb-4">
                {pokemonTypes.map((type) => (
                    <button
                        key={type}
                        onClick={() => handleTypeSelect(type)}
                        className={`px-2 py-1 rounded ${
                            selectedTypes.includes(type) ? 'ring-2 ring-offset-2 ring-white' : ''
                        }`}
                        style={{
                            backgroundColor: typeColors[type],
                            color: 'white',
                            textShadow: '0px 0px 2px black',
                            border: '1px solid black',
                            minWidth: '60px',
                            textAlign: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                ))}
            </div>

            {search && filteredPokemons.length === 0 && (
                <p className="text-center text-red-500">No results found for {search}</p>
            )}
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPokemons.map((pokemon, index) => (
                    <li key={`${pokemon.id}-${index}`} className="text-center p-4 border rounded shadow">
                        <a href={`/pokemon/${pokemon.id}`}>
                            <Image
                                src={pokemon.sprites.front_default}
                                alt={pokemon.name}
                                width={96}
                                height={96}
                                className="mx-auto mb-2"
                            />
                            <p className="text-lg capitalize">{pokemon.name}</p>
                            <div className="flex justify-center gap-2 mt-2">
                                {pokemon.types.map((type) => (
                                    <span
                                        key={type}
                                        className="px-2 py-1 rounded"
                                        style={{
                                            backgroundColor: typeColors[type],
                                            color: 'white',
                                            textShadow: '0px 0px 2px black',
                                            border: '1px solid black',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                        }}
                                    >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                                ))}
                            </div>
                        </a>
                    </li>
                ))}
            </ul>

            <div className="text-center mt-4">
                <button
                    onClick={loadMorePokemon}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={isLoadingMore}
                >
                    {isLoadingMore ? 'Loading...' : 'Load More Pokémon'}
                </button>
            </div>
        </main>
    );
}
