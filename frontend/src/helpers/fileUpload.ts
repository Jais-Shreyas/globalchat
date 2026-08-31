import { apiFetch } from "./fetchHelper";

async function calculateSHA256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    buffer
  );

  return btoa(
    String.fromCharCode(...new Uint8Array(hashBuffer))
  );
}
const uploadFile = async (file: File) => {
  const checksum = await calculateSHA256(file);
  const upload = await apiFetch("/files/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: file.name,
      mimeType: file.type,
      size: file.size,
      checksum,
    }),
  });

  const uploadResponse = await fetch(upload.uploadUrl, {
    method: "PUT",
    headers: upload.headers,
    body: file,
  });
  
  if (!uploadResponse.ok) {
    throw new Error("Failed to upload file");
  }
  return {
    uploadId: upload.uploadId,
    fileId: upload.fileId,
    name: file.name,
    mimeType: file.type,
    size: file.size,
  };
}

export {
  uploadFile,
};
