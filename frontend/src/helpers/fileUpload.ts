const uploadImage = async (
  file: File,
  folder = "GlobalChat"
) => {
  try {
    const formData = new FormData();

    formData.append("file", file);

    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    );

    formData.append("folder", folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      }/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Upload failed");
    }

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };

  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};


const getOptimizedImageUrl = (
  url: string,
  width = 500,
  height = 500
) => {
  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,c_fill,g_auto,w_${width},h_${height}/`
  );
};

export {
  uploadImage,
  getOptimizedImageUrl,
};