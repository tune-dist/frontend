import toast from 'react-hot-toast';
import { getMinTrackDurationError } from '@/components/dashboard/upload/crbt-validation';
import { validateWavAudioSpecs } from './audio-format';
import { parseWavHeader, type WavHeaderInfo } from './wav-header';

const MAX_WAV_FILE_BYTES = 500 * 1024 * 1024;

function isWavFile(file: File): boolean {
  return file.type.includes('wav') || file.name.toLowerCase().endsWith('.wav');
}

export async function validateLocalWavFile(file: File): Promise<WavHeaderInfo | null> {
  if (!isWavFile(file)) {
    toast.error(`File rejected: ${file.name}. Only WAV files are accepted.`);
    return null;
  }

  if (file.size > MAX_WAV_FILE_BYTES) {
    toast.error(`File rejected: ${file.name}. Size must be less than 500MB.`);
    return null;
  }

  try {
    const parsingToastId = toast.loading(`Checking audio format for ${file.name}...`);
    const wavHeader = await parseWavHeader(file);
    toast.dismiss(parsingToastId);

    const specValidation = validateWavAudioSpecs(wavHeader);
    if (!specValidation.valid) {
      toast.error(
        `"${file.name}" — ${specValidation.error || 'This audio file does not meet our upload requirements.'}`,
        { duration: 8000 },
      );
      return null;
    }

    const durationError = getMinTrackDurationError(wavHeader.durationSec);
    if (durationError) {
      toast.error(`${file.name}: ${durationError}`);
      return null;
    }

    return wavHeader;
  } catch (error) {
    console.error(error);
    toast.error(`Failed to validate ${file.name}. Please ensure it is a valid WAV.`);
    return null;
  }
}
