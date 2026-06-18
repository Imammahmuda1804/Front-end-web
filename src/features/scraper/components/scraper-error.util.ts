type ApiErrorLike = {
  response?: {
    data?: {
      message?: string | string[];
      error?: string;
    };
  };
  message?: string;
};

export function getScraperErrorMessage(error: unknown) {
  const apiError = error as ApiErrorLike;
  const rawMessage =
    normalizeMessage(apiError.response?.data?.message) ||
    apiError.response?.data?.error ||
    apiError.message ||
    '';

  return formatScraperErrorMessage(rawMessage);
}

export function formatScraperErrorMessage(message?: string | null) {
  if (!message) return 'Scraper gagal. Periksa konfigurasi dan log backend.';

  const normalized = message.toLowerCase();

  if (
    normalized.includes('limit') ||
    normalized.includes('quota') ||
    normalized.includes('credit') ||
    normalized.includes('insufficient') ||
    normalized.includes('billing')
  ) {
    return 'Limit atau credit Apify habis. Tambah credit/kuota Apify atau tunggu kuota tersedia sebelum menjalankan scraper lagi.';
  }

  if (
    normalized.includes('token') ||
    normalized.includes('auth') ||
    normalized.includes('unauthorized') ||
    normalized.includes('401')
  ) {
    return 'Token Apify tidak valid atau belum dikonfigurasi. Periksa APIFY_API_TOKEN di environment backend.';
  }

  if (normalized.includes('timeout') || normalized.includes('timed out')) {
    return 'Scraper Apify timeout. Kurangi jumlah ulasan atau ulangi job beberapa menit lagi.';
  }

  return message;
}

function normalizeMessage(message?: string | string[]) {
  if (Array.isArray(message)) return message.join(', ');
  return message;
}
