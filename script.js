const worseBtn = document.querySelector("#worseBtn");
const escapeBtn = document.querySelector("#escapeBtn");
const popupDeck = document.querySelector("#popupDeck");
const toastStack = document.querySelector("#toastStack");
const emojiField = document.querySelector("#emojiField");
const popupTemplate = document.querySelector("#popupTemplate");
const chaosValue = document.querySelector("#chaosValue");
const popupValue = document.querySelector("#popupValue");
const painValue = document.querySelector("#painValue");

const toastLines = [
  "Сайт считает, что вам мало раздражения.",
  "Кнопка побега снова недоступна. Какая жалость.",
  "Новый баннер добавлен без вашего согласия.",
  "Ваше терпение обновлено: 0%.",
  "Система сообщает: спокойствие не найдено.",
  "Еще чуть-чуть, и интерфейс станет неприличным."
];

const popupLines = [
  "Вы точно хотите прекратить страдать? Ответ не принимается.",
  "Срочно нажмите кнопку, чтобы ничего не произошло.",
  "Важное сообщение: мы добавили еще одно важное сообщение.",
  "Подождите, почти готово к тому, чтобы стать еще хуже.",
  "Ошибка 451: вам опять мешают закрыть окно.",
  "Уровень визуального шума достиг нового абсурда."
];

const titleFrames = [
  "НЕ ЗАКРЫВАЙ ЭТО",
  "СЛИШКОМ ПОЗДНО",
  "КНОПКА УБЕЖАЛА",
  "ЕЩЕ ХУЖЕ",
  "ПОЧЕМУ ОНО ЖИВОЕ",
  "IRRITATION.EXE"
];

const emojiRain = ["!!!", "⚠️", "☠️", "💥", "😵", "🚨", "NO"];

let chaosLevel = 1;
let popupCount = 0;
let painCount = 12;
let audioContext;
let audioStarted = false;
let titleIndex = 0;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function updateMeters() {
  chaosValue.textContent = String(chaosLevel).padStart(2, "0");
  popupValue.textContent = String(popupCount).padStart(2, "0");
  painValue.textContent = String(painCount).padStart(2, "0");
}

function startAudio() {
  if (audioStarted) {
    return;
  }

  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) {
    return;
  }

  audioStarted = true;
  audioContext = new AudioCtor();
  setInterval(() => {
    beep(randomBetween(170, 640), 0.05, "square", 0.015 + chaosLevel * 0.004);
  }, 1300);
}

