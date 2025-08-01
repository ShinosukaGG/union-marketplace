import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  'https://bgoinnfdoxlnktkswzpi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnb2lubmZkb3hsbmt0a3N3enBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Njg4MzEsImV4cCI6MjA2OTU0NDgzMX0.dWltf8vuwrB7-54fdFq-xwAqtGjV769ywuLxF4f3EDE'
);

document.getElementById('upload-artwork-btn').addEventListener('click', async () => {
  const name = document.getElementById('artwork-name').value.trim();
  const price = parseFloat(document.getElementById('artwork-price').value);
  const fileInput = document.getElementById('artwork-file');
  const file = fileInput.files[0];

  if (!name || isNaN(price) || !file) {
    alert('Please fill in all fields and upload an image.');
    return;
  }

  const fileExt = file.name.split('.').pop();
  const uuid = crypto.randomUUID();
  const filePath = `${uuid}.${fileExt}`;

  // Upload file to bucket
  const { error: uploadError } = await supabase.storage
    .from('nft-artworks')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Storage upload error:', uploadError.message);
    alert('❌ Failed to upload image to storage.');
    return;
  }

  // Insert metadata into table (no url)
  const { error: insertError } = await supabase
    .from('nfts')
    .insert([
      {
        id: uuid,
        name: name,
        price: price
      }
    ]);

  if (insertError) {
    console.error('Insert error:', insertError.message);
    alert('❌ Failed to save NFT metadata.');
    return;
  }

  alert('✅ Artwork successfully uploaded!');
  window.location.href = `/${uuid}`;
});
