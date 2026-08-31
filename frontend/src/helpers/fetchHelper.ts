export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('globalchat-authToken');

  let response: Response;

  try {
    response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${url}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new Error('Network error, please try again later');
  }

  if (response.status === 401) {
    localStorage.removeItem('globalchat-authToken');
    throw new Error('Unauthorized, please login again');
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || 'An error occurred');
  }

  return data;
};

export const getFileURL = async (fileId: string) => {
  try {
    const data = await apiFetch(`/files/${fileId}/download-url`);
    return data.downloadUrl;
  } catch (e) {
    throw new Error('File is no longer available to downlaod');
  }
}
