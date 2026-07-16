export type SubmitProgressUpdate = {
  percent: number;
  label: string;
};

export type SubmitProgressCallback = (update: SubmitProgressUpdate) => void;

const UPLOAD_PHASE_MAX = 85;

export function createSubmitProgressTracker(
  uploadCount: number,
  onProgress?: SubmitProgressCallback,
) {
  let completedUploads = 0;
  const slice = uploadCount > 0 ? UPLOAD_PHASE_MAX / uploadCount : 0;

  const emit = (percent: number, label: string) => {
    onProgress?.({
      percent: Math.min(99, Math.max(0, Math.round(percent))),
      label,
    });
  };

  const start = () => {
    emit(0, uploadCount > 0 ? 'Preparing uploads…' : 'Preparing release…');
  };

  const wrapFileUpload = async (
    label: string,
    upload: (onFileProgress: (percent: number) => void) => Promise<void>,
  ) => {
    if (uploadCount === 0) {
      await upload(() => {});
      return;
    }

    const base = completedUploads * slice;
    await upload((filePercent) => {
      emit(base + (filePercent / 100) * slice, label);
    });
    completedUploads += 1;
    emit(completedUploads * slice, label);
  };

  const uploadsFinished = () => {
    emit(uploadCount > 0 ? UPLOAD_PHASE_MAX : 50, uploadCount > 0 ? 'Uploads complete' : 'Preparing release data…');
  };

  return { start, wrapFileUpload, uploadsFinished, uploadCount };
}
