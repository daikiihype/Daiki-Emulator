let nes;
let frameBuffer = new Uint8ClampedArray(256 * 240 * 4);
let imageData;
let gameLoop = null;

// ✅ inicializa o emulador
function initEmulator() {
  const canvas = document.getElementById("screen");
  const ctx = canvas.getContext("2d");

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

// ✅ carregar jogo
function loadGame(romName) {
  console.log("Tentando carregar:", romName);

  if (!nes) {
    initEmulator();
  }

  if (gameLoop) clearInterval(gameLoop);

  fetch("roms/" + romName)
    .then(res => {
      if (!res.ok) {
        throw new Error("ROM não encontrada");
      }
      return res.arrayBuffer();
    })
    .then(data => {
      console.log("ROM carregada!");

      nes.loadROM(data);

      gameLoop = setInterval(() => {
        nes.frame();
      }, 1000 / 60);
    })
    .catch(err => {
      console.error("Erro:", err);
      alert("Erro ao carregar o jogo!");
    });
}

// ✅ fullscreen
function toggleFullscreen() {
  const canvas = document.getElementById("screen");

  if (!document.fullscreenElement) {
    canvas.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

// ✅ upload ROM
document.getElementById("romInput").addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (!file) return;

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

// ✅ SAVE
function saveGame() {
  if (!nes) return;

  const saveData = nes.toJSON();
  localStorage.setItem("saveState", JSON.stringify(saveData));

  alert("Salvo!");
}

// ✅ LOAD
function loadSave() {
  if (!nes) return;

  const saveData = localStorage.getItem("saveState");

  if (!saveData) {
    alert("Sem save!");
    return;
  }

  nes.fromJSON(JSON.parse(saveData));
}
document.addEventListener("keydown", (e) => {
  if (!nes) return;

  // 🚫 bloqueia scroll das setas
  if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) {
    e.preventDefault();
  }

  switch (e.key) {
    case "ArrowUp": nes.buttonDown(1, jsnes.Controller.BUTTON_UP); break;
    case "ArrowDown": nes.buttonDown(1, jsnes.Controller.BUTTON_DOWN); break;
    case "ArrowLeft": nes.buttonDown(1, jsnes.Controller.BUTTON_LEFT); break;
    case "ArrowRight": nes.buttonDown(1, jsnes.Controller.BUTTON_RIGHT); break;

    case "z":
    case "Z": nes.buttonDown(1, jsnes.Controller.BUTTON_A); break;

    case "x":
    case "X": nes.buttonDown(1, jsnes.Controller.BUTTON_B); break;

    case "Enter": nes.buttonDown(1, jsnes.Controller.BUTTON_START); break;

    case "Shift": nes.buttonDown(1, jsnes.Controller.BUTTON_SELECT); break;
  }
});

document.addEventListener("keyup", (e) => {
  if (!nes) return;

  if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) {
    e.preventDefault();
  }

  switch (e.key) {
    case "ArrowUp": nes.buttonUp(1, jsnes.Controller.BUTTON_UP); break;
    case "ArrowDown": nes.buttonUp(1, jsnes.Controller.BUTTON_DOWN); break;
    case "ArrowLeft": nes.buttonUp(1, jsnes.Controller.BUTTON_LEFT); break;
    case "ArrowRight": nes.buttonUp(1, jsnes.Controller.BUTTON_RIGHT); break;

    case "z":
    case "Z": nes.buttonUp(1, jsnes.Controller.BUTTON_A); break;

    case "x":
    case "X": nes.buttonUp(1, jsnes.Controller.BUTTON_B); break;

    case "Enter": nes.buttonUp(1, jsnes.Controller.BUTTON_START); break;

    case "Shift": nes.buttonUp(1, jsnes.Controller.BUTTON_SELECT); break;
  }
});