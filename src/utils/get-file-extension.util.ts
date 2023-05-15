import { detectMimeTypeFromBase64 } from './detect-mime-type.util';

export function getFileExtension(filename: string) {
  return filename.split('.').pop();
}

export function getFileExtensionByMimeType(base64: string) {
  const mimeType = detectMimeTypeFromBase64(base64);

  switch (mimeType) {
    case 'application/pdf':
      return 'pdf';
    case 'image/gif':
      return 'gif';
    case 'image/png':
      return 'png';
    case 'image/jpg':
      return 'jpg';
    default:
      return 'unknown';
  }
}
