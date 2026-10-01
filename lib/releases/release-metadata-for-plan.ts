import { getDefaultLabelName } from '@/lib/validation/label-name';

export type ReleaseMetadataFields = {
  labelName: string;
  copyright: string;
  producers: string[];
};

function isFreeDefault(value?: string | null): boolean {
  const trimmed = value?.trim() || '';
  return !trimmed || trimmed === getDefaultLabelName();
}

/**
 * Free plan always uses the default label.
 * Paid plans use the saved label, or blank fields until the user saves one.
 * On edit, only free-plan defaults are replaced so a custom line already on the release stays.
 */
export function releaseMetadataForPlan(input: {
  planKey: string;
  isStaff?: boolean;
  savedLabelName?: string | null;
  savedCopyright?: string | null;
  savedPublisher?: string | null;
  current?: {
    labelName?: string;
    copyright?: string;
    producers?: string[];
  };
  replaceDefaultOnly?: boolean;
}): ReleaseMetadataFields | null {
  if (input.replaceDefaultOnly && input.isStaff) {
    return null;
  }

  const defaultLabel = getDefaultLabelName();
  if (input.planKey === 'free') {
    return {
      labelName: defaultLabel,
      copyright: defaultLabel,
      producers: [defaultLabel],
    };
  }

  const savedLabel = input.savedLabelName?.trim() || '';
  const savedCopyright = input.savedCopyright?.trim() || savedLabel;
  const savedPublisher = input.savedPublisher?.trim() || savedLabel;
  const paidValues: ReleaseMetadataFields = savedLabel
    ? {
        labelName: savedLabel,
        copyright: savedCopyright,
        producers: [savedPublisher],
      }
    : {
        labelName: '',
        copyright: '',
        producers: [''],
      };

  if (!input.replaceDefaultOnly) {
    return paidValues;
  }

  const currentLabel = input.current?.labelName ?? '';
  const currentCopyright = input.current?.copyright ?? '';
  const currentPublisher = input.current?.producers?.[0] ?? '';
  const labelIsDefault = isFreeDefault(currentLabel);
  const copyrightIsDefault = isFreeDefault(currentCopyright);
  const publisherIsDefault = isFreeDefault(currentPublisher);

  if (!labelIsDefault && !copyrightIsDefault && !publisherIsDefault) {
    return null;
  }

  return {
    labelName: labelIsDefault ? paidValues.labelName : currentLabel,
    copyright: copyrightIsDefault ? paidValues.copyright : currentCopyright,
    producers: [publisherIsDefault ? paidValues.producers[0] : currentPublisher],
  };
}
