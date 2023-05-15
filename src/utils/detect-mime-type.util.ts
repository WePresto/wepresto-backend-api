export function detectMimeTypeFromBase64(base64: string): string {
  const signatures = {
    JVBERi0: 'application/pdf',
    R0lGODdh: 'image/gif',
    R0lGODlh: 'image/gif',
    iVBORw0KGgo: 'image/png',
    '/9j/': 'image/jpg',
  };

  for (const s in signatures) {
    if (base64.indexOf(s) === 0) {
      return signatures[s];
    }
  }
}
