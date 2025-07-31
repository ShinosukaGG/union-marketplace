// Supabase setup (via CDN in create.html)
const SUPABASE_URL = "https://bgoinnfdoxlnktkswzpi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnb2lubmZkb3hsbmt0a3N3enBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Njg4MzEsImV4cCI6MjA2OTU0NDgzMX0.dWltf8vuwrB7-54fdFq-xwAqtGjV769ywuLxF4f3EDE";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Handle single artwork upload
document.getElementById('single-artwork-form').onsubmit = async function (e) {
  e.preventDefault();

  const imageInput = document.getElementById('artwork-image');
  const name = document.getElementById('artwork-name').value.trim();
  const price = document.getElementById('artwork-price').value.trim();

  if (!imageInput.files.length || !name || !price) {
    alert('Please fill all fields and select an image.');
    return;
  }

  const file = imageInput.files[0];

  // Step 1: Insert NFT metadata to get UUID
  const { data: insertData, error: insertError } = await supabase
    .from('nfts')
    .insert([{ name, price }])
    .select()
    .single();

  if (insertError || !insertData) {
    alert('Error creating NFT metadata: ' + insertError.message);
    return;
  }

  const nftId = insertData.id; // UUID from Supabase
  const filePath = `artworks/${nftId}_${file.name}`;

  // Step 2: Upload image to Supabase Storage
  const { data: storageData, error: storageError } = await supabase
    .storage
    .from('nft-collections')
    .upload(filePath, file);

  if (storageError) {
    alert('Error uploading image: ' + storageError.message);
    return;
  }

  // Step 3: Get public image URL
  const { data: urlData } = supabase
    .storage
    .from('nft-collections')
    .getPublicUrl(filePath);
  const imageUrl = urlData.publicUrl;

  // Step 4: Update NFT record with image_url
  const { error: updateError } = await supabase
    .from('nfts')
    .update({ image_url: imageUrl })
    .eq('id', nftId);

  if (updateError) {
    alert('Error saving image URL: ' + updateError.message);
    return;
  }

  // Step 5: Redirect to minting page
  window.location.href = `artwork.html?id=${nftId}`;
};
