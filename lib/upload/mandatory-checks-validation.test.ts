import type { MandatoryChecks } from "@/components/dashboard/upload/types";
import {
  areMandatoryChecksComplete,
  getUncheckedMandatoryChecks,
  getRequiredMandatoryCheckKeys,
  needsCapitalizationConfirmation,
  hasIrregularCapitalization,
} from "@/lib/upload/mandatory-checks-validation";

describe("mandatory-checks-validation", () => {
  const allChecked: MandatoryChecks = {
    youtubeConfirmation: false,
    capitalizationConfirmation: true,
    promoServices: true,
    ownershipConfirmation: true,
    rightsAuthorization: true,
    nameUsage: true,
    termsAgreement: true,
  };

  it("requires capitalization only when title or artist has irregular casing", () => {
    expect(needsCapitalizationConfirmation("HELLO WORLD", "Artist")).toBe(true);
    expect(getRequiredMandatoryCheckKeys("Normal Title", "Artist Name")).not.toContain(
      "capitalizationConfirmation",
    );
    expect(getRequiredMandatoryCheckKeys("HELLO", "Artist")).toContain(
      "capitalizationConfirmation",
    );
  });

  it("reports unchecked required confirmations", () => {
    const partial = { ...allChecked, rightsAuthorization: false, termsAgreement: false };
    const unchecked = getUncheckedMandatoryChecks(partial, "Normal Title", "Artist Name");
    expect(unchecked).toEqual(expect.arrayContaining(["rightsAuthorization", "termsAgreement"]));
    expect(areMandatoryChecksComplete(partial, "Normal Title", "Artist Name")).toBe(false);
    expect(areMandatoryChecksComplete(allChecked, "Normal Title", "Artist Name")).toBe(true);
  });

  it("detects mixed-case capitalization patterns", () => {
    expect(hasIrregularCapitalization("helloWorld")).toBe(true);
    expect(hasIrregularCapitalization("Regular Title")).toBe(false);
  });
});
