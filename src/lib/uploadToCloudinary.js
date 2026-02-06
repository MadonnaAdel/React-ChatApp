export const uploadToCloudinary = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "chat-app-upload"); 
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/dogucfeg3/image/upload`,
    {
      method: "POST",
      body: data,
    }
  );

  const json = await res.json();
  if (json.secure_url) return json.secure_url;
  else throw new Error("Upload failed");
};
