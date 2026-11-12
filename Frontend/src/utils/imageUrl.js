export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return null;
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const cleanBase = baseUrl.replace(/\/+$/, '');

  if (imagePath.startsWith('/uploads/')) {
    return `${cleanBase}${imagePath}`;
  }

  if (imagePath.startsWith('/')) {
    return `${cleanBase}${imagePath}`;
  }

  return `${cleanBase}/uploads/${imagePath}`;
};

export const formatPrice = (price) => {
  const numericPrice = Number(price);
  if (Number.isNaN(numericPrice)) {
    return '0 ₺';
  }

  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(numericPrice);
};

