document.addEventListener('DOMContentLoaded', () => {
    const pokemonContainer = document.getElementById('pokemon-container');
    const refreshButton = document.getElementById('refresh-button');

    const starterPokemon = {
        1: [{ name: 'Bulbasaur', type: 'grass' }, { name: 'Charmander', type: 'fire' }, { name: 'Squirtle', type: 'water' }],
        2: [{ name: 'Chikorita', type: 'grass' }, { name: 'Cyndaquil', type: 'fire' }, { name: 'Totodile', type: 'water' }],
        3: [{ name: 'Treecko', type: 'grass' }, { name: 'Torchic', type: 'fire' }, { name: 'Mudkip', type: 'water' }],
        4: [{ name: 'Turtwig', type: 'grass' }, { name: 'Chimchar', type: 'fire' }, { name: 'Piplup', type: 'water' }],
        5: [{ name: 'Snivy', type: 'grass' }, { name: 'Tepig', type: 'fire' }, { name: 'Oshawott', type: 'water' }],
        6: [{ name: 'Chespin', type: 'grass' }, { name: 'Fennekin', type: 'fire' }, { name: 'Froakie', type: 'water' }],
        7: [{ name: 'Rowlet', type: 'grass' }, { name: 'Litten', type: 'fire' }, { name: 'Popplio', type: 'water' }],
        8: [{ name: 'Grookey', type: 'grass' }, { name: 'Scorbunny', type: 'fire' }, { name: 'Sobble', type: 'water' }],
        9: [{ name: 'Sprigatito', type: 'grass' }, { name: 'Fuecoco', type: 'fire' }, { name: 'Quaxly', type: 'water' }]
    };

    async function getPokemonData(pokemonName) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
            if (!response.ok) {
                if (response.status === 404) {
                    console.error(`Pokemon ${pokemonName} not found.`);
                    return null;
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
            const data = await response.json();
            if (!data || !data.sprites || !data.sprites.front_default || !data.types || data.types.length === 0 || !data.types[0].type || !data.types[0].type.name) {
                console.error(`Invalid data received for ${pokemonName}:`, data);
                return null;
            }
            return data;
        } catch (error) {
            console.error("Error fetching Pokemon data:", error);
            return null;
        }
    }

    async function generateRandomTrio() {
        const trio = [];
        const types = ['grass', 'fire', 'water'];
        const usedGenerations = new Set();
        const usedPokemon = new Set();
        let attempts = 0;
        const maxAttempts = 50;

        for (const type of types) { // Itera *nell'ordine* dei tipi
            let pokemonData = null;
            let typeAttempts = 0;
            const maxTypeAttempts = 20;

            while (!pokemonData && typeAttempts < maxTypeAttempts) {
                typeAttempts++;
                const randomGeneration = Math.floor(Math.random() * Object.keys(starterPokemon).length) + 1;

                if (!usedGenerations.has(randomGeneration)) {
                    const generationStarters = starterPokemon[randomGeneration];
                    const availablePokemon = generationStarters.filter(pokemon => !usedPokemon.has(pokemon.name) && pokemon.type === type);

                    if (availablePokemon.length > 0) {
                        const randomStarter = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
                        pokemonData = await getPokemonData(randomStarter.name);

                        if (pokemonData && pokemonData.types && pokemonData.types.length > 0 && pokemonData.types[0].type && pokemonData.types[0].type.name && pokemonData.types[0].type.name === type) {
                            trio.push({
                                name: pokemonData.name,
                                image: pokemonData.sprites.front_default,
                                type: type
                            });
                            usedGenerations.add(randomGeneration);
                            usedPokemon.add(randomStarter.name);
                        }
                    }
                }
            }

            if (!pokemonData) {
                console.error(`Failed to find a Pokemon of type ${type} after ${maxTypeAttempts} attempts.`);
                return null;
            }
        }

        return trio;
    }


    let chosenPokemon = null;

    function displayTrio(trio) {
        pokemonContainer.innerHTML = ''; // Clear container first

        if (!trio) {
            console.error("No valid trio to display.");
            pokemonContainer.innerHTML = "<p>Error loading Pokémon.</p>";
            return;
        }

        trio.forEach(pokemon => {
            const pokemonDiv = document.createElement('div');
            pokemonDiv.classList.add('pokemon');
            pokemonDiv.innerHTML = `
                <img src="${pokemon.image}" alt="${pokemon.name}">
                <p>${pokemon.name}</p>
            `;

            pokemonDiv.addEventListener('click', () => {
                choosePokemon(pokemon, trio);
            });

            pokemonContainer.appendChild(pokemonDiv);
        });
    }


    function choosePokemon(pokemon, trio) {
        const pokemonDivs = pokemonContainer.querySelectorAll('.pokemon');

        if (chosenPokemon && chosenPokemon.name === pokemon.name) {
            // Se clicchi di nuovo sullo stesso Pokémon, deseleziona tutto
            chosenPokemon = null;
            pokemonDivs.forEach(pokemonDiv => {
                pokemonDiv.classList.remove('chosen', 'not-chosen');
            });
        } else {
            chosenPokemon = pokemon;
            pokemonDivs.forEach(pokemonDiv => {
                const pokemonName = pokemonDiv.querySelector('p').textContent;
                if (pokemonName === chosenPokemon.name) {
                    pokemonDiv.classList.add('chosen');
                    pokemonDiv.classList.remove('not-chosen');
                } else {
                    pokemonDiv.classList.remove('chosen');
                    pokemonDiv.classList.add('not-chosen');
                }
            });
        }
    }

    function refreshPage() {
        chosenPokemon = null;
        generateRandomTrio().then(displayTrio); // No need to clear, displayTrio does it
    }

    refreshButton.addEventListener('click', refreshPage);

    // Initial display: Show loading message, then display trio
    displayTrio([]); // Show loading message
    generateRandomTrio().then(displayTrio);

});