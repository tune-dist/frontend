export type CoverArtWarningIssue = {
  code?: string;
  message: string;
  severity?: string;
};

export type UploadWarningFields = {
  warning?: boolean;
  audioWarningMessage?: string | null;
  coverArtWarnings?: CoverArtWarningIssue[] | null;
};

/** True when the release has acknowledged upload-time warnings (not PDL). */
export function hasUploadWarning(fields: UploadWarningFields): boolean {
  if (fields.warning === true) return true;
  if (
    typeof fields.audioWarningMessage === 'string' &&
    fields.audioWarningMessage.trim().length > 0
  ) {
    return true;
  }
  return (fields.coverArtWarnings?.length ?? 0) > 0;
}

export function getAudioUploadWarning(
  fields: UploadWarningFields,
): string | null {
  if (
    typeof fields.audioWarningMessage === 'string' &&
    fields.audioWarningMessage.trim().length > 0
  ) {
    return fields.audioWarningMessage.trim();
  }
  return null;
}

export function getCoverArtUploadWarnings(
  fields: UploadWarningFields,
): CoverArtWarningIssue[] {
  if (!Array.isArray(fields.coverArtWarnings)) return [];
  return fields.coverArtWarnings.filter(
    (issue) =>
      !!issue &&
      typeof issue.message === 'string' &&
      issue.message.trim().length > 0,
  );
}
