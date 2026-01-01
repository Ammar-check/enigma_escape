export function getImagePath(imagePath) {
  // If it's an absolute external URL (http/https), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Get basePath from env (set to '' for root deployments like Netlify)
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  
  // If path already includes basePath, return as-is
  if (imagePath.startsWith(basePath)) {
    return imagePath;
  }
  
  // If it starts with /, prepend basePath
  if (imagePath.startsWith('/')) {
    return `${basePath}${imagePath}`;
  }
  
  // Otherwise prepend basePath with /
  return `${basePath}/${imagePath}`;
}
