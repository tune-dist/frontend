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
import { submitNewRelease } from "@/lib/api/releases";
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
      explicitLyrics: "no",
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
      case 1: // Basic Info
        isValid = await form.trigger([
          "title",
          "artistName",
          "language",
          "format",
        ]);
        break;
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
          // Also validate songwriters and composers since they are required fields in the form
          isValid = await form.trigger([
            "primaryGenre",
            "secondaryGenre",
            "previouslyReleased",
            "songwriters",
            "composers",
          ]);
        } else {
          // For Albums/EPs, no required fields in Credits step currently
          isValid = true;
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

      // Prepare songwriters for API (legacy logic)
      const allWriters = [...songwriters, ...composers]
        .filter((s) => s.firstName || s.lastName)
        .map((s) => `${s.firstName} ${s.middleName || ""} ${s.lastName}`.trim())
        .filter(Boolean);

      // API Call
      await submitNewRelease({
        ...data,
        writers: allWriters.length > 0 ? allWriters : undefined,
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

  // Check for Free Plan Restrictions
  const { user } = useAuth();
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(true);
  const [canUpload, setCanUpload] = useState(true);

  useEffect(() => {
    const checkEligibility = async () => {
      if (!user) return;

      if (user.plan === "free") {
        try {
          // Check for 'In Process' releases
          // We fetch releases with status 'In Process'
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
          // Default to allowing upload if check fails
          setCanUpload(true);
        }
      } else {
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
            You are on the <strong>Free Plan</strong>, which allows only one
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
                  {/* Copyright - always show */}
                  <div className="space-y-1 ">
                    <Label htmlFor="copyright">Copyright</Label>
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
                  </div>

                  {/* Producers */}
                  <div className="space-y-2">
                    <Label htmlFor="producers">Producers</Label>
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
                  </div>
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
