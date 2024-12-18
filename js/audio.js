// audio.js

// Base configuration for audio elements
const audioConfig = {
  volume: 1,
  loop: false,
};

// Function to create audio elements with specific settings
function createAudio(filePath, config = {}) {
  const audio = new Audio(filePath);
  audio.volume = config.volume ?? audioConfig.volume;
  audio.loop = config.loop ?? audioConfig.loop;
  return audio;
}

// Preload and configure audio files
export const sounds = {
  hit: createAudio("./assets/sounds/hit.mp3", { volume: 0.5 }),
  loseLife: createAudio("./assets/sounds/lose-life.mp3", { volume: 0.1 }),
  win: createAudio("./assets/sounds/win.mp3", { volume: 0.2 }),
  loseBattle: createAudio("./assets/sounds/lose.mp3", { volume: 0.2 }),
  background: createAudio("./assets/sounds/background-music.wav", {
    volume: 0.02,
    loop: true,
  }),
  hoverButton: createAudio("./assets/sounds/menu-button-hover.mp3"),
  clickButton: createAudio("./assets/sounds/menu-button-click.mp3"),
};

// Functions to control playback
export function playSound(soundName) {
  if (sounds[soundName]) {
    sounds[soundName].currentTime = 0;
    sounds[soundName].play().catch(console.error);
  } else {
    console.warn(`Sound '${soundName}' not found.`);
  }
}

export function stopSound(soundName) {
  if (sounds[soundName]) {
    sounds[soundName].pause();
    sounds[soundName].currentTime = 0;
  } else {
    console.warn(`Sound '${soundName}' not found.`);
  }
}

export function toggleMute(soundName) {
  if (sounds[soundName]) {
    sounds[soundName].muted = !sounds[soundName].muted;
  } else {
    console.warn(`Sound '${soundName}' not found.`);
  }
}

// Background music controls
export function startBackgroundMusic() {
  playSound("background");
}

export function stopBackgroundMusic() {
  stopSound("background");
}
