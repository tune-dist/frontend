/** Browser-side media metadata helpers for upload flows. */

export const getAudioMetadata = async (
  file: File,
): Promise<{ duration: number; format: string }> => {
  return new Promise((resolve) => {
    const audio = document.createElement('audio');
    audio.preload = 'metadata';

    audio.onloadedmetadata = () => {
      const duration = Math.floor(audio.duration);
      const format = file.type.split('/')[1] || file.name.split('.').pop() || 'unknown';
      URL.revokeObjectURL(audio.src);
      resolve({ duration, format });
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audio.src);
      resolve({ duration: 0, format: file.name.split('.').pop() || 'unknown' });
    };

    audio.src = URL.createObjectURL(file);
  });
};

export const getImageMetadata = async (
  file: File,
): Promise<{ width: number; height: number; format: string }> => {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const format = file.type.split('/')[1] || file.name.split('.').pop() || 'unknown';
      URL.revokeObjectURL(img.src);
      resolve({ width, height, format });
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve({ width: 0, height: 0, format: file.name.split('.').pop() || 'unknown' });
    };

    img.src = URL.createObjectURL(file);
  });
};
