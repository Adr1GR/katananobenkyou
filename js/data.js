export let characters = [];
export let enemies = [];
export let dungeons = [];

// Cargar personajes desde la carpeta characters
async function loadCharactersForDungeons(totalDungeons) {
  const characterPromises = [];
  
  for (let i = 1; i <= totalDungeons; i++) {
    const path = `./data/characters/dungeon${i}.json`;
    characterPromises.push(
      fetch(path)
        .then((res) => res.ok ? res.json() : [])
        .catch(() => {
          console.error(`Error al cargar o parsear ${path}`);
          return [];
        })
    );
  }

  const allCharacterData = await Promise.all(characterPromises);
  characters = allCharacterData.flat();
}

// Cargar enemigos desde la carpeta enemies
async function loadEnemiesForDungeons(totalDungeons) {
  const enemyPromises = [];

  for (let i = 1; i <= totalDungeons; i++) {
    const path = `./data/enemies/enemies${i}.json`;
    enemyPromises.push(
      fetch(path)
        .then((res) => res.ok ? res.json() : [])
        .catch(() => {
          console.error(`Error al cargar o parsear ${path}`);
          return [];
        })
    );
  }

  const allEnemyData = await Promise.all(enemyPromises);
  enemies = allEnemyData.flat();
}

// Cargar mazmorras y los archivos relacionados
export async function loadGameData() {
  try {
    const dungeonsData = await fetch("./data/dungeons.json").then((res) => {
      if (!res.ok) throw new Error("Error al cargar dungeons.json");
      return res.json();
    });

    dungeons = dungeonsData;

    const totalDungeons = dungeons.length || 5; // Por defecto asume 5 mazmorras
    await Promise.all([
      loadCharactersForDungeons(totalDungeons),
      loadEnemiesForDungeons(totalDungeons)
    ]);

  } catch (error) {
    console.error("Error al cargar los datos del juego:", error);
  }
}
