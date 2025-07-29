// --- Faucet Logic ---
function claimFaucet() {
  const username = document.getElementById("username").value.trim();
  if (!username) {
    alert("Please enter a username.");
    return;
  }

  localStorage.setItem("unionUser", username);
  localStorage.setItem("nuBalance", "1.00");

  document.getElementById("faucet-screen").style.display = "none";
  document.getElementById("main-site").style.display = "block";
  document.getElementById("balance").textContent = "1.00 $nU";

  document.getElementById("twitter-pfp").src = "pfp.png";
}

// --- On Load ---
window.onload = function () {
  const user = localStorage.getItem("unionUser");
  const balance = localStorage.getItem("nuBalance");
  const theme = localStorage.getItem("theme");

  if (user) {
    document.getElementById("faucet-screen").style.display = "none";
    document.getElementById("main-site").style.display = "block";
    document.getElementById("balance").textContent = `${parseFloat(balance).toFixed(2)} $nU`;
    document.getElementById("twitter-pfp").src = "pfp.png";
  }

  if (theme === "light") {
    document.body.classList.add("light-mode");
    document.getElementById("theme-toggle").textContent = "🌞";
  }

  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
};

// --- Theme Toggle ---
function toggleTheme() {
  const body = document.body;
  const toggleBtn = document.getElementById("theme-toggle");

  if (body.classList.contains("light-mode")) {
    body.classList.remove("light-mode");
    toggleBtn.textContent = "🌙";
    localStorage.setItem("theme", "dark");
  } else {
    body.classList.add("light-mode");
    toggleBtn.textContent = "🌞";
    localStorage.setItem("theme", "light");
  }
}

// --- Collection Popups ---
function openCollection(type) {
  const modal = document.getElementById("collection-modal");
  const header = document.getElementById("collection-header");
  const nftList = document.getElementById("nft-list");

  nftList.innerHTML = "";

  const isZKGF = type === "zkgf";
  const count = 22;
  header.innerHTML = `
    <h2>${isZKGF ? "ZKGFs" : "Union Yapybara"}</h2>
    <p>${isZKGF
      ? "This is a collection of ZKGFs unlocked by the Union Community, Secure your ZKGF today!"
      : "This is a collection of all the Union Yapybara artworks made by me, Secure your favourite piece now!"}</p>
    <hr style="margin: 1rem 0; border: 1px solid #A9ECFD;">
  `;

  for (let i = 1; i <= count; i++) {
    const imgSrc = isZKGF ? `zkgf${i}.png` : `art${i}.png`;
    const name = isZKGF ? getZKGFName(i) : `Artwork #${i}`;
    const desc = isZKGF
      ? `ZKGF ${name} is a powerful member of the zk force!`
      : `This is a Union Yapybara piece titled '${name}'.`;

    const box = document.createElement("div");
    box.className = "nft-item";
    box.innerHTML = `
      <img src="${imgSrc}">
      <div class="nft-details">
        <h3>${name}</h3>
      </div>
      <button onclick="mintNFT('${imgSrc}', '${name}', \`${desc}\`)">MINT (0.01$nU)</button>
    `;
    nftList.appendChild(box);
  }

  modal.classList.remove("hidden");
}

function getZKGFName(index) {
  const names = [
    "Sofia", "Isabella", "Camila", "Valentina", "Gabriela", "Mariana", "Daniela", "Lucia",
    "Ariana", "Selena", "Elena", "Natalia", "Bianca", "Carmen", "Lola", "Rosa",
    "Juliana", "Mia", "Andrea", "Paloma", "Ximena", "Luna"
  ];
  return names[index - 1] || `ZKGF #${index}`;
}

function closeModal() {
  document.getElementById("collection-modal").classList.add("hidden");
}

// --- Mint Logic ---
function mintNFT(img, name, desc) {
  const current = parseFloat(localStorage.getItem("nuBalance"));
  if (current < 0.01) {
    alert("Not enough $nU to mint.");
    return;
  }

  const newBalance = (current - 0.01).toFixed(2);
  localStorage.setItem("nuBalance", newBalance);
  document.getElementById("balance").textContent = `${newBalance} $nU`;

  document.getElementById("minted-img").src = img;
  document.getElementById("minted-name").textContent = name;
  document.getElementById("minted-desc").textContent = desc;

  document.getElementById("mint-modal").classList.remove("hidden");

  triggerConfetti();
  downloadImage(img, name);
}

function closeMintModal() {
  document.getElementById("mint-modal").classList.add("hidden");
}

// --- Confetti ---
function triggerConfetti() {
  const confettiCanvas = document.createElement("canvas");
  confettiCanvas.id = "confetti-canvas";
  confettiCanvas.style.position = "fixed";
  confettiCanvas.style.top = 0;
  confettiCanvas.style.left = 0;
  confettiCanvas.style.width = "100vw";
  confettiCanvas.style.height = "100vh";
  confettiCanvas.style.zIndex = 1000;
  document.body.appendChild(confettiCanvas);

  const confetti = window.confetti.create(confettiCanvas, {
    resize: true,
    useWorker: true
  });

  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.6 }
  });

  setTimeout(() => {
    confettiCanvas.remove();
  }, 2000);
}

// --- Image Download ---
function downloadImage(src, filename) {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = src;

  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    canvas.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename.replace(/\s+/g, '_') + '.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, 'image/png');
  };
}

// Load confetti library
if (!window.confetti) {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
  document.head.appendChild(script);
}
