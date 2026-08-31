import dotenv from 'dotenv';

dotenv.config();

const STORAGE_SERVICE_URL = process.env.STORAGE_SERVICE_URL;
const STORAGE_API_KEY = process.env.STORAGE_API_KEY;

export async function storageRequest(path, options = {}) {
  const response = await fetch(
    `${STORAGE_SERVICE_URL}${path}`,
    {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${STORAGE_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Storage Service error (${response.status}): ${errorText}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function createDirectUpload({
  originalName,
  mimeType,
  size,
  checksum,
}) {
  const response = await storageRequest("/v1/uploads/direct", {
    method: "POST",
    body: JSON.stringify({
      originalName,
      mimeType,
      size,
      checksum,
    }),
  });
  return {
    ...response,
    name: originalName,
  }
}

export async function completeDirectUpload(uploadId) {
  const response = await storageRequest(
    `/v1/uploads/direct/${uploadId}/complete`, {
    method: "POST",
  });
  return { ...response, name: response.originalName };
}

export async function getDownloadUrl(fileId) {
  const response = await storageRequest(
    `/v1/files/${fileId}/download-url`, {
    method: "GET",
  });
  return response;
}

export async function deleteFile(fileId) {
  const response = await fetch(`${STORAGE_SERVICE_URL}/v1/files/${fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${STORAGE_API_KEY}`,
    },
  });

  if (response.status === 404) {
    console.warn(`File with ID ${fileId} not found in storage service.`);
    return;
  }
  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Storage Service error (${response.status}): ${errorText}`
    );
  }

}