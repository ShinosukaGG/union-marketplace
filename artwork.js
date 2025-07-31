const SUPABASE_URL = "https://bgoinnfdoxlnktkswzpi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnb2lubmZkb3hsbmt0a3N3enBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Njg4MzEsImV4cCI6MjA2OTU0NDgzMX0.dWltf8vuwrB7-54fdFq-xwAqtGjV769ywuLxF4f3EDE";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Extract UUID from URL
const urlParams = new URLSearchParams(window.location.search);
const nftId = urlParams.get("id");

const box = document.getElementById("artwork-box");

// Utility: Load user balance
function getBalance() {
  return parseFloat(localStorage.getItem("nU_balance") || "1.00");
}
function setBalance(v) {
  localStorage.setItem("nU_balance", v.toFixed(2));
}

// Utility: Load username (fauceted)
function getUsername() {
  return localStorage.getItem("union_username") || "anon";
}

// Load NFT from Supabase
async function loadNFT() {
  if (!nftId) {
    box.innerHTML = "<p>Invalid NFT ID.</p>";
    return;
  }

  const { data, error } = await supabase.from("nfts").select("*").eq("id", nftId).single();

  if (error || !data) {
    box.innerHTML = "<p>Artwork not found.</p>";
    return;
  }

  const { name, image_url, price } = data;

  box.innerHTML = `
    <h2>${name}</h2>
    <img src="${image_url}" class="artwork-full" />
    <p><strong>Price:</strong> ${price} $nU</p>
    <button id="mint-btn" class="btn-wide">Mint Now</button>
    <div id="mint-status" class="mint-status"></div>
  `;

  document.getElementById("mint-btn").onclick = () => mintNFT(name, price);
}

// Mint logic
function mintNFT(name, priceStr) {
  const balance = getBalance();
  const price = parseFloat(priceStr);

  if (balance < price) {
    document.getElementById("mint-status").innerHTML = `<p style="color:red;">Not enough $nU!</p>`;
    return;
  }

  setBalance(balance - price);
  confetti.start();
  setTimeout(() => confetti.stop(), 3000);

  document.getElementById("mint-status").innerHTML = `
    <p style="margin-top:10px;"><strong>🎉 Congratulations!</strong> You minted <em>${name}</em></p>
    <p>Remaining Balance: ${getBalance().toFixed(2)} $nU</p>
    <a href="index.html" class="btn-wide" style="display:inline-block;margin-top:10px;">Back to Marketplace</a>
  `;
  document.getElementById("mint-btn").style.display = "none";
}

// Start confetti
const confetti = {
  canvas: document.getElementById("confetti-canvas"),
  start: () => {
    if (confettiInstance) confettiInstance.render();
  },
  stop: () => {
    if (confettiInstance) confettiInstance.clear();
  }
};
const confettiInstance = confetti.create = window.confetti.create(confetti.canvas, { resize: true });

// Load the NFT on page load
loadNFT();
