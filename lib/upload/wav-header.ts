export type WavHeaderInfo = {
  sampleRate: number;
  bitDepth: number;
  channels: number;
  durationSec?: number;
};

export function parseWavHeader(file: File): Promise<WavHeaderInfo> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) return reject(new Error('Failed to read file'));

      const view = new DataView(buffer);

      if (view.byteLength < 12) {
        return reject(new Error('Invalid audio file format (File too small)'));
      }

      const riff = String.fromCharCode(
        view.getUint8(0),
        view.getUint8(1),
        view.getUint8(2),
        view.getUint8(3),
      );
      if (riff !== 'RIFF') {
        return reject(new Error('Invalid audio file format (Header missing RIFF)'));
      }

      const wave = String.fromCharCode(
        view.getUint8(8),
        view.getUint8(9),
        view.getUint8(10),
        view.getUint8(11),
      );
      if (wave !== 'WAVE') {
        return reject(new Error('Invalid audio file format (Header missing WAVE)'));
      }

      let sampleRate = 0;
      let bitDepth = 16;
      let channels = 0;
      let dataChunkSize = 0;

      let offset = 12;
      while (offset + 8 <= view.byteLength) {
        const chunkId = String.fromCharCode(
          view.getUint8(offset),
          view.getUint8(offset + 1),
          view.getUint8(offset + 2),
          view.getUint8(offset + 3),
        );
        const chunkSize = view.getUint32(offset + 4, true);

        if (chunkId === 'fmt ') {
          if (offset + 8 + 14 > view.byteLength) {
            return reject(new Error('Corrupted WAV format chunk'));
          }

          channels = view.getUint16(offset + 10, true);
          sampleRate = view.getUint32(offset + 12, true);
          bitDepth =
            offset + 8 + 16 <= view.byteLength
              ? view.getUint16(offset + 22, true)
              : 16;
        } else if (chunkId === 'data') {
          dataChunkSize = chunkSize;
        }

        const advance = 8 + chunkSize + (chunkSize % 2 !== 0 ? 1 : 0);
        if (advance <= 0) break;
        offset += advance;
      }

      if (!sampleRate || !channels) {
        return reject(new Error('Could not find format chunk (fmt ) in WAV file'));
      }

      const bytesPerFrame = channels * (bitDepth / 8);
      const durationSec =
        dataChunkSize > 0 && bytesPerFrame > 0
          ? dataChunkSize / bytesPerFrame / sampleRate
          : undefined;

      resolve({ sampleRate, bitDepth, channels, durationSec });
    };
    reader.onerror = () => reject(new Error('Error reading file header'));
    reader.readAsArrayBuffer(file.slice(0, Math.min(file.size, 65536)));
  });
}
