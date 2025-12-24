// Use environment variable if set, otherwise try to infer from current origin
const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // In production (Railway), if frontend and backend are on same domain with different paths
  // Or use the default localhost for development
  if (typeof window !== 'undefined') {
    // Try to use same origin (works if using Railway's proxy or same domain)
    return window.location.origin;
  }
  return 'http://localhost:4000';
};

const API_BASE_URL = getApiUrl();

export async function uploadImage(file: File): Promise<{ id: string }> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/uploads`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Upload failed');
  }

  return response.json();
}

export async function getAsset(id: string) {
  const response = await fetch(`${API_BASE_URL}/assets/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch asset');
  }
  return response.json();
}

export async function getAnalysis(id: string) {
  const response = await fetch(`${API_BASE_URL}/assets/${id}/analysis`);
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch analysis');
  }
  return response.json();
}

