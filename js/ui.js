import { dungeons } from "./data.js";
import {
  startDungeon,
  resetGame,
  updateHealthBar,
  startBackgroundMusic,
  stopBackgroundMusic,
} from "./game.js";

export function setBackground(imagePath = "./assets/images/background.png") {
  const appElement = document.getElementById("app");

  let backgroundLayer = document.getElementById("background-layer");
  if (!backgroundLayer) {
    backgroundLayer = document.createElement("div");
    backgroundLayer.id = "background-layer";
    appElement.appendChild(backgroundLayer);
  }

  backgroundLayer.style.backgroundImage = `url('${imagePath}')`;
  backgroundLayer.style.backgroundSize = "cover";
  backgroundLayer.style.backgroundPosition = "center center";
  backgroundLayer.style.filter = "blur(6px)";
}

export function clearBackground() {
  const backgroundLayer = document.getElementById("background-layer");
  if (backgroundLayer) {
    backgroundLayer.remove(); // Elimina la capa del fondo si existe
  }
}

export function generateDungeonButtons() {
  const dungeonButtons = document.getElementById("dungeon-buttons");
  dungeonButtons.innerHTML = "";

  // Cargar sonidos
  const hoverSound = new Audio("./assets/sounds/menu-button-hover.mp3");
  const clickSound = new Audio("./assets/sounds/menu-button-click.mp3");

  // Crear contenedores de columnas
  const columns = {
    Easy: document.createElement("div"),
    Normal: document.createElement("div"),
    Hard: document.createElement("div"),
  };

  Object.keys(columns).forEach((key) => {
    const column = columns[key];
    column.className = "flex flex-col space-y-4";
    const title = document.createElement("h2");
    title.textContent = key;
    title.className = "text-2xl font-bold mb-4 text-center";
    column.appendChild(title);
  });

  // Filtrar y asignar mazmorras a columnas
  dungeons.forEach((dungeon) => {
    let difficulty = "";
    if (dungeon.level >= 1 && dungeon.level <= 3) difficulty = "Easy";
    else if (dungeon.level >= 4 && dungeon.level <= 6) difficulty = "Normal";
    else if (dungeon.level >= 7) difficulty = "Hard";

    const button = document.createElement("button");
    button.className =
      "relative p-4 bg-gray-800 rounded-lg shadow-md text-lg font-bold text-center overflow-hidden";

    // Fondo borroso del botón
    const buttonBackground = document.createElement("div");
    buttonBackground.style.backgroundImage = `url('${dungeon.image}')`;
    buttonBackground.style.backgroundSize = "cover";
    buttonBackground.style.backgroundPosition = "center";
    buttonBackground.style.filter = "blur(4px)";
    buttonBackground.className = "absolute inset-0 rounded-lg z-0";

    // Texto del botón
    const buttonText = document.createElement("div");
    buttonText.className = "relative z-10";
    buttonText.textContent = `Level ${dungeon.level} - ${dungeon.name}`;
    buttonText.style.color = "white";
    buttonText.style.textShadow = "0px 0px 3px black, 0px 0px 5px black";

    // Añadir eventos para los sonidos
    button.addEventListener("mouseover", () => {
      hoverSound.currentTime = 0; // Reinicia el sonido
      hoverSound.play();
    });

    button.addEventListener("click", () => {
      clickSound.currentTime = 0; // Reinicia el sonido
      clickSound.play();
      setBackground(dungeon.image);
      startDungeon(dungeon.level);
    });

    // Estructura final del botón
    button.appendChild(buttonBackground);
    button.appendChild(buttonText);

    columns[difficulty].appendChild(button);
  });

  // Contenedor principal con tres columnas
  const container = document.createElement("div");
  container.className = "grid grid-cols-3 gap-4 w-full";
  Object.values(columns).forEach((col) => container.appendChild(col));

  dungeonButtons.appendChild(container);

  // Ocultar la barra de vida y controles al cargar el selector
  toggleVisibility("enemy-info", false);
  toggleVisibility("enemy-image", false);
  toggleVisibility("player-controls", false);
}

