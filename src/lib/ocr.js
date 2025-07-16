export async function uploadForOCR(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('http://localhost:3001/api/ocr', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('OCR failed');
  const data = await res.json();
  return data.text;
} 