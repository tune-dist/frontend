/** Per-track S3 naming — never reuse album title for every file in an album. */
export function resolveAudioUploadTitle(
  af: { id?: string; fileName?: string },
  tracks: Array<{ audioFileId?: string; title?: string }> | undefined,
  index: number,
  albumTitle: string,
): string {
  const linked = tracks?.find((t) => t.audioFileId === af.id);
  const fromTrack = linked?.title?.trim();
  if (fromTrack) return fromTrack;
  const fromFile = af.fileName?.replace(/\.[^.]+$/i, '').trim();
  if (fromFile) return fromFile;
  const fromAlbum = albumTitle?.trim();
  if (fromAlbum) return `${fromAlbum}-track-${index + 1}`;
  return `track-${index + 1}`;
}
