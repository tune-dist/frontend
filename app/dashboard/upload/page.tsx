"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import PageLoading from "@/components/dashboard/page-loading";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Info,
  Music,
  Image as ImageIcon,
  Users,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";

// React Hook Form & Zod
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TrackEditModal from "@/components/dashboard/upload/track-edit-modal";
import {
  UploadFormData,
  uploadFormSchema,
  Songwriter,
  MandatoryChecks,
  Track,
} from "@/components/dashboard/upload/types";
import { getDefaultLabelName } from "@/lib/validation/label-name";

// Child Components
import BasicInfoStep from "@/components/dashboard/upload/basic-info-step";
import AudioFileStep from "@/components/dashboard/upload/audio-file-step";
import CoverArtStep from "@/components/dashboard/upload/cover-art-step";
import CreditsStep from "@/components/dashboard/upload/credits-step";
import { isInstrumentalRelease, resolveLanguage } from "@/components/dashboard/upload/genre-language";
import { validateCoverArtSize, validateCoverArtDimensions, isExistingUnchangedCoverArt } from "@/components/dashboard/upload/cover-art-file-validation";
import ReviewStep from "@/components/dashboard/upload/review-step";
import { submitNewRelease, getArtistUsage, getReleases, getRelease, submitReleaseUpdate } from "@/lib/api/releases";
import { hydrateDraftForm } from "@/lib/releases";
import {
  attachSignedPlaybackUrl,
  attachSignedPlaybackUrls,
} from "@/lib/upload/audio-playback";
import { getSignedUrl } from "@/lib/api/s3";
import { isPlanInactiveError } from "@/lib/plan-inactive";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  getLegalPersonNameError,
  LEGAL_PERSON_NAME_HINT,
} from '@/lib/validation/legal-person-name';
import { applyUploadApiErrors } from "@/lib/upload-api-errors";
import {
  areMandatoryChecksComplete,
  getUncheckedMandatoryChecks,
  MANDATORY_CHECK_LABELS,
  buildAcceptedMandatoryChecks,
} from "@/lib/upload/mandatory-checks-validation";
import {
  getPlanLimits,
  getPlanByKey,
  getPlanFieldRules,
} from "@/lib/api/plans";
import { canManageReleases, hasPermission } from "@/lib/permissions";
import { isRmEditableRelease } from "@/lib/release-status";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const steps = [
  { id: 1, name: "Release Details", icon: Info },
  { id: 2, name: "Audio File", icon: Music },
  { id: 3, name: "Credits", icon: Users },
  { id: 4, name: "Cover Art", icon: ImageIcon },
  { id: 5, name: "Review", icon: CheckCircle },
];

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editReleaseId = searchParams.get("edit");
  const isEditMode = !!editReleaseId;
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(isEditMode);
  const [showCancelEditDialog, setShowCancelEditDialog] = useState(false);
  const isHydratingRef = useRef(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
      return;
    }
    if (!loading && user) {
      if (isEditMode) {
        if (!canManageReleases(user)) {
          router.push("/dashboard/releases");
        }
      } else if (!hasPermission(user, "UPLOAD_RELEASE")) {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router, isEditMode]);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // Track modal state
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [editingTrackIndex, setEditingTrackIndex] = useState<number | null>(
    null
  );

  const openTrackModal = (index: number) => {
    setEditingTrackIndex(index);
    setIsTrackModalOpen(true);
  };

  const saveTrackModal = (
    updatedTrack: Track,
    writers: string[],
    composers: string[]
  ) => {
    if (editingTrackIndex !== null) {
      const currentTracks = form.getValues("tracks") || [];
      const updatedTracks = [...currentTracks];
      updatedTracks[editingTrackIndex] = {
        ...updatedTrack,
        writers,
        composers,
      };
      form.setValue("tracks", updatedTracks, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  // Initialize Form

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      numberOfSongs: "1",
      title: "",
      artistName: "",
      cosmosArtistId: "",
      version: "",
      previouslyReleased: "no",
      primaryGenre: "",
      secondaryGenre: "",
      language: "",
      labelName: "",
      tracks: [],
      spotifyProfile: "",
      appleMusicProfile: "",
      youtubeMusicProfile: "",
      instagramProfile: "no",
      facebookProfile: "no",
      dolbyAtmos: "no",
      instrumental: "no",
      writers: [],
      composers: [],
      copyright: getDefaultLabelName(),
      producers: [getDefaultLabelName()],
      recordingYear: new Date().getFullYear(),
      mood: "",
      coverArtChanged: false,
    },
    mode: "onChange",
  });

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = form;

  useEffect(() => {
    if (!isEditMode || !editReleaseId || !user || !canManageReleases(user)) return;

    let cancelled = false;

    const loadReleaseForEdit = async () => {
      setIsLoadingEdit(true);
      try {
        const release = await getRelease(editReleaseId);
        if (cancelled) return;

        if (!isRmEditableRelease(release.status)) {
          toast.error("Only in-process releases can be edited.");
          router.push("/dashboard/releases");
          return;
        }

        const formValues = hydrateDraftForm(release);
        isHydratingRef.current = true;
        form.reset({
          ...form.getValues(),
          ...formValues,
          format: formValues.format || "single",
          releaseType: formValues.format || "single",
          coverArtMetadataStale: false,
          coverArtChanged: false,
        } as UploadFormData);

        if (formValues.writers?.length) setWriters(formValues.writers);
        if (formValues.composers?.length) setComposers(formValues.composers);

        setMandatoryChecks(buildAcceptedMandatoryChecks());
        setLegalConfirmationsLocked(true);
        setShowMandatoryCheckErrors(false);

        const hydratedAudioFile = formValues.audioFile
          ? await attachSignedPlaybackUrl(formValues.audioFile as any)
          : null;
        const hydratedAudioFiles = formValues.audioFiles?.length
          ? await attachSignedPlaybackUrls(formValues.audioFiles as any)
          : [];

        if (hydratedAudioFile) {
          form.setValue("audioFile", hydratedAudioFile as any, { shouldValidate: true });
        }
        if (hydratedAudioFiles.length) {
          form.setValue("audioFiles", hydratedAudioFiles as any, { shouldValidate: true });
        }

        if (release.coverArt?.url) {
          try {
            const previewUrl = await getSignedUrl(release.coverArt.url);
            if (!cancelled) {
              form.setValue("coverArtPreview", previewUrl, { shouldValidate: true });
            }
          } catch (error) {
            console.error("Failed to load cover art preview", error);
          }
        }

        isHydratingRef.current = false;
      } catch (error) {
        if (!cancelled) {
          toast.error(getErrorMessage(error, "Failed to load release for editing"));
          router.push("/dashboard/releases");
        }
      } finally {
        if (!cancelled) setIsLoadingEdit(false);
      }
    };

    loadReleaseForEdit();

    return () => {
      cancelled = true;
    };
  }, [editReleaseId, form, isEditMode, router, user]);

  // Separate state for internal component logic (Credits step songwriters list etc)
  // These could be moved into the form too, but for UI lists that map to a final field, local state is sometimes easier until submit.
  // HOWEVER, preventing state loss on nav requires them to be lifted or in form.
  // For now we keep them here as in original, but we should sync them to form on submit or change.
  // Ideally we refactor CreditsStep to useFieldArray. For now, let's keep passing them.
  const [writers, setWriters] = useState<string[]>([]);
  const [composers, setComposers] = useState<string[]>([]);

  const [mandatoryChecks, setMandatoryChecks] = useState<MandatoryChecks>({
    youtubeConfirmation: false,
    capitalizationConfirmation: false,
    promoServices: false,
    rightsAuthorization: false,
    nameUsage: false,
    termsAgreement: false,
    ownershipConfirmation: false,
  });
  const [showMandatoryCheckErrors, setShowMandatoryCheckErrors] = useState(false);
  const [legalConfirmationsLocked, setLegalConfirmationsLocked] = useState(false);
  const handleMandatoryChecksChange = (checks: MandatoryChecks) => {
    if (legalConfirmationsLocked) return;
    setMandatoryChecks(checks);
    if (showMandatoryCheckErrors) {
      const title = form.getValues("title") || "";
      const artistName = form.getValues("artistName") || "";
      if (areMandatoryChecksComplete(checks, title, artistName)) {
        setShowMandatoryCheckErrors(false);
      }
    }
  };

  const [usedArtists, setUsedArtists] = useState<any[]>([]);
  const [fieldRules, setFieldRules] = useState<Record<string, any>>({});

  // Fetch used artists and field rules on mount
  useEffect(() => {
    if (user) {
      // Fetch artists
      getArtistUsage()
        .then((data) => setUsedArtists(data.artists))
        .catch((err) => console.error("Failed to fetch artist usage", err));

      // Fetch field rules
      const planKey = (user.plan as string) || "free";
      getPlanFieldRules(planKey)
        .then((rules) => {
          setFieldRules(rules);
          if (planKey === "free") {
            form.setValue("labelName", getDefaultLabelName(), { shouldValidate: true });
          }
        })
        .catch((err) => console.error("Failed to fetch field rules", err));

    }
  }, [user]);

  // Watch for bridging to old components
  const formData = form.watch();
  const setFormData = (data: Partial<UploadFormData>) => {
    // Bridge for legacy components calling setFormData
    Object.entries(data).forEach(([key, value]) => {
      form.setValue(key as any, value, {
        shouldValidate: true,
        shouldDirty: true,
      });
    });
  };

  const scrollToError = () => {
    // Wait a bit for React to update the DOM with error states/classes
    setTimeout(() => {
      const firstError = document.querySelector(
        ".border-red-500, [aria-invalid='true'], .text-red-500"
      );
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        // If it's an input, focus it
        if (
          firstError instanceof HTMLInputElement ||
          firstError instanceof HTMLTextAreaElement ||
          firstError instanceof HTMLSelectElement
        ) {
          firstError.focus();
        }
      }
    }, 100);
  };

  const handleNext = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      let isValid = false;

      // Step-based validation
      switch (currentStep) {
        case 1: {
          // Basic Info
          // Fetch plan data first to know what fields are required
          const planKey = (user?.plan as string) || "free";
          const [limits, fieldRules] = await Promise.all([
            getPlanLimits(planKey),
            getPlanFieldRules(planKey),
          ]);

          // Build validation fields array based on plan
          const fieldsToValidate = ["title", "artistName", "format", "releaseDate", "labelName"];

          // Add featuredArtist to validation if required by plan
          if (fieldRules.featuredArtists?.required) {
            fieldsToValidate.push("featuringArtist");
          }

          if (planKey === "free") {
            form.setValue("labelName", getDefaultLabelName(), { shouldValidate: true });
          }

          isValid = await form.trigger(fieldsToValidate as any);

          // Manually check featuredArtist if required by plan
          // form.trigger doesn't pick up dynamic validation because the Zod schema defines it as optional
          if (
            fieldRules.featuredArtists?.required &&
            !formData.featuringArtist?.trim()
          ) {
            form.setError(
              "featuringArtist",
              {
                type: "required",
                message: "Featuring artist is required",
              },
              { shouldFocus: true }
            );
            isValid = false;
          }


          if (isValid) {
            // Check Artist Limits (skip for unlimited plans)
            if (limits.artistLimit < 9999) {
              const currentArtists = [
                formData.artistName,
                ...(formData.artists || []).map((a: any) => a.name),
              ].filter(Boolean);

              // Count how many NEW artists are being introduced
              let newArtistsCount = 0;
              const uniqueCurrentArtists = new Set(currentArtists);

              for (const artist of Array.from(uniqueCurrentArtists)) {
                // Normalize check (case insensitive or exact? backend uses distinct so exact usually, but let's assume exact for now)
                const isUsed = usedArtists.some((used) => {
                  const usedName = typeof used === "string" ? used : used.name;
                  return usedName === artist;
                });

                if (!isUsed) {
                  newArtistsCount++;
                }
              }

              // Total unique artists user WILL have after this release
              // = (already used artists count) + (newly unique artists in this release)
              // Actually simple check: Used + New <= Limit
              const totalUsedCount = usedArtists.length;

              if (totalUsedCount + newArtistsCount > limits.artistLimit) {
                toast.error(
                  `You have reached your artist limit (${limits.artistLimit
                  }) for the ${planKey === "creator_plus" ? "Creator+" : planKey
                  } plan.`
                );
                isValid = false;
              }
            }
          }

          if (!isValid) {
            scrollToError();
          }
          break;
        }
        case 2: // Audio
          if (formData.format === "single") {
            // For single, we need audioFile.
            // Note: 'audioFile' in zod is 'any'. We manually check if it's null.
            // Ideally zod schema handles this with custom check, but File object is tricky in server/client boundary types.
            if (!formData.audioFile) {
              form.setError("audioFile", {
                type: "required",
                message: "Audio file is required",
              });
              isValid = false;
            } else if (formData.audioDuplicateDetected && !formData.audioConsent) {
              form.setError("audioConsent", {
                type: "manual",
                message: "Please provide consent to proceed with a duplicate file.",
              });
              toast.error("Please confirm you want to proceed with the duplicate audio");
              isValid = false;
            } else {
              form.clearErrors("audioFile");
              form.clearErrors("audioConsent");
              isValid = true;
            }
          } else {
            // EP/Album
            if (formData.tracks.length === 0) {
              toast.error("Please add at least one track");
              isValid = false;
            } else if (formData.audioDuplicateDetected && !formData.audioConsent) {
              form.setError("audioConsent", {
                type: "manual",
                message: "Please provide consent to proceed with duplicate files.",
              });
              toast.error("Please confirm you want to proceed with the duplicate audio");
              isValid = false;
            } else {
              form.clearErrors("audioConsent");
              isValid = true;
            }
          }
          break;
        case 3: // Credits
          isValid = true;
          // Validate required fields in Credits step
          if (formData.format === "single") {
            // For singles, validate genre and credits metadata
            const fieldsToValidate = [
              "primaryGenre",
              "secondaryGenre",
              "language",
            ];

            if (!formData.primaryGenre?.trim()) {
              form.setError("primaryGenre", {
                type: "required",
                message: "Primary genre is required",
              });
              isValid = false;
            }

            if (!formData.secondaryGenre?.trim()) {
              form.setError("secondaryGenre", {
                type: "required",
                message: "Sub-genre is required",
              });
              isValid = false;
            }

            // Manual validation for language
            const stepValues = form.getValues();
            const resolvedLanguage = resolveLanguage(
              stepValues.primaryGenre,
              stepValues.language,
              stepValues.instrumental,
            );
            if (!resolvedLanguage) {
              form.setError("language", {
                type: "required",
                message: "Language is required for single releases",
              });
              isValid = false;
            } else {
              form.clearErrors("language");
              if (stepValues.language !== resolvedLanguage) {
                form.setValue("language", resolvedLanguage, { shouldValidate: true });
              }
            }


            // Manual validation for mood (Vibe)
            if (!formData.mood || formData.mood.trim() === "") {
              form.setError("mood", {
                type: "required",
                message: "Vibe is required",
              });
              isValid = false;
            }

            // If validation failed, scroll to error and break
            if (!isValid) {
              scrollToError();
              break;
            }

            // Conditional validation based on fieldRules
            // Check songwriters (writers)
            const writersAllowed = fieldRules.songwriters?.allow !== false;
            const writersRequired = fieldRules.songwriters?.required !== false;
            const isNoLyricsSingle = isInstrumentalRelease(
              formData.primaryGenre,
              formData.instrumental,
            );
            if (writersAllowed && !isNoLyricsSingle) {
              // If required, we should convert to required array check via zod manually or check length
              if (writersRequired) {
                const writers = formData.writers || [];
                if (writers.length === 0) {
                  toast.error("At least one songwriter is required");
                  isValid = false;
                  break;
                }
                const filledWriters = writers.filter(w => w?.trim() !== "");
                if (filledWriters.length === 0) {
                  toast.error("At least one songwriter is required");
                  form.setError("writers.0", {
                    type: "required",
                    message: "At least one songwriter is required",
                  });
                  isValid = false;
                  break;
                }
              }
              // If present, validate content via trigger if needed, or rely on form submit
              fieldsToValidate.push("writers");
            }

            // Check composers
            const composersAllowed = fieldRules.composers?.allow !== false;
            const composersRequired = fieldRules.composers?.required !== false;
            if (composersAllowed) {
              if (composersRequired) {
                const composers = formData.composers || [];
                if (composers.length === 0) {
                  toast.error("At least one composer is required");
                  isValid = false;
                  break;
                }
                const filledComposers = composers.filter(c => c?.trim() !== "");
                if (filledComposers.length === 0) {
                  toast.error("At least one composer is required");
                  form.setError("composers.0", {
                    type: "required",
                    message: "At least one composer is required",
                  });
                  isValid = false;
                  break;
                }
              }
              fieldsToValidate.push("composers");
            }

            // Check producers
            const producersAllowed = fieldRules.producers?.allow !== false;
            const producersRequired = fieldRules.producers?.required !== false;
            if (producersAllowed) {
              if (
                producersRequired &&
                (!formData.producers || formData.producers.length === 0)
              ) {
                form.setError("producers", {
                  type: "required",
                  message: "At least one producer is required",
                });
                isValid = false;
                break;
              }
              fieldsToValidate.push("producers");
            }

            // Featured Artist validation for Singles
            if (fieldRules.featuredArtists?.required && (!formData.featuringArtist || formData.featuringArtist.trim() === "")) {
              form.setError("featuringArtist", {
                type: "required",
                message: "Featuring artist is required",
              });
              isValid = false;
            }

            // Check copyright
            const copyrightAllowed = fieldRules.copyright?.allow !== false;
            const copyrightRequired = fieldRules.copyright?.required === true;
            if (copyrightAllowed) {
              if (copyrightRequired && !formData.copyright) {
                form.setError("copyright", {
                  type: "required",
                  message: "Copyright is required",
                });
                isValid = false;
                break;
              }
            }

            const triggerResult = await form.trigger(fieldsToValidate as any);
            isValid = isValid && triggerResult;
          } else {
            // For Albums/EPs, validate all tracks have required metadata
            if (formData.tracks.length === 0) {
              toast.error("Please add at least one track");
              isValid = false;
            } else {
              // Check each track for required fields
              const nameErrorHint = LEGAL_PERSON_NAME_HINT;
              let hasError = false;

              for (let i = 0; i < formData.tracks.length; i++) {
                const track = formData.tracks[i];

                if (!track.title?.trim()) {
                  toast.error(`Track ${i + 1}: Title is required`);
                  hasError = true;
                  break;
                }

                if (!track.artistName?.trim()) {
                  toast.error(`Track ${i + 1}: Artist name is required`);
                  hasError = true;
                  break;
                }

                if (!track.primaryGenre) {
                  toast.error(`Track ${i + 1}: Primary genre is required`);
                  hasError = true;
                  break;
                }

                if (!track.secondaryGenre) {
                  toast.error(`Track ${i + 1}: Sub-genre is required`);
                  hasError = true;
                  break;
                }

                const filledWriters = (track.writers || []).filter(sw => sw?.trim());
                const isNoLyricsTrack = isInstrumentalRelease(
                  track.primaryGenre || formData.primaryGenre,
                  track.isInstrumental,
                );
                if (!isNoLyricsTrack && filledWriters.length === 0) {
                  toast.error(`Track ${i + 1}: At least one writer is required`);
                  hasError = true;
                  break;
                }

                if (!isNoLyricsTrack) {
                for (const sw of filledWriters) {
                  if (getLegalPersonNameError(sw.trim())) {
                    toast.error(
                      `Track ${i + 1}: Invalid writer name "${sw}". ${nameErrorHint}`
                    );
                    hasError = true;
                    break;
                  }
                }
                }

                if (hasError) break;

                const filledComposers = (track.composers || []).filter(comp => comp?.trim());
                if (filledComposers.length > 0) {
                  for (const comp of filledComposers) {
                    if (getLegalPersonNameError(comp.trim())) {
                      toast.error(
                        `Track ${i + 1}: Invalid composer name "${comp}". ${nameErrorHint}`
                      );
                      hasError = true;
                      break;
                    }
                  }
                }

                if (hasError) break;
              }

              isValid = !hasError;
            }
          }

          // Validate Artist Limit for all formats
          if (isValid) {
            const planKey = (user?.plan as string) || "free";
            const limits = await getPlanLimits(planKey);

            if (limits.artistLimit < 9999) {
              // Collect all unique artists in this release
              const releaseArtists: string[] = [];

              // Add main artist
              if (formData.artistName?.trim()) {
                releaseArtists.push(formData.artistName.trim());
              }

              // Add featuring artists
              if (formData.artists && formData.artists.length > 0) {
                formData.artists.forEach((artist: any) => {
                  if (artist.name?.trim()) {
                    releaseArtists.push(artist.name.trim());
                  }
                });
              }

              // Add track artists (for albums/EPs)
              if (formData.tracks && formData.tracks.length > 0) {
                formData.tracks.forEach((track: any) => {
                  if (track.artistName?.trim()) {
                    releaseArtists.push(track.artistName.trim());
                  }
                });
              }

              // Get unique artists
              const uniqueArtists = new Set(releaseArtists);

              // Count new artists
              let newArtistsCount = 0;
              for (const artist of Array.from(uniqueArtists)) {
                // Normalize check: usedArtists can be string[] or object[]
                const isUsed = usedArtists.some((used) => {
                  const usedName = typeof used === "string" ? used : used.name;
                  return usedName === artist;
                });

                if (!isUsed) {
                  newArtistsCount++;
                }
              }

              // Check if exceeds limit
              const totalUsedCount = usedArtists.length;
              if (totalUsedCount + newArtistsCount > limits.artistLimit) {
                const planName =
                  planKey === "creator_plus"
                    ? "Creator+"
                    : planKey.charAt(0).toUpperCase() + planKey.slice(1);
                toast.error(
                  `You have reached your artist limit (${limits.artistLimit}) for the ${planName} plan.`
                );
                isValid = false;
              }
            }
          }

          if (!isValid) {
            scrollToError();
          }
          break;
        case 4: // Cover Art
          if (!formData.coverArt) {
            form.setError("coverArt", {
              type: "required",
              message: "Cover art is required",
            });
            isValid = false;
          } else if (
            isExistingUnchangedCoverArt(
              formData.coverArt,
              formData.coverArtChanged,
            )
          ) {
            form.clearErrors("coverArt");
            form.clearErrors("coverArtConsent");
            isValid = true;
          } else {
            const coverArtData = formData.coverArt as any;
            const coverSize =
              coverArtData?.size ??
              coverArtData?.file?.size ??
              (formData.coverArt instanceof File ? formData.coverArt.size : 0);

            const sizeValidation = validateCoverArtSize(
              coverSize,
              fieldRules.coverArt,
            );
            if (!sizeValidation.valid) {
              form.setError("coverArt", {
                type: "manual",
                message: sizeValidation.message,
              });
              toast.error(sizeValidation.message);
              isValid = false;
            } else {
              const coverWidth = coverArtData?.dimensions?.width ?? 0;
              const coverHeight = coverArtData?.dimensions?.height ?? 0;
              const dimensionValidation = validateCoverArtDimensions(
                coverWidth,
                coverHeight,
              );

              if (!dimensionValidation.valid) {
                form.setError("coverArt", {
                  type: "manual",
                  message: dimensionValidation.message,
                });
                toast.error(dimensionValidation.message);
                isValid = false;
              } else if (
                formData.coverArtChanged &&
                !formData.coverArtValidationStatus
              ) {
                form.setError("coverArt", {
                  type: "manual",
                  message: "Please wait for cover art validation to finish.",
                });
                toast.error("Cover art must be validated before continuing.");
                isValid = false;
              } else {
              const status = formData.coverArtValidationStatus;
              const issues = formData.coverArtValidationIssues || [];
              const hasIssues =
                formData.coverArtChanged &&
                ((status && status !== "approved") || issues.length > 0);

              if (hasIssues && !formData.coverArtConsent) {
                form.setError("coverArtConsent", {
                  type: "manual",
                  message:
                    "Please provide consent to proceed with current cover art.",
                });
                toast.error(
                  "Please confirm you want to proceed with the cover art warnings",
                );
                isValid = false;
              } else {
                form.clearErrors("coverArtConsent");
                isValid = true;
              }
              }
            }
          }

          if (!isValid) {
            scrollToError();
          }
          break;
        case 5: // Review
          isValid = true;
          break;
        default:
          isValid = true;
      }

      if (isValid && currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const exitEditMode = () => {
    router.push("/dashboard/releases");
  };

  const requestCancelEdit = () => {
    if (isDirty) {
      setShowCancelEditDialog(true);
      return;
    }
    exitEditMode();
  };

  const confirmCancelEdit = () => {
    setShowCancelEditDialog(false);
    exitEditMode();
  };

  const validateMandatoryChecksBeforeSubmit = (): boolean => {
    const title = form.getValues("title") || "";
    const artistName = form.getValues("artistName") || "";
    const unchecked = getUncheckedMandatoryChecks(mandatoryChecks, title, artistName);

    if (unchecked.length === 0) {
      setShowMandatoryCheckErrors(false);
      return true;
    }

    setShowMandatoryCheckErrors(true);
    const firstMissing = MANDATORY_CHECK_LABELS[unchecked[0]];
    toast.error(
      unchecked.length === 1
        ? firstMissing
        : `Please accept all ${unchecked.length} required legal confirmations before submitting.`,
    );

    document.getElementById("legal-confirmations")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    return false;
  };

  const onSubmit = async (data: UploadFormData) => {
    if (isProcessing || isSubmitting) return;
    if (!validateMandatoryChecksBeforeSubmit()) {
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEditMode && editReleaseId) {
        const result = await submitReleaseUpdate(editReleaseId, {
          ...data,
          mandatoryChecks: mandatoryChecks,
        } as any);
        toast.success(
          result?.pdlSynced
            ? "Release updated and synced to PDL."
            : "Release updated successfully!",
        );
      } else {
        await submitNewRelease({
          ...data,
          mandatoryChecks: mandatoryChecks,
        } as any);
        toast.success("Release submitted successfully!");
      }
      router.push("/dashboard/releases");
    } catch (error: any) {
      console.error("Submission error:", error);
      setIsSubmitting(false);
      // The plan-inactive modal already explains the block — skip the toast.
      if (!isPlanInactiveError(error)) {
        const { fieldErrors, globalErrors, targetStep } = applyUploadApiErrors(
          error,
          form.setError,
        );

        if (targetStep !== null) {
          setCurrentStep(targetStep);
        }

        if (globalErrors.length > 0) {
          toast.error(globalErrors.map((item) => item.message).join(". "));
        } else if (fieldErrors.length === 0) {
          toast.error(
            getErrorMessage(
              error,
              isEditMode ? "Failed to update release" : "Failed to submit release",
            ),
          );
        }

        // Wait for step navigation + error UI to render before scrolling.
        setTimeout(() => scrollToError(), targetStep !== null ? 250 : 100);
      }
    }
  };

  const onInvalid = () => {
    scrollToError();
  };

  const renderStepContent = () => {
    // Props bridge for components not yet updated to useFormContext
    const commonProps = {
      formData,
      setFormData,
      usedArtists,
    };

    switch (currentStep) {
      case 1:
        return <BasicInfoStep {...commonProps} />;
      case 2:
        return <AudioFileStep {...commonProps} />;
      case 3:
        return (
          <CreditsStep
            {...commonProps}
            writers={writers}
            setWriters={setWriters}
            composers={composers}
            setComposers={setComposers}
            usedArtists={usedArtists}
            fieldRules={fieldRules}
            onEditTrack={openTrackModal}
          />
        );
      case 4:
        return <CoverArtStep {...commonProps} fieldRules={fieldRules} />;
      case 5:
        return (
          <ReviewStep
            formData={formData}
            mandatoryChecks={mandatoryChecks}
            setMandatoryChecks={handleMandatoryChecksChange}
            showMandatoryCheckErrors={showMandatoryCheckErrors}
            legalConfirmationsLocked={legalConfirmationsLocked}
          />
        );
      default:
        return null;
    }
  };

  // Check for Plan Restrictions
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(true);
  const [canUpload, setCanUpload] = useState(true);
  const [planInfo, setPlanInfo] = useState<{
    key: string;
    title: string;
    allowConcurrent: boolean;
  } | null>(null);

  useEffect(() => {
    const checkEligibility = async () => {
      if (!user) return;

      if (isEditMode) {
        setCanUpload(true);
        setIsCheckingEligibility(false);
        return;
      }

      const planKey = (user?.plan as string) || "free";

      try {
        const limits = await getPlanLimits(planKey);
        const plan = await getPlanByKey(planKey);

        const planTitle =
          plan?.title ||
          planKey.charAt(0).toUpperCase() + planKey.slice(1).replace("_", " ");

        setPlanInfo({
          key: planKey,
          title: planTitle,
          allowConcurrent: limits.allowConcurrent,
        });

        // If plan allows concurrent uploads, we don't block based on 'In Process' status
        if (limits.allowConcurrent) {
          setCanUpload(true);
        } else {
          // For plans that don't allow concurrent (e.g. Free)
          try {
            // Check for 'In Process' releases
            const response = await getReleases({ status: "In Process" });

            if (response && response.releases && response.releases.length > 0) {
              setCanUpload(false);
            } else {
              setCanUpload(true);
            }
          } catch (error) {
            console.error("Failed to check release eligibility", error);
            setCanUpload(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch plan limits:", error);
        // Default to allowing upload if plan fetch fails
        setCanUpload(true);
      }

      setIsCheckingEligibility(false);
    };

    checkEligibility();
  }, [user, isEditMode]);

  if (loading || !user || isLoadingEdit) {
    return <PageLoading />;
  }

  if (!isEditMode && isCheckingEligibility) {
    return <PageLoading />;
  }

  if (!isEditMode && !canUpload) {
    return (
        <div className="max-w-2xl mx-auto mt-20 text-center space-y-6">
          <div className="bg-yellow-500/10 p-6 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
            <Info className="h-10 w-10 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold">Release Limit Reached</h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            You are on the <strong>{planInfo?.title || "Free Plan"}</strong>,
            which allows only one active release at a time. You currently have a
            release that is <strong>In Process</strong>.
          </p>
          <p className="text-sm text-muted-foreground">
            Please wait for your current release to be distributed or rejected
            before uploading deeper.
          </p>

          <div className="pt-6 flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/releases")}
            >
              View My Releases
            </Button>
            <Button onClick={() => (window.location.href = "/pricing")}>
              Upgrade to Premium
            </Button>
          </div>
        </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background p-4 lg:p-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 max-w-4xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <span className="animated-gradient">{isEditMode ? "Edit" : "Upload"}</span>{" "}
                {isEditMode ? "In Process Release" : "New Release"}
              </h1>
              <p className="text-muted-foreground">
                {isEditMode
                  ? "Update release details while processing is in progress"
                  : "Follow the steps to upload and distribute your music"}
              </p>
            </div>
            {isEditMode && (
              <Button
                type="button"
                variant="outline"
                onClick={requestCancelEdit}
                disabled={isSubmitting}
                className="shrink-0 rounded-xl"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Releases
              </Button>
            )}
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            variants={itemVariants}
            className="z-[30] -mx-4 lg:-mx-6 px-4 lg:px-6 py-4 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between gap-2">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = step.id === currentStep;
                  const isCompleted = step.id < currentStep;

                  return (
                    <div key={step.id} className="flex-1 flex items-center last:flex-none">
                      <div className="flex flex-col items-center relative min-w-[60px]">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                            ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/25"
                            : isCompleted
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                            }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className={`text-md mt-2 text-center font-semibold transition-colors duration-300 hidden md:block ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                          {step.name}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div className="flex-1 h-0.5 bg-muted self-start mt-5 relative overflow-hidden mx-1 md:mx-2 rounded-full">
                          <motion.div
                            initial={false}
                            animate={{ width: isCompleted ? "100%" : "0%" }}
                            className="absolute inset-0 bg-primary"
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Form Context & Native Form Wrapper */}
          <FormProvider {...form}>
            <form
              onSubmit={(e) => {
                if (currentStep < 5) {
                  e.preventDefault();
                  handleNext();
                } else {
                  form.handleSubmit(onSubmit, onInvalid)(e);
                }
              }}
              className={`space-y-6 ${isSubmitting ? "pointer-events-none select-none" : ""}`}
              aria-busy={isSubmitting}
            >
              {/* Step Content */}
              <motion.div variants={itemVariants}>
                <Card className="glass-card bg-neutral-900 hover:bg-neutral-900">
                  <CardContent className="pt-6">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {renderStepContent()}
                    </motion.div>
                  </CardContent>
                </Card>

                {currentStep === 3 && (
                  <Card className="mt-4 border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="pt-3">
                      {/* Copyright - always show if allowed */}
                      {fieldRules.copyright?.allow !== false && (
                        <div className="space-y-1">
                          <Label htmlFor="copyright">
                            C-Line ©{fieldRules.copyright?.required && " *"}
                          </Label>
                          <Input
                            id="copyright"
                            placeholder="© Your label name"
                            readOnly={user?.plan === "free"}
                            {...register("copyright")}
                          />
                          {user?.plan === "free" && (
                            <p className="text-xs text-amber-600 mt-1">
                              Purchase a paid plan to customize Copyright.
                            </p>
                          )}
                          {errors.copyright && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors.copyright.message}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Recording Year - between C-Line and P-Line */}
                      <div className="space-y-1 mt-4">
                        <Label htmlFor="recordingYear">
                          Recording Year <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id="recordingYear"
                          type="number"
                          placeholder="e.g. 2026"
                          min={1909}
                          max={new Date().getFullYear() + 1}
                          {...register("recordingYear", { valueAsNumber: true })}
                          className={errors.recordingYear ? "border-red-500" : ""}
                        />
                        {errors.recordingYear && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.recordingYear.message}
                          </p>
                        )}
                      </div>

                      {/* Producers - always show if allowed */}
                      {fieldRules.producers?.allow !== false && (
                        <div className="space-y-2 mt-4">
                          <Label htmlFor="producers">
                            P-Line ℗{fieldRules.producers?.required && " *"}
                          </Label>
                          <Input
                            id="producers"
                            placeholder="℗ Your label Name"
                            readOnly={user?.plan === "free"}
                            {...register("producers.0")}
                          />
                          {user?.plan === "free" && (
                            <p className="text-xs text-amber-600 mt-1">
                              Purchase a paid plan to customize Producers.
                            </p>
                          )}
                          {errors.producers && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors.producers.message ||
                                (Array.isArray(errors.producers) &&
                                  errors.producers[0]?.message)}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </motion.div>

              {/* Navigation Buttons */}
              <motion.div
                variants={itemVariants}
                className=" z-[30] -mx-4 lg:-mx-6 px-4 lg:px-6 py-5 bg-background/80 backdrop-blur-xl border-t border-border/50 flex items-center justify-between mt-10 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]"
              >
                <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isEditMode && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={requestCancelEdit}
                        disabled={isSubmitting}
                        className="rounded-xl px-4 text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep === 1 || isSubmitting}
                      className="rounded-xl px-6"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    {currentStep < 5 ? (
                      <Button type="submit" disabled={isProcessing || isSubmitting} className="rounded-xl px-8 animated-gradient-bg text-white">
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing…
                          </>
                        ) : (
                          <>
                            Next
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isProcessing || isSubmitting} className="rounded-xl px-8 animated-gradient-bg text-white">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {isEditMode ? "Saving…" : "Submitting…"}
                          </>
                        ) : (
                          isEditMode ? "Save Changes" : "Submit for Review"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </form>
          </FormProvider>
        </motion.div>
      </div>
      <Dialog open={showCancelEditDialog} onOpenChange={setShowCancelEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. If you leave now, your edits will not be saved and the
              release will stay as it was.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCancelEditDialog(false)}
            >
              Keep Editing
            </Button>
            <Button type="button" variant="destructive" onClick={confirmCancelEdit}>
              Discard &amp; Go Back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TrackEditModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        track={
          editingTrackIndex !== null && form.getValues("tracks")
            ? form.getValues("tracks")[editingTrackIndex]
            : null
        }
        trackIndex={editingTrackIndex}
        onSave={saveTrackModal}
        usedArtists={usedArtists}
        allTracks={form.getValues("tracks") || []}
        mainArtistName={watch("artistName")}
        featuringArtists={watch("artists")}
        mainArtistProfiles={{
          spotify: watch("spotifyProfile") ?? undefined,
          apple: watch("appleMusicProfile") ?? undefined,
          instagram: (watch("instagramProfile") === 'yes' ? watch("instagramProfileUrl") : watch("instagramProfile")) ?? undefined,
          facebook: (watch("facebookProfile") === 'yes' ? watch("facebookProfileUrl") : watch("facebookProfile")) ?? undefined
        }}
        fieldRules={fieldRules}
        audioFiles={watch("audioFiles")}
      />

      {isSubmitting && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/85 backdrop-blur-sm"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="submit-loading-title"
          aria-describedby="submit-loading-desc"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p id="submit-loading-title" className="mt-5 text-lg font-semibold">
            Submitting your release…
          </p>
          <p id="submit-loading-desc" className="mt-2 text-sm text-muted-foreground">
            Uploading assets and sending to stores. Please do not close this page.
          </p>
        </div>
      )}
    </>
  );
}
