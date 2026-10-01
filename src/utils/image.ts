const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Resolves an image URL from backend to a fully qualified URL
 */
export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  const cleanBase = BASE_URL.replace(/\/+$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  
  return `${cleanBase}${cleanPath}`;
}

/**
 * Validates selected image file before upload
 */
export function validateImageFile(file: File, maxSizeBytes = 5 * 1024 * 1024): { isValid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload a JPG, PNG, WebP, or GIF image.',
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      isValid: false,
      error: `File size exceeds maximum limit of ${sizeMb}MB.`,
    };
  }

  return { isValid: true };
}
