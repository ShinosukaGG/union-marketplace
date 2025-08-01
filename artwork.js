import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  'https://bgoinnfdoxlnktkswzpi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnb2lubmZkb3hsbmt0a3N3enBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Njg4MzEsImV4cCI6MjA2OTU0NDgzMX0.dWltf8vuwrB7-54fdFq-xwAqtGjV769ywuLxF4f3EDE'
);

// 1. Extract the uuid from the URL path (e.g. /09ff95d1-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
const pathUuid = window.location.pathname.replace('/', '');

async function loadArtwork() {
  // 2. Fetch NFT metadata from table
  const { data: nfts, error: nftError } = await supabase
    .from('nfts')
    .select('*')
    .eq('id', pathUuid)
    .maybeSingle();

  if (nftError || !nfts) {
    document.getElementById('nft-display').style.display = "none";
    document.getElementById('not-found').classList.remove("hidden");
    return;
  }

  // 3. List all files in the bucket root and find one with the uuid as filename prefix
  const { data: files, error: fileError } = await supabase
    .storage
    .from('nft-artworks')
    .list('', { limit: 1000 });

  let artworkFile;
  if (files && Array.isArray(files)) {
    artworkFile = files.find(file => file.name.startsWith(pathUuid));
  }
  if (!artworkFile) {
    document.getElementById('nft-display').style.display = "none";
    document.getElementById('not-found').classList.remove("hidden");
    return;
  }
  // 4. Construct the image URL
  const imageUrl = `https://bgoinnfdoxlnktkswzpi.supabase.co/storage/v1/object/public/nft-artworks/${artworkFile.name}`;

  // 5. Fill in the page
  document.getElementById('artwork-img').src = imageUrl;
  document.getElementById('artwork-img').alt = nfts.name || 'NFT artwork';
  document.getElementById('artwork-name').textContent = nfts.name || 'Unnamed Artwork';
  document.getElementById('artwork-price').textContent = nfts.price || '0';

  document.getElementById('nft-display').style.display = "";
  document.getElementById('not-found').classList.add("hidden");
}

loadArtwork();
