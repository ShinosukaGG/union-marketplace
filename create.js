// Import Supabase JS (if using as module, otherwise load via <script> CDN in HTML)
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://bgoinnfdoxlnktkswzpi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnb2lubmZkb3hsbmt0a3N3enBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Njg4MzEsImV4cCI6MjA2OTU0NDgzMX0.dWltf8vuwrB7-54fdFq-xwAqtGjV769ywuLxF4f3EDE";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Artwork array in memory
let artworks = [];

// --- On page load, reset state and render artwork list
window.onload = function () {
  artworks = [];
  renderArtworksList();
};

// --- Handle single artwork upload form ---
document.getElementById('artwork-form').onsubmit = function (e) {
  e.preventDefault();

  const imageInput = document.getElementById('artwork-image');
  const artworkName = document.getElementById('artwork-name').value.trim();
  const artworkPrice = document.getElementById('artwork-price').value.trim();

  if (!imageInput.files.length || !artworkName || !artworkPrice) {
    alert('Please fill all artwork fields and select an image.');
    return;
  }

  const file = imageInput.files[0];
  // Save in memory (not uploaded yet)
  artworks.push({
    file,
    name: artworkName,
    price: artworkPrice,
    url: '', // Will be filled after upload
  });

  // Immediately show in list
  renderArtworksList();

  // Reset form
  imageInput.value = '';
  document.getElementById('artwork-name').value = '';
  document.getElementById('artwork-price').value = '';
};

// --- Renders the in-memory artwork list above the Upload Collection btn ---
function renderArtworksList() {
  const container = document.getElementById('uploaded-artworks-list');
  if (!container) return;
  if (artworks.length === 0) {
    container.innerHTML = "<p style='opacity:0.6'>No artworks added yet.</p>";
    return;
  }
  container.innerHTML = artworks.map(
    (a, idx) =>
      `<div class="uploaded-artwork-card">
        <strong>${idx + 1}. ${a.name}</strong> — <span>${a.price} $nU</span>
        <span style="font-size:0.95em;color:#888; margin-left:1em;">${a.file.name}</span>
      </div>`
  ).join('');
}

// --- Handle Upload Collection ---
document.getElementById('final-upload-btn').addEventListener("click", async function () {
  const name = document.getElementById('collection-name').value.trim();
  const desc = document.getElementById('collection-desc').value.trim();

  if (!name || !desc) {
    alert('Please fill in the collection name and description.');
    return;
  }
  if (artworks.length === 0) {
    alert('Please upload at least one artwork.');
    return;
  }

  // 1. Create collection
  let collectionId = null;
  const { data, error } = await supabase
    .from('collections')
    .insert([{ name, description: desc }])
    .select()
    .single();

  if (error) {
    alert('Failed to create collection: ' + error.message);
    return;
  }
  collectionId = data.id;

  // 2. Upload each artwork image and metadata
  for (let a of artworks) {
    const filePath = `${collectionId}/${Date.now()}_${a.file.name}`;
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('nft-collections')
      .upload(filePath, a.file);

    if (storageError) {
      alert('Failed to upload artwork: ' + storageError.message);
      return;
    }

    // Get public URL for the artwork
    const { data: publicUrlData } = supabase
      .storage
      .from('nft-collections')
      .getPublicUrl(filePath);
    const imageUrl = publicUrlData.publicUrl;

    // Insert NFT record
    await supabase.from('nfts').insert([{
      collection_id: collectionId,
      name: a.name,
      price: a.price,
      image_url: imageUrl,
    }]);
  }

  alert('Collection and artworks uploaded successfully!');
  window.location.href = `collection.html?id=${collectionId}`;
});
