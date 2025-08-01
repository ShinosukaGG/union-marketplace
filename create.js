import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  'https://bgoinnfdoxlnktkswzpi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnb2lubmZkb3hsbmt0a3N3enBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Njg4MzEsImV4cCI6MjA2OTU0NDgzMX0.dWltf8vuwrB7-54fdFq-xwAqtGjV769ywuLxF4f3EDE'
);

const artworkForm = document.getElementById('artwork-form');
const uploadBtn = document.getElementById('upload-btn');

artworkForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  uploadBtn.disabled = true;
  uploadBtn.textContent = "Uploading...";

  // Get form values
  const name = document.getElementById('artworkName').value.trim();
  const description = document.getElementById('artworkDesc').value.trim();
  const price = parseFloat(document.getElementById('artworkPrice').value);
  const fileInput = document.getElementById('artworkImage');
  const file = fileInput.files[0];

  if (!name || !description || isNaN(price) || !file) {
    alert('Please fill in all fields and select an image.');
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload NFT";
    return;
  }

  // Generate a UUID for this NFT
  const uuid = crypto.randomUUID();
  const ext = file.name.split('.').pop();
  const filePath = `${uuid}.${ext}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('nft-artworks')
    .upload(filePath, file);

  if (uploadError) {
    alert('Failed to upload image: ' + uploadError.message);
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload NFT";
    return;
  }

  // Insert into nfts table
  const { data, error: insertError } = await supabase
    .from('nfts')
    .insert([
      {
        id: uuid,
        name,
        description,
        price
        // (You can add more fields here if needed)
      }
    ])
    .select();

  if (insertError) {
    alert('Failed to save NFT metadata: ' + insertError.message);
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload NFT";
    return;
  }

  // Redirect to the artwork page
  window.location.href = `/${uuid}`;
});
