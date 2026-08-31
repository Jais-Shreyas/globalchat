import jwt from 'jsonwebtoken';
import crypto from "crypto";
import { completeDirectUpload, createDirectUpload } from './storage.service.js';

export const handleUserDataSend = async (res, user) => {
  const token = jwt.sign(
    { _id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    user: {
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL
    },
    token
  });
};

export async function importGoogleProfilePhoto(photoURL, userId) {
  const response = await fetch(photoURL);

  if (!response.ok) {
    throw new Error("Failed to fetch Google profile photo");
  }

  const mimeType = response.headers.get("content-type")?.split(";")[0] ||
    "image/jpeg";

  const buffer = Buffer.from(await response.arrayBuffer());

  const checksum = crypto
    .createHash("sha256")
    .update(buffer)
    .digest("base64");

  const extension = mimeType.split("/")[1] || "jpeg";
  const originalName = `google-profile-${userId}.${extension}`;

  // Ask Storage Service for a presigned upload
  const upload = await createDirectUpload({
    originalName,
    mimeType,
    size: buffer.length,
    checksum,
  });

  // Upload the actual bytes directly to MinIO
  const uploadResponse = await fetch(
    upload.uploadUrl,
    {
      method: "PUT",
      headers: upload.headers,
      body: buffer,
    }
  );

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload Google profile photo");
  }

  // Complete the upload
  const completed = await completeDirectUpload(upload.uploadId);

  return {
    fileId: completed.id,
    name: completed.originalName,
    mimeType: completed.mimeType,
    size: completed.size,
  };
}