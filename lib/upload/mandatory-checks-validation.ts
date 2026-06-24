import type { MandatoryChecks } from "@/components/dashboard/upload/types";

export const MANDATORY_CHECK_LABELS: Record<
  Exclude<keyof MandatoryChecks, "youtubeConfirmation">,
  string
> = {
  capitalizationConfirmation:
    "Confirm that the capitalization is intentional and strictly correct.",
  promoServices:
    "Confirm that KratoLib is a distributor and you are responsible for marketing.",
  ownershipConfirmation:
    "Confirm that the cover art and audio files are owned by you.",
  rightsAuthorization:
    "Confirm that you control all rights to this music.",
  nameUsage:
    "Confirm that you will not use another artist's name without permission.",
  termsAgreement: "Agree to the Terms of Service and Privacy Policy.",
};

export function hasIrregularCapitalization(text: string): boolean {
  if (!text) return false;
  return /[a-z][A-Z]/.test(text) || (text === text.toUpperCase() && text.length > 3);
}

export function needsCapitalizationConfirmation(title: string, artistName: string): boolean {
  return hasIrregularCapitalization(title) || hasIrregularCapitalization(artistName);
}

export function getRequiredMandatoryCheckKeys(
  title: string,
  artistName: string,
): Array<Exclude<keyof MandatoryChecks, "youtubeConfirmation">> {
  const keys: Array<Exclude<keyof MandatoryChecks, "youtubeConfirmation">> = [
    "promoServices",
    "ownershipConfirmation",
    "rightsAuthorization",
    "nameUsage",
    "termsAgreement",
  ];

  if (needsCapitalizationConfirmation(title, artistName)) {
    keys.unshift("capitalizationConfirmation");
  }

  return keys;
}

export function getUncheckedMandatoryChecks(
  checks: MandatoryChecks,
  title: string,
  artistName: string,
): Array<Exclude<keyof MandatoryChecks, "youtubeConfirmation">> {
  return getRequiredMandatoryCheckKeys(title, artistName).filter((key) => !checks[key]);
}

export function areMandatoryChecksComplete(
  checks: MandatoryChecks,
  title: string,
  artistName: string,
): boolean {
  return getUncheckedMandatoryChecks(checks, title, artistName).length === 0;
}

/** Pre-checked legal confirmations for releases already accepted at submission. */
export function buildAcceptedMandatoryChecks(): MandatoryChecks {
  return {
    youtubeConfirmation: true,
    capitalizationConfirmation: true,
    promoServices: true,
    rightsAuthorization: true,
    nameUsage: true,
    termsAgreement: true,
    ownershipConfirmation: true,
  };
}