function beep(frequency, duration, type, gainAmount) {
  if (!audioContext) {
    return;
  }

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(gainAmount, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

function setChaosClass() {
  document.body.classList.remove("chaos-2", "chaos-3", "chaos-4");
  const capped = clamp(chaosLevel, 1, 4);
  if (capped > 1) {
    document.body.classList.add(`chaos-${capped}`);
  }
}

function addToast(message) {
  const node = document.createElement("article");
  node.className = "toast";
  node.textContent = message;
  toastStack.appendChild(node);

  setTimeout(() => {
    node.remove();
  }, 4600);
}

function spawnPopup(text) {
  const fragment = popupTemplate.content.cloneNode(true);
  const popup = fragment.querySelector(".popup");
  const textNode = fragment.querySelector(".popup-text");
  const closeBtn = fragment.querySelector(".popup-close");
  const ctaBtn = fragment.querySelector(".popup-cta");

  textNode.textContent = text;

  const leftLimit = Math.max(window.innerWidth - 340, 12);
  const topLimit = Math.max(window.innerHeight - 240, 90);
  popup.style.left = `${randomBetween(12, leftLimit)}px`;
  popup.style.top = `${randomBetween(70, topLimit)}px`;
  popup.style.zIndex = String(40 + popupCount);

  function onMischief() {
    popup.remove();
    popupCount = Math.max(popupCount - 1, 0);
    painCount += 2;
    addToast(toastLines[Math.floor(Math.random() * toastLines.length)]);
    if (Math.random() > 0.35) {
      multiplyChaos(1);
    }
    updateMeters();
  }

  closeBtn.addEventListener("click", onMischief);
  ctaBtn.addEventListener("click", () => {
    painCount += 1;
    addToast("Нажатие подтверждено. Ситуация ухудшилась.");
    beep(randomBetween(240, 820), 0.08, "sawtooth", 0.02);
    multiplyChaos(1);
    updateMeters();
  });

  popupDeck.appendChild(fragment);
  popupCount += 1;
  painCount += 1;
  updateMeters();
}

function multiplyChaos(extraLevel) {
  chaosLevel += extraLevel;
  painCount += 2 * extraLevel;
  setChaosClass();

  const burst = clamp(chaosLevel, 1, 5);
  for (let i = 0; i < burst; i += 1) {
    const line = popupLines[Math.floor(Math.random() * popupLines.length)];
    setTimeout(() => spawnPopup(line), i * 120);
  }

  for (let i = 0; i < burst + 1; i += 1) {
    setTimeout(() => dropEmoji(), i * 90);
  }

  addToast(`Хаос повышен до ${chaosLevel}. Это было плохой идеей.`);
  beep(randomBetween(220, 700), 0.12, "square", 0.03 + chaosLevel * 0.003);
  updateMeters();
}

function moveEscapeButton() {
  const padding = 24;
  const maxX = Math.max(window.innerWidth - escapeBtn.offsetWidth - padding, padding);
  const maxY = Math.max(window.innerHeight - escapeBtn.offsetHeight - 120, 120);
  const x = randomBetween(padding, maxX);
  const y = randomBetween(120, maxY);

  escapeBtn.style.position = "fixed";
  escapeBtn.style.left = `${x}px`;
  escapeBtn.style.top = `${y}px`;
  escapeBtn.textContent = ["Не поймаешь", "Почти", "Слишком медленно", "Нет", "Мимо"][Math.floor(Math.random() * 5)];
}

function dropEmoji() {
  const node = document.createElement("span");
  node.className = "emoji";
  node.textContent = emojiRain[Math.floor(Math.random() * emojiRain.length)];
  node.style.left = `${randomBetween(0, 92)}vw`;
  node.style.animationDuration = `${randomBetween(2.8, 4.7)}s`;
  emojiField.appendChild(node);

  setTimeout(() => {
    node.remove();
  }, 5000);
}

function addCursorBlip(event) {
  const node = document.createElement("span");
  node.className = "cursor-blip";
  node.style.left = `${event.clientX}px`;
  node.style.top = `${event.clientY}px`;
  document.body.appendChild(node);

  setTimeout(() => {
    node.remove();
  }, 600);
}

function cycleTitle() {
  titleIndex = (titleIndex + 1) % titleFrames.length;
  document.title = titleFrames[titleIndex];
}

worseBtn.addEventListener("click", () => {
  startAudio();
  multiplyChaos(1);
});

escapeBtn.addEventListener("mouseenter", moveEscapeButton);
escapeBtn.addEventListener("click", (event) => {
  event.preventDefault();
  moveEscapeButton();
  addToast("Попытка выхода зафиксирована и отклонена.");
  painCount += 3;
  updateMeters();
});

document.addEventListener(
  "pointerdown",
  () => {
    startAudio();
  },
  { once: true }
);

document.addEventListener("pointermove", (event) => {
  if (Math.random() > 0.74) {
    addCursorBlip(event);
  }
});

setInterval(() => {
  addToast(toastLines[Math.floor(Math.random() * toastLines.length)]);
  painCount += 1;
  updateMeters();
}, 4200);

setInterval(() => {
  if (popupCount < 6) {
    spawnPopup(popupLines[Math.floor(Math.random() * popupLines.length)]);
  }
}, 3100);

setInterval(() => {
  dropEmoji();
}, 1000);

setInterval(() => {
  cycleTitle();
}, 850);

setInterval(() => {
  if (Math.random() > 0.55) {
    moveEscapeButton();
  }
}, 2600);

setInterval(() => {
  if (audioStarted) {
    beep(randomBetween(150, 920), 0.04, "triangle", 0.012 + chaosLevel * 0.003);
  }
}, 900);

window.addEventListener("resize", () => {
  if (escapeBtn.style.position === "fixed") {
    moveEscapeButton();
  }
});

setChaosClass();
updateMeters();
addToast("Добро пожаловать. Нормальный UX здесь отменен.");
spawnPopup("Привет. Это только начало.");
