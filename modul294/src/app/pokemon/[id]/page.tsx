// app/pokemon/[id]/page.tsx
import { use } from 'react';
import Image from "next/image";

async function getPokemonDetails(id) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch Pokémon with id: ${id}`);
    const pokemonData = await res.json();

    // Fetch species data to get German names
    const speciesRes = await fetch(pokemonData.species.url);
    if (!speciesRes.ok) throw new Error(`Failed to fetch species details for Pokémon with id: ${id}`);
    const speciesData = await speciesRes.json();

    // Get German name from species data
    const germanName = speciesData.names.find(name => name.language.name === 'de')?.name || pokemonData.name;

    // Get German abilities
    const germanAbilities = await Promise.all(pokemonData.abilities.map(async (ability) => {
        const abilityRes = await fetch(ability.ability.url);
        if (!abilityRes.ok) throw new Error(`Failed to fetch ability details for ${ability.ability.name}`);
        const abilityData = await abilityRes.json();
        const germanAbilityName = abilityData.names.find(name => name.language.name === 'de')?.name || ability.ability.name;
        return { ...ability, ability: { ...ability.ability, name: germanAbilityName } };
    }));

    // Get German moves
    const germanMoves = await Promise.all(pokemonData.moves.map(async (move) => {
        const moveRes = await fetch(move.move.url);
        if (!moveRes.ok) throw new Error(`Failed to fetch move details for ${move.move.name}`);
        const moveData = await moveRes.json();
        const germanMoveName = moveData.names.find(name => name.language.name === 'de')?.name || move.move.name;
        return { ...move, move: { ...move.move, name: germanMoveName } };
    }));

    return {
        ...pokemonData,
        name: germanName,
        abilities: germanAbilities,
        moves: germanMoves,
    };
}

export default function PokemonDetailsPage({ params }) {
    const pokemon = use(getPokemonDetails(params.id)); // Fetch data

    return (
        <main className="p-6">
            <h1 className="text-3xl font-bold mb-4 capitalize">{pokemon.name}</h1>
            <Image src={pokemon.sprites.front_default} alt={pokemon.name} className="mx-auto mb-4" width={250} height={250} />
            <h2 className="text-2xl font-semibold">Fähigkeiten</h2>
            <ul className="list-disc pl-6">
                {pokemon.abilities.map((ability) => (
                    <li key={ability.ability.name} className="capitalize">
                        {ability.ability.name}
                    </li>
                ))}
            </ul>

            <h2 className="text-2xl font-semibold mt-4">Bewegungen</h2>
            <ul className="list-disc pl-6">
                {pokemon.moves.slice(0, 10).map((move) => (
                    <li key={move.move.name} className="capitalize">
                        {move.move.name}
                    </li>
                ))}
            </ul>
        </main>
    );
}
