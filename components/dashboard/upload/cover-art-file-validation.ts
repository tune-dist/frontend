export interface CoverArtFieldRules {
  allowedFileTypes?: string[];
  maxFileSizeMB?: number;
}

export function getCoverArtMaxSizeMB(rules?: CoverArtFieldRules): number {
  return rules?.maxFileSizeMB ?? 10;
}

export function validateCoverArtFile(
  file: File,
  rules?: CoverArtFieldRules,
): { valid: true } | { valid: false; message: string } {
  const maxSizeMB = getCoverArtMaxSizeMB(rules);
  const allowedTypes = (rules?.allowedFileTypes ?? ["jpg", "jpeg", "png"]).map(
    (t) => t.toLowerCase(),
  );

  if (!file.type.startsWith("image/")) {
    return {
      valid: false,
      message: "Please upload an image file (JPG, PNG, etc.)",
    };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const subtype = file.type.split("/")[1]?.toLowerCase() ?? "";
  const typeAllowed =
    allowedTypes.includes(ext) ||
    allowedTypes.includes(subtype) ||
    (subtype === "jpeg" && allowedTypes.includes("jpg"));

  if (!typeAllowed) {
    return {
      valid: false,
      message: `File type '${ext || subtype}' is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    const fileSizeMB = file.size / (1024 * 1024);
    return {
      valid: false,
      message: `File size (${fileSizeMB.toFixed(2)}MB) exceeds the maximum allowed size of ${maxSizeMB}MB.`,
    };
  }

  return { valid: true };
}

export function validateCoverArtSize(
  sizeBytes: number,
  rules?: CoverArtFieldRules,
): { valid: true } | { valid: false; message: string } {
  const maxSizeMB = getCoverArtMaxSizeMB(rules);
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (sizeBytes <= maxBytes) return { valid: true };

  const fileSizeMB = sizeBytes / (1024 * 1024);
  return {
    valid: false,
    message: `File size (${fileSizeMB.toFixed(2)}MB) exceeds the maximum allowed size of ${maxSizeMB}MB.`,
  };
}
