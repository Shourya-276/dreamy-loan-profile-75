import axios from "axios";

export async function uploadViaPresigned(key: string, file: File | Blob): Promise<void> {
  // Ask backend for a signed URL
  const { data } = await axios.post(`${import.meta.env.VITE_SERVER_URL}/s3/sign-upload`, {
    key,
    contentType: (file as File).type || "application/octet-stream",
  });

  const uploadUrl: string = data.uploadUrl;
  if (!uploadUrl) throw new Error("Failed to obtain upload URL");

  // PUT the object directly to S3
  await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": (file as File).type || "application/octet-stream",
    },
  });
} 