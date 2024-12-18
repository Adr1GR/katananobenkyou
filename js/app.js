import { loadGameData } from "./data.js";
import { generateDungeonButtons, toggleVisibility, setBackground } from "./ui.js";
import { checkInput, backgroundMusic, startBackgroundMusic, stopBackgroundMusic, exitDungeon } from "./game.js";

document.addEventListener("DOMContentLoaded", async () => {
  setBackground(); // Usa wallpaper.png por defecto

  await loadGameData();
  generateDungeonButtons();

  // Listener para iniciar la música al primer clic del usuario
  const appElement = document.getElementById("app");
  appElement.addEventListener("click", initializeAudio, { once: true });

  // Listener para el botón de mute
  const muteButton = document.getElementById("mute-button");
  if (muteButton) {
    muteButton.addEventListener("click", () => {
      if (backgroundMusic.muted) {
        backgroundMusic.muted = false;
        muteButton.textContent = "🔊";
      } else {
        backgroundMusic.muted = true;
        muteButton.textContent = "🔇";
      }
    });
  }

  // Configura el evento del botón "Exit Dungeon"
  const exitButton = document.getElementById("exit-dungeon");
  if (exitButton) {
    exitButton.addEventListener("click", () => {
      exitDungeon();
      setBackground(); // Restablece el fondo a wallpaper.png al salir de la mazmorra
    });
  }

  // Inicialmente, oculta el botón
  toggleVisibility("exit-dungeon", false);

  const inputBox = document.getElementById("input-box");
  if (inputBox) {
    inputBox.addEventListener("keydown", (e) => {
      if (e.key === "Enter") checkInput();
    });
  }
});

function initializeAudio() {
  startBackgroundMusic(); // Inicia la música solo después de un clic
}