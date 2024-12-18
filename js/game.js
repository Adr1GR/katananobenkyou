import { characters, enemies, dungeons } from "./data.js";
import {
  showGameOverModal,
  toggleVisibility,
  updateUI,
  setBackground,
  clearBackground,
} from "./ui.js";

let lives = 3;
let currentEnemy = null;
let currentCharacter = null;
let currentEnemyHp = 0;
let dungeonEnemiesLeft = 0;
let currentDungeonLevel = 0;
let availableCharacters = [];
let seenCharacters = []; // Almacena los caracteres vistos en la mazmorra actual

// Definir los sonidos base
const hitSoundBase = new Audio("./assets/sounds/hit.mp3");
const loseLifeSoundBase = new Audio("./assets/sounds/lose-life.mp3");
const winSoundBase = new Audio("./assets/sounds/win.mp3");
const loseBattleSoundBase = new Audio("./assets/sounds/lose.mp3");

// Configuración de volumen para los sonidos base
hitSoundBase.volume = 0.7;
loseLifeSoundBase.volume = 0.4;
winSoundBase.volume = 0.5;
loseBattleSoundBase.volume = 0.5;

// Función auxiliar para reproducir sonidos solapables
function playSound(audioBase) {
  const soundClone = audioBase.cloneNode(); // Crea una copia del sonido base
  soundClone.play();
}
// Crear el objeto para la música de fondo
export const backgroundMusic = new Audio(
  "./assets/sounds/background-music.wav"
);

// Configurar la música para que se repita
backgroundMusic.loop = true;
backgroundMusic.volume = 0.15; // Ajusta el volumen según sea necesario

export function startBackgroundMusic() {
  backgroundMusic
    .play()
    .then(() => {
      console.log("Background music started successfully.");
    })
    .catch((error) => {
      console.warn("Background music could not start:", error);
    });
}

export function stopBackgroundMusic() {
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0; // Reinicia la canción
}

export function startDungeon(level) {
  const dungeon = dungeons.find((d) => d.level === level);

  if (!dungeon) {
    console.error("Mazmorra no encontrada");
    return;
  }

  dungeonEnemiesLeft = dungeon.enemies;
  currentDungeonLevel = level;
  seenCharacters = [];

  availableCharacters = characters.filter(
    (char) =>
      level >= parseInt(char.min_level) && level <= parseInt(char.max_level)
  );

  if (availableCharacters.length === 0) {
    console.error("No hay caracteres disponibles para este nivel");
    return;
  }

  lives = 3;
  updateLives();

  setBackground(dungeon.image); // Cambiar fondo al iniciar la mazmorra

  toggleVisibility("dungeon-selector", false);
  toggleVisibility("enemy-info", true); // Mostrar barra de vida y caracteres
  toggleVisibility("enemy-image", true);
  toggleVisibility("player-controls", true);
  toggleVisibility("exit-dungeon", true);

  // Seleccionar automáticamente el campo de entrada
  const inputBox = document.getElementById("input-box");
  if (inputBox) {
    inputBox.focus();
  }

  nextEnemy();
}

function nextEnemy() {
  if (lives <= 0) {
    endGame();
    return;
  }

  if (dungeonEnemiesLeft > 0) {
    const normalEnemies = enemies.filter(
      (enemy) =>
        enemy.type !== "boss" && enemy.dungeon_level === currentDungeonLevel
    );

    if (normalEnemies.length === 0) {
      console.error("No hay enemigos normales disponibles para este nivel");
      endGame();
      return;
    }

    currentEnemy =
      normalEnemies[Math.floor(Math.random() * normalEnemies.length)];
    currentEnemyHp = currentEnemy.hp; // Inicializar correctamente la vida
    currentCharacter =
      availableCharacters[
        Math.floor(Math.random() * availableCharacters.length)
      ];

    // Añadir a los caracteres vistos
    if (
      !seenCharacters.some(
        (char) => char.japanese === currentCharacter.japanese
      )
    ) {
      seenCharacters.push(currentCharacter);
    }

    updateUI(currentEnemy, currentCharacter, currentEnemyHp); // Actualizar la interfaz
  } else {
    showBoss();
  }
}

