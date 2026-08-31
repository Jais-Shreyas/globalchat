const checkBackend = async (): Promise<boolean> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/health`,
      {
        method: 'GET',
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    return data.status === 'ok';
  } catch {
    return false;
  }
};

export const waitForBackend = async (
  maxWaitTime = 45000,
  interval = 1000
): Promise<boolean> => {
  const start = Date.now();

  while (Date.now() - start < maxWaitTime) {
    if (await checkBackend()) {
      return true;
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }

  return false;
};