export function toggleVisibility(id, show) {
  const element = document.getElementById(id);
  if (element) {
    element.classList.toggle("hidden", !show);
  }
}

export function updateUI(currentEnemy, currentCharacter, currentEnemyHp) {
  const enemyImg = document.getElementById("enemy-img");
  const enemyCharacter = document.getElementById("enemy-character");
  const healthBar = document.getElementById("enemy-health-bar");

  if (enemyImg && enemyCharacter) {
    enemyImg.src = currentEnemy.image || "./assets/default_enemy.png";
    enemyCharacter.textContent = currentCharacter.japanese;
    enemyCharacter.style.textShadow = "0px 0px 3px black, 0px 0px 5px black";

    // Si es un boss, aplica estilos específicos
    if (currentEnemy.type === "boss") {
      enemyImg.classList.add("boss-shadow"); // Clase para el sombreado morado
      healthBar.classList.remove("bg-red-500"); // Quita el color rojo de la barra de salud
      healthBar.classList.add("bg-purple-800"); // Agrega el color morado
      
      healthBar.classList.remove("enemy-health-bar");
      healthBar.classList.add("boss-health-bar");
    } else {
      // Restablece estilos si no es un boss
      enemyImg.classList.remove("boss-shadow");
      healthBar.classList.remove("bg-purple-800");
      healthBar.classList.add("bg-red-500");

      healthBar.classList.remove("boss-health-bar");
      healthBar.classList.add("enemy-health-bar");
    } 

    // Nueva funcionalidad: Mostrar phrase debajo del carácter
    let phraseElement = document.getElementById("enemy-phrase");
    if (!phraseElement) {
      phraseElement = document.createElement("p");
      phraseElement.id = "enemy-phrase";
      phraseElement.className = "text-lg text-gray-300 mt-2"; // Tamaño pequeño y color gris
      phraseElement.style.textShadow = "0px 0px 3px black, 0px 0px 5px black";
      enemyCharacter.parentElement.appendChild(phraseElement);
    }

    if (currentCharacter.phrase) {
      phraseElement.textContent = currentCharacter.phrase;
      phraseElement.style.display = "block";
    } else {
      phraseElement.style.display = "none"; // Oculta si no existe la frase
    }
  }

  // Reinicia la barra de salud
  updateHealthBar(currentEnemyHp, currentEnemy.hp);
}

export function showGameOverModal(isVictory, failedCharacter) {
  const modal = document.getElementById("game-over-modal");
  const resultTitle = document.getElementById("result-title");
  const statsList = document.getElementById("game-stats");

  // Actualiza el título del modal según el resultado
  resultTitle.textContent = isVictory ? "Victory" : "Defeat";
  resultTitle.classList.toggle("text-green-500", isVictory);
  resultTitle.classList.toggle("text-red-500", !isVictory);

  // Limpia el contenido anterior del modal
  statsList.innerHTML = "";

  // Si es derrota y hay un carácter fallado, muestra los detalles
  if (!isVictory && failedCharacter) {
    const charItem = document.createElement("li");
    charItem.innerHTML = `
      <strong>Character:</strong> ${failedCharacter.japanese} <br>
      <strong>Latin:</strong> ${failedCharacter.latin} <br>
      <strong>Meaning:</strong> ${failedCharacter.meaning} <br>
      <strong>Phrase:</strong> "${failedCharacter.phrase}"
    `;
    charItem.className = "text-2xl font-medium text-left";
    statsList.appendChild(charItem);
  }

  // Muestra el modal
  modal.classList.remove("hidden");

  // Configura el botón para cerrar el modal
  document.getElementById("close-modal").addEventListener("click", () => {
    modal.classList.add("hidden");
    resetGame(); // Reinicia el juego después de cerrar
    setBackground(); // Restablece el fondo a wallpaper.png
  });
}
