let nes;
let frameBuffer = new Uint8ClampedArray(256 * 240 * 4);
let imageData;
let gameStarted = false;
let gameLoop;


function startGame() {
  const canvas = document.getElementById("screen");
  const ctx = canvas.getContext("2d");

   if (gameStarted) return; // impede clicar duas vezes
  gameStarted = true;

  const btn = document.getElementById("playBtn");
  btn.style.display = "none";

  imageData = ctx.getImageData(0, 0, 256, 240);

  nes = new jsnes.NES({
    onFrame: function(frameBuffer_24) {
      for (let i = 0; i < frameBuffer_24.length; i++) {
        const j = i * 4;
        frameBuffer[j] = (frameBuffer_24[i] >> 16) & 0xFF;
        frameBuffer[j + 1] = (frameBuffer_24[i] >> 8) & 0xFF;
        frameBuffer[j + 2] = frameBuffer_24[i] & 0xFF;
        frameBuffer[j + 3] = 0xFF;
      }

      imageData.data.set(frameBuffer);
      ctx.putImageData(imageData, 0, 0);
    }
  });
}
  function loadGame(romName) {
  if (!nes) startGame();

  fetch("roms/" + romName)
    .then(res => res.arrayBuffer())
    .then(data => {
      nes.loadROM(data);
        setInterval(() => {
        nes.frame();
      }, 1000 / 60);
    });
}
function loadGame(romName) {
  if (!nes) initEmulator();

  if (gameLoop) clearInterval(gameLoop);

  fetch("roms/" + romName)
    .then(res => res.arrayBuffer())
    .then(data => {
      nes.loadROM(data);

      gameLoop = setInterval(() => {
        nes.frame();
      }, 1000 / 60);
    });
}

function toggleFullscreen() {
  const canvas = document.getElementById("screen");

  if (!document.fullscreenElement) {
    canvas.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}
document.getElementById("romInput").addEventListener("change", function(event) {
  const file = event.target.files[0];

  if (!file) return;

  if (!file.name.endsWith(".nes")) {
    alert("Por favor, selecione um arquivo .nes");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    if (!nes) initEmulator();

    if (gameLoop) clearInterval(gameLoop);

    nes.loadROM(e.target.result);

    gameLoop = setInterval(() => {
      nes.frame();
    }, 1000 / 60);
  };

  reader.readAsArrayBuffer(file);
});
function saveGame() {
  if (!nes) return;

  const saveData = nes.toJSON();

  localStorage.setItem("saveState", JSON.stringify(saveData));

  alert("Jogo salvo! 💾");
}
function loadSave() {
  if (!nes) return;

  const saveData = localStorage.getItem("saveState");

  if (!saveData) {
    alert("Nenhum save encontrado 😢");
    return;
  }

  nes.fromJSON(JSON.parse(saveData));

  alert("Save carregado! 🎮");
}
localStorage.setItem("save_" + romName, JSON.stringify(saveData));
