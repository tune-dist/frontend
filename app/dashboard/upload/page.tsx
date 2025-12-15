"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
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
} from "lucide-react";

// React Hook Form & Zod
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UploadFormData,
  uploadFormSchema,
  Songwriter,
  MandatoryChecks,
} from "@/components/dashboard/upload/types";

// Child Components
import BasicInfoStep from "@/components/dashboard/upload/basic-info-step";
import AudioFileStep from "@/components/dashboard/upload/audio-file-step";
import CoverArtStep from "@/components/dashboard/upload/cover-art-step";
import CreditsStep from "@/components/dashboard/upload/credits-step";
import ReviewStep from "@/components/dashboard/upload/review-step";
import { submitNewRelease, getArtistUsage } from "@/lib/api/releases";
import { getPlanLimits, getPlanByKey, getPlanFieldRules } from "@/lib/api/plans";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  { id: 3, name: "Cover Art", icon: ImageIcon },
  { id: 4, name: "Credits", icon: Users },
  { id: 5, name: "Review", icon: CheckCircle },
];

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  // Initialize Form

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      numberOfSongs: "1",
      title: "",
      artistName: "",
      version: "",
      previouslyReleased: "no",
      primaryGenre: "",
      secondaryGenre: "",
      language: "",
      releaseType: "single",
      isrc: "",
      isExplicit: false,
      explicitLyrics: "" as any,
      format: "" as any, // Will trigger validation
      tracks: [],
      spotifyProfile: "",
      appleMusicProfile: "",
      youtubeMusicProfile: "",
      instagramProfile: "no",
      facebookProfile: "no",
      dolbyAtmos: "no",
      instrumental: "no",
      songwriters: [
        {
          role: "Music and lyrics",
          firstName: "",
          middleName: "",
          lastName: "",
        },
      ],
      composers: [
        { role: "Composer", firstName: "", middleName: "", lastName: "" },
      ],
      copyright: process.env.NEXT_PUBLIC_DEFAULT_LABEL || "TuneFlow",
      producers: [process.env.NEXT_PUBLIC_DEFAULT_LABEL || "TuneFlow"],
    },
    mode: "onChange",
  });

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  // Separate state for internal component logic (Credits step songwriters list etc)
  // These could be moved into the form too, but for UI lists that map to a final field, local state is sometimes easier until submit.
  // HOWEVER, preventing state loss on nav requires them to be lifted or in form.
  // For now we keep them here as in original, but we should sync them to form on submit or change.
  // Ideally we refactor CreditsStep to useFieldArray. For now, let's keep passing them.
  const [songwriters, setSongwriters] = useState<Songwriter[]>([
    {
      role: "Music and lyrics",
      firstName: "",
      middleName: "",
      lastName: "",
    },
  ]);

  const [composers, setComposers] = useState<Songwriter[]>([
    {
      role: "Composer",
      firstName: "",
      middleName: "",
      lastName: "",
    },
  ]);

  const [mandatoryChecks, setMandatoryChecks] = useState<MandatoryChecks>({
    youtubeConfirmation: false,
    capitalizationConfirmation: false,
    promoServices: false,
    rightsAuthorization: false,
    nameUsage: false,
    termsAgreement: false,
  });

  const [usedArtists, setUsedArtists] = useState<string[]>([]);
  const [fieldRules, setFieldRules] = useState<Record<string, any>>({});

  // Fetch used artists and field rules on mount
  useEffect(() => {
    if (user) {
      // Fetch artists
      getArtistUsage()
        .then((data) => setUsedArtists(data.artists))
        .catch((err) => console.error("Failed to fetch artist usage", err));

      // Fetch field rules
      const planKey = (user.plan as string) || 'free';
      getPlanFieldRules(planKey, true)
        .then((rules) => setFieldRules(rules))
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

  const handleNext = async () => {
    let isValid = false;

    // Step-based validation
    switch (currentStep) {
      case 1: { // Basic Info
        // Fetch plan data first to know what fields are required
        const planKey = (user?.plan as string) || 'free';
        const [limits, fieldRules] = await Promise.all([
          getPlanLimits(planKey, true),
          getPlanFieldRules(planKey, true)
        ]);

        // Build validation fields array based on plan
        const fieldsToValidate = [
          "title",
          "artistName",
          "language",
          "format",
        ];

        // Add featuredArtist to validation if required by plan
        if (fieldRules.featuredArtists?.required) {
          fieldsToValidate.push("featuringArtist");
        }

        isValid = await form.trigger(fieldsToValidate as any);

        // Manually check featuredArtist if required by plan
        // form.trigger doesn't pick up dynamic validation because the Zod schema defines it as optional
        if (fieldRules.featuredArtists?.required && !formData.featuringArtist?.trim()) {
          form.setError("featuringArtist", {
            type: "required",
            message: "Featuring artist is required",
          }, { shouldFocus: true });
          isValid = false;
        }

        // Check explicit lyrics validation using 'isExplicit' rule from API
        if (!formData.explicitLyrics || formData.explicitLyrics === '') {
          form.setError("explicitLyrics", {
            type: "required",
            message: "Explicit lyrics is required",
          }, { shouldFocus: true });
          isValid = false;
        }

        if (isValid) {
          // Check Artist Limits
          if (limits.artistLimit < Infinity) {
            const currentArtists = [formData.artistName, ...(formData.artists || []).map((a: any) => a.name)].filter(Boolean);

            // Count how many NEW artists are being introduced
            let newArtistsCount = 0;
            const uniqueCurrentArtists = new Set(currentArtists);

            for (const artist of Array.from(uniqueCurrentArtists)) {
              // Normalize check (case insensitive or exact? backend uses distinct so exact usually, but let's assume exact for now)
              if (!usedArtists.includes(artist as string)) {
                newArtistsCount++;
              }
            }

            // Total unique artists user WILL have after this release
            // = (already used artists count) + (newly unique artists in this release)
            // Actually simple check: Used + New <= Limit
            const totalUsedCount = usedArtists.length;

            if ((totalUsedCount + newArtistsCount) > limits.artistLimit) {
              toast.error(`You have reached your artist limit (${limits.artistLimit}) for the ${planKey === 'creator_plus' ? 'Creator+' : planKey} plan.`);
              isValid = false;
            }
          }
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
          } else {
            form.clearErrors("audioFile");
            isValid = true;
          }
        } else {
          // EP/Album
          if (formData.tracks.length === 0) {
            toast.error("Please add at least one track");
            isValid = false;
          } else {
            isValid = true;
          }
        }
        break;
      case 3: // Cover Art
        if (!formData.coverArt) {
          form.setError("coverArt", {
            type: "required",
            message: "Cover art is required",
          });
          isValid = false;
        } else {
          isValid = true;
        }
        break;
      case 4: // Credits
        // Validate required fields in Credits step
        if (formData.format === "single") {
          // For singles, validate genre and previously released
          // Also validate songwriters and composers based on fieldRules
          const fieldsToValidate = [
            "primaryGenre",
            "secondaryGenre",
            "previouslyReleased",
          ];

          // Conditional validation based on fieldRules
          // Check songwriters (writers)
          const writersAllowed = fieldRules.songwriters?.allow !== false;
          const writersRequired = fieldRules.songwriters?.required !== false;
          if (writersAllowed) {
            // If required, we should convert to required array check via zod manually or check length
            if (writersRequired && (!formData.songwriters || formData.songwriters.length === 0)) {
              toast.error("At least one songwriter is required");
              isValid = false;
              break; // Stop here
            }
            // If present, validate content via trigger if needed, or rely on form submit
            fieldsToValidate.push("songwriters");
          }

          // Check composers
          const composersAllowed = fieldRules.composers?.allow !== false;
          const composersRequired = fieldRules.composers?.required !== false;
          if (composersAllowed) {
            if (composersRequired && (!formData.composers || formData.composers.length === 0)) {
              toast.error("At least one composer is required");
              isValid = false;
              break;
            }
            fieldsToValidate.push("composers");
          }

          // Check producers
          const producersAllowed = fieldRules.producers?.allow !== false;
          const producersRequired = fieldRules.producers?.required !== false;
          if (producersAllowed) {
            if (producersRequired && (!formData.producers || formData.producers.length === 0)) {
              form.setError("producers", { type: "required", message: "At least one producer is required" });
              isValid = false;
              break;
            }
            fieldsToValidate.push("producers");
          }

          // Check copyright
          const copyrightAllowed = fieldRules.copyright?.allow !== false;
          const copyrightRequired = fieldRules.copyright?.required === true;
          if (copyrightAllowed) {
            if (copyrightRequired && !formData.copyright) {
              form.setError("copyright", { type: "required", message: "Copyright is required" });
              isValid = false;
              break;
            }
          }

          isValid = await form.trigger(fieldsToValidate as any);
        } else {
          // For Albums/EPs, validate all tracks have required metadata
          if (formData.tracks.length === 0) {
            toast.error("Please add at least one track");
            isValid = false;
          } else {
            // Check each track for required fields
            const nameRegex = /^[a-zA-Z]{3,} [a-zA-Z]{3,}$/;
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

              // Check songwriters
              if (!track.songwriters || track.songwriters.length === 0) {
                toast.error(`Track ${i + 1}: At least one songwriter is required`);
                hasError = true;
                break;
              }

              for (const sw of track.songwriters) {
                if (!sw.firstName?.trim()) {
                  toast.error(`Track ${i + 1}: Songwriter name cannot be empty`);
                  hasError = true;
                  break;
                }
                if (!nameRegex.test(sw.firstName.trim())) {
                  toast.error(`Track ${i + 1}: Invalid songwriter name "${sw.firstName}". Must be "Firstname Lastname"`);
                  hasError = true;
                  break;
                }
              }

              if (hasError) break;

              // Validate composers if provided
              if (track.composers) {
                for (const comp of track.composers) {
                  if (comp.firstName?.trim() && !nameRegex.test(comp.firstName.trim())) {
                    toast.error(`Track ${i + 1}: Invalid composer name "${comp.firstName}". Must be "Firstname Lastname"`);
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
          const planKey = (user?.plan as string) || 'free';
          const limits = await getPlanLimits(planKey);

          if (limits.artistLimit < Infinity) {
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
              if (!usedArtists.includes(artist)) {
                newArtistsCount++;
              }
            }

            // Check if exceeds limit
            const totalUsedCount = usedArtists.length;
            if ((totalUsedCount + newArtistsCount) > limits.artistLimit) {
              const planName = planKey === 'creator_plus' ? 'Creator+' : planKey.charAt(0).toUpperCase() + planKey.slice(1);
              toast.error(`You have reached your artist limit (${limits.artistLimit}) for the ${planName} plan.`);
              isValid = false;
            }
          }
        }
        break;
      case 5: // Review
        isValid = true;
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast.error("Please fix the errors before proceeding");
      console.log(form.formState.errors);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: UploadFormData) => {
    // Final validations
    if (
      !mandatoryChecks.promoServices ||
      !mandatoryChecks.rightsAuthorization ||
      !mandatoryChecks.nameUsage ||
      !mandatoryChecks.termsAgreement
    ) {
      toast.error("Please agree to all mandatory checkboxes");
      return;
    }

    // Check capitalization checks if needed (logic from original)
    const hasIrregularCapitalization = (text: string) => {
      if (!text) return false;
      return (
        /[a-z][A-Z]/.test(text) ||
        (text === text.toUpperCase() && text.length > 3)
      );
    };
    const needsCapitalizationCheck =
      hasIrregularCapitalization(data.title) ||
      hasIrregularCapitalization(data.artistName);

    if (
      needsCapitalizationCheck &&
      !mandatoryChecks.capitalizationConfirmation
    ) {
      toast.error("Please confirm the non-standard capitalization");
      return;
    }

    try {
      toast.loading("Submitting release...");

      // Prepare songwriters for API
      // Use data.songwriters from react-hook-form state
      const writers = (data.songwriters || [])
        .filter((s) => s.firstName || s.lastName)
        .map((s) => `${s.firstName} ${s.middleName || ""} ${s.lastName}`.trim())
        .filter(Boolean);

      // Prepare composers for API
      // Use data.composers from react-hook-form state
      const composersList = (data.composers || [])
        .filter((s) => s.firstName || s.lastName)
        .map((s) => `${s.firstName} ${s.middleName || ""} ${s.lastName}`.trim())
        .filter(Boolean);

      // API Call
      await submitNewRelease({
        ...data,
        writers: writers.length > 0 ? writers : [],
        composers: composersList.length > 0 ? composersList : [],
        producers: data.producers && data.producers.length > 0 ? data.producers : [],
        // Ensure types match API expectations
      } as any);

      toast.dismiss();
      toast.success("Release submitted successfully!");
      router.push("/dashboard/releases");
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to submit release");
    }
  };

  const onInvalid = (errors: any) => {
    console.error("Form validation errors:", errors);
    toast.error("Please fix the errors before submitting");
    // If we are on the review step (last step), finding an error means something was missed in previous steps
    // We can try to navigate the user to the first step with an error, or just show the toast.
    // Showing toast is safer for now.
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
        return <CoverArtStep {...commonProps} />;
      case 4:
        return (
          <CreditsStep
            {...commonProps}
            songwriters={songwriters}
            setSongwriters={setSongwriters}
            composers={composers}
            setComposers={setComposers}
            usedArtists={usedArtists}
            fieldRules={fieldRules}
          />
        );
      case 5:
        return (
          <ReviewStep
            formData={formData}
            mandatoryChecks={mandatoryChecks}
            setMandatoryChecks={setMandatoryChecks}
          />
        );
      default:
        return null;
    }
  };

  // Check for Plan Restrictions
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(true);
  const [canUpload, setCanUpload] = useState(true);
  const [planInfo, setPlanInfo] = useState<{ key: string; title: string; allowConcurrent: boolean } | null>(null);

  useEffect(() => {
    const checkEligibility = async () => {
      if (!user) return;

      const planKey = (user?.plan as string) || 'free';

      try {
        const limits = await getPlanLimits(planKey);
        const plan = await getPlanByKey(planKey);

        const planTitle = plan?.title || planKey.charAt(0).toUpperCase() + planKey.slice(1).replace('_', ' ');

        // Debug logging
        console.log('Plan eligibility check:', {
          planKey,
          planTitle,
          allowConcurrent: limits.allowConcurrent,
          limits,
          planFromDB: plan?.limits
        });

        setPlanInfo({
          key: planKey,
          title: planTitle,
          allowConcurrent: limits.allowConcurrent,
        });

        // If plan allows concurrent uploads, we don't block based on 'In Process' status
        if (limits.allowConcurrent) {
          console.log('Plan allows concurrent uploads, allowing access');
          setCanUpload(true);
        } else {
          console.log('Plan does not allow concurrent uploads, checking for In Process releases');
          // For plans that don't allow concurrent (e.g. Free)
          try {
            // Check for 'In Process' releases
            const response = await import("@/lib/api/releases").then((m) =>
              m.getReleases({ status: "In Process" })
            );

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
  }, [user]);

  if (isCheckingEligibility) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!canUpload) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-20 text-center space-y-6">
          <div className="bg-yellow-500/10 p-6 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
            <Info className="h-10 w-10 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold">Release Limit Reached</h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            You are on the <strong>{planInfo?.title || 'Free Plan'}</strong>, which allows only one
            active release at a time. You currently have a release that is{" "}
            <strong>In Process</strong>.
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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold mb-2">
            <span className="animated-gradient">Upload</span> New Release
          </h1>
          <p className="text-muted-foreground">
            Follow the steps to upload and distribute your music
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = step.id === currentStep;
                  const isCompleted = step.id < currentStep;

                  return (
                    <div key={step.id} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${isActive
                            ? "bg-primary text-primary-foreground"
                            : isCompleted
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                            }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs mt-2 text-center max-w-[80px]">
                          {step.name}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`h-0.5 w-12 mx-2 ${isCompleted ? "bg-primary" : "bg-muted"
                            }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Step Content */}
        <FormProvider {...form}>
          <motion.div variants={itemVariants}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">{renderStepContent()}</CardContent>
            </Card>
            {currentStep == 4 && (
              <Card className="mt-4 border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-3">
                  {/* Copyright - always show if allowed */}
                  {fieldRules.copyright?.allow !== false && (
                    <div className="space-y-1 ">
                      <Label htmlFor="copyright">Copyright{fieldRules.copyright?.required && ' *'}</Label>
                      <Input
                        id="copyright"
                        placeholder="© Your label Name"
                        readOnly={user?.plan === 'free'}
                        {...register("copyright", {
                          onChange: (e) => {
                            const defaultValue = process.env.NEXT_PUBLIC_DEFAULT_LABEL || "TuneFlow";
                            if (user?.plan === 'free' && e.target.value !== defaultValue) {
                              toast.error("Upgrade to paid plan to customize copyright", { id: "copyright-warning" });
                            }
                          }
                        })}
                      />
                      {user?.plan === 'free' && (
                        <p className="text-xs text-amber-600 mt-1">
                          Purchase a paid plan to customize Copyright.
                        </p>
                      )}
                      {errors.copyright && <p className="text-xs text-red-500 mt-1">{errors.copyright.message}</p>}
                    </div>
                  )}

                  {/* Producers - always show if allowed */}
                  {fieldRules.producers?.allow !== false && (
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="producers">Producers{fieldRules.producers?.required && ' *'}</Label>
                      <Input
                        id="producers"
                        placeholder="℗ Your label Name"
                        readOnly={user?.plan === 'free'}
                        {...register("producers.0", {
                          onChange: (e) => {
                            const defaultValue = process.env.NEXT_PUBLIC_DEFAULT_LABEL || "TuneFlow";
                            if (user?.plan === 'free' && e.target.value !== defaultValue) {
                              toast.error("Upgrade to paid plan to customize producers", { id: "producers-warning" });
                            }
                          }
                        })}
                      />
                      {user?.plan === 'free' && (
                        <p className="text-xs text-amber-600 mt-1">
                          Purchase a paid plan to customize Producers.
                        </p>
                      )}
                      {errors.producers && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.producers.message || (Array.isArray(errors.producers) && errors.producers[0]?.message)}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </FormProvider>

        {/* Navigation Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {/* <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Save as Draft
              </Button> */}

            {currentStep < steps.length ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={form.handleSubmit(onSubmit, onInvalid)}>
                Submit for Review
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
