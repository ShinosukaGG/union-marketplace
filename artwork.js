import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  'https://bgoinnfdoxlnktkswzpi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnb2lubmZkb3hsbmt0a3N3enBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Njg4MzEsImV4cCI6MjA2OTU0NDgzMX0.dWltf8vuwrB7-54fdFq-xwAqtGjV769ywuLxF4f3EDE'
);

// Get UUID from URL (/uuid)
const uuid = window.location.pathname.replace('/', '').split('?')[0];

const nameDiv = document.getElementById('artwork-name');
const descDiv = document.getElementById('artwork-desc');
const imgEl = document.getElementById('artwork-image');
const mintBtn = document.getElementById('mint-btn');
const shareBtn = document.getElementById('share-x-btn');
const artworkBox = document.getElementById('artwork-box');

// Hide not found message by default
if (document.getElementById('not-found')) document.getElementById('not-found').style.display = 'none';

async function loadArtwork() {
  // Fetch NFT by ID
  let { data, error } = await supabase
    .from('nfts')
    .select('*')
    .eq('id', uuid)
    .limit(1)
    .single();

  if (error || !data) {
    nameDiv.textContent = "Artwork Not Found";
    descDiv.textContent = "";
    imgEl.style.display = "none";
    mintBtn.style.display = "none";
    shareBtn.style.display = "none";
    return;
  }

  // Set metadata
  nameDiv.textContent = data.name || "No Name";
  descDiv.textContent = data.description || "";

  // Try png then jpg
  let ext = 'png';
  let imageUrl = `https://bgoinnfdoxlnktkswzpi.supabase.co/storage/v1/object/public/nft-artworks/${uuid}.png`;

  // Test if the PNG exists by trying to load it
  imgEl.onerror = async function() {
    // Try jpg as fallback
    if (ext === 'png') {
      ext = 'jpg';
      imgEl.src = `https://bgoinnfdoxlnktkswzpi.supabase.co/storage/v1/object/public/nft-artworks/${uuid}.jpg`;
    } else {
      imgEl.src = 'https://placehold.co/300x300?text=Not+Found';
    }
  };
  imgEl.src = imageUrl;

  // Mint button text (with price)
  mintBtn.textContent = `Mint - ${data.price ? data.price : "?"} $nU`;

  // Mint button (placeholder)
  mintBtn.onclick = () => alert('Minting is disabled on this test site.');

  // Share on X button logic
  shareBtn.onclick = () => {
    const tweetText = encodeURIComponent(
      `Check out "${data.name}" on the Union Artworks Marketplace!\n\nunion-marketplace.vercel.app/${uuid}`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${tweetText}`,
      '_blank'
    );
  };
}

loadArtwork();
