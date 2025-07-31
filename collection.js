import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://bgoinnfdoxlnktkswzpi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get collection ID from URL
const params = new URLSearchParams(window.location.search);
const collectionId = params.get("id");

async function loadCollection() {
  if (!collectionId) {
    document.getElementById("collection-details").innerHTML = "<p>Invalid collection.</p>";
    return;
  }

  // Fetch collection info
  const { data: collection, error: colError } = await supabase
    .from("collections")
    .select("*")
    .eq("id", collectionId)
    .single();

  if (colError || !collection) {
    document.getElementById("collection-details").innerHTML = "<p>Collection not found.</p>";
    return;
  }

  // Render collection header
  document.getElementById("collection-details").innerHTML = `
    <h1>${collection.name}</h1>
    <p>${collection.description}</p>
  `;

  // Fetch NFTs in this collection
  const { data: nfts, error: nftError } = await supabase
    .from("nfts")
    .select("*")
    .eq("collection_id", collectionId);

  const container = document.getElementById("nft-list");

  if (nftError || !nfts.length) {
    container.innerHTML = "<p>No artworks found in this collection.</p>";
    return;
  }

  // Render each NFT
  container.innerHTML = nfts.map(nft => `
    <div class="nft-box">
      <img src="${nft.image_url}" alt="${nft.name}" class="nft-img" />
      <div class="nft-meta">
        <strong>${nft.name}</strong>
        <p>Price: ${nft.price} $nU</p>
      </div>
    </div>
  `).join('');
}

loadCollection();