function showBoss() {
  const boss = enemies.find(
    (enemy) =>
      enemy.type === "boss" && enemy.dungeon_level === currentDungeonLevel
  );

  if (!boss) {
    console.error(
      `No se encontró un boss para el nivel ${currentDungeonLevel}`
    );
    endGame();
    return;
  }

  currentEnemy = boss;
  currentEnemyHp = boss.hp; // Inicializar la vida del boss

  // Selecciona un carácter inicial aleatorio
  currentCharacter =
    availableCharacters[Math.floor(Math.random() * availableCharacters.length)];

  updateUI(currentEnemy, currentCharacter, currentEnemyHp); // Actualizar la interfaz
}

export function checkInput() {
  const inputBox = document.getElementById("input-box");
  const input = inputBox.value.trim().toLowerCase();
  const enemyCharacter = currentCharacter.latin;

  inputBox.value = ""; // Limpia el input siempre

  if (input === enemyCharacter) {
    currentEnemyHp--;
    playSound(hitSoundBase); // Reproducir sonido solapable de golpe

    updateHealthBar(currentEnemyHp, currentEnemy.hp);

    // Actualizar carácter tanto para enemigos normales como para bosses
    if (currentEnemyHp > 0) {
      currentCharacter =
        availableCharacters[
          Math.floor(Math.random() * availableCharacters.length)
        ];
      updateUI(currentEnemy, currentCharacter, currentEnemyHp);
    }

    if (currentEnemyHp <= 0) {
      if (currentEnemy.type === "boss") {
        winGame();
      } else {
        dungeonEnemiesLeft--;
        nextEnemy();
      }
    }
  } else {
    if (lives > 1) {
      playSound(loseLifeSoundBase); // Reproducir sonido solapable de pérdida de vida
    } else {
      playSound(loseBattleSoundBase);
    }
    
    lives--;
    updateLives();
    if (lives <= 0) {
      endGame();
    }
  }
}

function winGame() {
  playSound(winSoundBase); // Reproducir sonido solapable de victoria
  showGameOverModal(true, seenCharacters, []);
  toggleVisibility("exit-dungeon", false);
  setBackground();
}

function endGame() {
  const failedCharacter = currentCharacter; // Guarda el último carácter mostrado (el que fallaste)
  showGameOverModal(false, failedCharacter); // Envía el carácter fallado al modal
  toggleVisibility("exit-dungeon", false);
  setBackground();
}

export function resetGame() {
  toggleVisibility("dungeon-selector", true);
  toggleVisibility("enemy-info", false);
  toggleVisibility("enemy-image", false);
  toggleVisibility("player-controls", false);
  clearBackground();
  setBackground();

  lives = 3;
  dungeonEnemiesLeft = 0;
  seenCharacters = []; // Reinicia caracteres vistos
}

function updateLives() {
  const livesElement = document.getElementById("lives");
  if (livesElement) {
    livesElement.textContent = `Vidas: ${lives}/3`;
  }
  updatePlayerHealthBar(lives, 3); // Actualiza la barra de vida del jugador
}

export function updateHealthBar(currentHp, maxHp) {
  const healthBar = document.getElementById("enemy-health-bar");
  const healthText = document.getElementById("enemy-hp-text");

  const healthPercentage = (currentHp / maxHp) * 100; // Calcula el porcentaje
  healthBar.style.width = `${healthPercentage}%`; // Actualiza el ancho de la barra

  // Actualiza el texto de HP dentro de la barra
  healthText.textContent = `HP: ${currentHp}/${maxHp}`;
}

export function exitDungeon() {
  // Restaurar el estado inicial
  clearBackground();
  setBackground(); // Restablece el fondo a wallpaper.png
  toggleVisibility("dungeon-selector", true);
  toggleVisibility("enemy-info", false);
  toggleVisibility("enemy-image", false);
  toggleVisibility("player-controls", false);
  toggleVisibility("exit-dungeon", false); // Ocultar el botón al salir de la mazmorra

  console.log("Has salido de la mazmorra.");
}

function updatePlayerHealthBar(currentHp, maxHp) {
  const healthBar = document.getElementById("player-health-bar");
  const healthText = document.getElementById("player-hp-text");

  const healthPercentage = (currentHp / maxHp) * 100; // Calcula el porcentaje
  healthBar.style.width = `${healthPercentage}%`; // Actualiza el ancho de la barra

  // Actualiza el texto de HP dentro de la barra
  healthText.textContent = `HP: ${currentHp}/${maxHp}`;
}
