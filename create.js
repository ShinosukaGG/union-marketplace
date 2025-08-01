import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ✅ Supabase client setup
const supabase = createClient(
  "https://bgoinnfdoxlnktkswzpi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnb2lubmZkb3hsbmt0a3N3enBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Njg4MzEsImV4cCI6MjA2OTU0NDgzMX0.dWltf8vuwrB7-54fdFq-xwAqtGjV769ywuLxF4f3EDE"
);

// ✅ Upload button handler
document.getElementById("upload-btn").addEventListener("click", async () => {
  const name = document.getElementById("artwork-name").value.trim();
  const price = parseFloat(document.getElementById("artwork-price").value.trim());
  const fileInput = document.getElementById("artwork-file");
  const file = fileInput.files[0];

  if (!name || isNaN(price) || !file) {
    alert("Please fill all fields and select an image.");
    return;
  }

  // STEP 1: Insert metadata first (to get UUID)
  const { data: insertData, error: insertError } = await supabase
    .from("nfts")
    .insert([{ name, price }])
    .select()
    .single();

  if (insertError) {
    console.error("Insert error:", insertError);
    alert("❌ Failed to add NFT metadata to database.");
    return;
  }

  const uuid = insertData.id;
  const filePath = `artworks/${uuid}_${file.name}`;

  // STEP 2: Upload image to storage bucket
  const { error: uploadError } = await supabase.storage
    .from("nft-artworks")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    alert("❌ Failed to upload image to storage.");
    return;
  }

  // STEP 3: Get public image URL
  const { data: imageData } = supabase.storage
    .from("nft-artworks")
    .getPublicUrl(filePath);

  const image_url = imageData.publicUrl;

  // STEP 4: Update image_url in the same row
  const { error: updateError } = await supabase
    .from("nfts")
    .update({ image_url })
    .eq("id", uuid);

  if (updateError) {
    console.error("Update error:", updateError);
    alert("Image uploaded but database not updated.");
    return;
  }

  // ✅ Final Success Message + Redirect
  alert("✅ Artwork Successfully Uploaded!");
  window.location.href = `/${uuid}`;
});
