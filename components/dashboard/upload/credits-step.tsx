"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadFormData, Songwriter, Track } from "./types";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import { Music, Pencil, Trash2, Info } from "lucide-react";
import {
  getGenres,
  getSubGenresByGenreId,
  type Genre,
  type SubGenre,
} from "@/lib/api/genres";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import WaveformTrimmer from "./WaveformTrimmer";
import { isTrackEligibleForCrbt } from "./crbt-validation";
import { LEGAL_PERSON_NAME_HINT } from "@/lib/validation/legal-person-name";
import { useResolvedCrbtPlayback } from "@/lib/upload/audio-playback";
import {
  INSTRUMENTAL_LANGUAGE,
  filterGenresForInstrumentalChoice,
  isInstrumentalPrimaryGenre,
  isInstrumentalRelease,
  isInstrumentalSelection,
  LANGUAGE_OPTIONS,
  resolveInstrumentalPrimaryGenre,
} from "./genre-language";

const LanguageSelect = memo(function LanguageSelect({
  control,
  isNoLyricsTrack,
  hasError,
}: {
  control: ReturnType<typeof useFormContext<UploadFormData>>["control"];
  isNoLyricsTrack: boolean;
  hasError: boolean;
}) {
  const { setValue, clearErrors } = useFormContext<UploadFormData>();
  const languageOptions = isNoLyricsTrack
    ? [INSTRUMENTAL_LANGUAGE]
    : LANGUAGE_OPTIONS.filter((lang) => lang !== INSTRUMENTAL_LANGUAGE);

  useEffect(() => {
    if (!isNoLyricsTrack) return;
    setValue("language", INSTRUMENTAL_LANGUAGE, { shouldValidate: true });
    clearErrors("language");
  }, [isNoLyricsTrack, setValue, clearErrors]);

  return (
    <Controller
      name="language"
      control={control}
      render={({ field }) => (
        <select
          id="language"
          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${hasError ? "border-red-500" : ""
            } ${isNoLyricsTrack ? "opacity-80 cursor-not-allowed" : ""}`}
          disabled={isNoLyricsTrack}
          value={isNoLyricsTrack ? INSTRUMENTAL_LANGUAGE : (field.value ?? "")}
          onChange={(e) => {
            if (!isNoLyricsTrack) {
              field.onChange(e.target.value);
            }
          }}
          onBlur={field.onBlur}
          name={field.name}
          ref={field.ref}
        >
          {!isNoLyricsTrack && <option value="">Select a language</option>}
          {languageOptions.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      )}
    />
  );
});

/** Controlled select — keeps form values visible after step remount + async option load */
const PrimaryGenreSelect = memo(function PrimaryGenreSelect({
  control,
  genres,
  genresLoading,
  hasError,
  onGenreChange,
}: {
  control: ReturnType<typeof useFormContext<UploadFormData>>["control"];
  genres: Genre[];
  genresLoading: boolean;
  hasError: boolean;
  onGenreChange: () => void;
}) {
  return (
    <Controller
      name="primaryGenre"
      control={control}
      render={({ field }) => {
        const savedValue = field.value ?? "";
        const hasSavedOption =
          !savedValue || genres.some((genre) => genre.name === savedValue);

        return (
          <select
            id="primaryGenre"
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${hasError ? "border-red-500" : ""
              }`}
            value={savedValue}
            onChange={(e) => {
              field.onChange(e.target.value);
              onGenreChange();
            }}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
          >
            <option value="">Select a genre</option>
            {genresLoading ? (
              <option disabled>Loading genres...</option>
            ) : (
              <>
                {!hasSavedOption && savedValue && (
                  <option value={savedValue}>{savedValue}</option>
                )}
                {genres.map((genre) => (
                  <option key={genre._id} value={genre.name}>
                    {genre.name}
                  </option>
                ))}
              </>
            )}
          </select>
        );
      }}
    />
  );
});

const SecondaryGenreSelect = memo(function SecondaryGenreSelect({
  control,
  primaryGenre,
  subGenres,
  subGenresLoading,
  hasError,
}: {
  control: ReturnType<typeof useFormContext<UploadFormData>>["control"];
  primaryGenre: string;
  subGenres: SubGenre[];
  subGenresLoading: boolean;
  hasError: boolean;
}) {
  return (
    <Controller
      name="secondaryGenre"
      control={control}
      render={({ field }) => {
        const savedValue = field.value ?? "";
        const hasSavedOption =
          !savedValue || subGenres.some((subGenre) => subGenre.name === savedValue);

        return (
          <select
            id="secondaryGenre"
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${hasError ? "border-red-500" : ""
              }`}
            value={savedValue}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
            disabled={
              !primaryGenre ||
              (subGenresLoading && subGenres.length === 0 && !savedValue)
            }
          >
            <option value="">
              {!primaryGenre
                ? "Select a genre first"
                : subGenresLoading && subGenres.length === 0 && !savedValue
                  ? "Loading sub-genres..."
                  : "Select a sub-genre"}
            </option>
            {!hasSavedOption && savedValue && (
              <option value={savedValue}>{savedValue}</option>
            )}
            {subGenres.map((subGenre) => (
              <option key={subGenre._id} value={subGenre.name}>
                {subGenre.name}
              </option>
            ))}
          </select>
        );
      }}
    />
  );
});

interface CreditsStepProps {
  formData?: UploadFormData;
  setFormData?: (data: UploadFormData) => void;
  writers?: string[];
  setWriters?: (data: string[]) => void;
  composers?: string[];
  setComposers?: (data: string[]) => void;
  usedArtists?: string[];
  fieldRules?: Record<string, any>;
  onEditTrack?: (index: number) => void;
}

export default function CreditsStep({
  formData: propFormData,
  setFormData: propSetFormData,
  writers: propWriters,
  setWriters: propSetWriters,
  composers: propComposers,
  setComposers: propSetComposers,
  usedArtists,
  fieldRules = {},
  onEditTrack,
}: CreditsStepProps) {
  const {
    register,
    control,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<UploadFormData>();

  const format = watch("format");
  const tracks = watch("tracks") || [];
  const audioFiles = watch("audioFiles") || [];
  const audioFileData = watch("audioFile");
  const previewClipStartTime = watch("previewClipStartTime");
  const {
    hasAudio: hasCrbtAudio,
    playbackSource,
    isResolving: isResolvingCrbtAudio,
    resolveError: crbtAudioError,
    trackDurationSec,
  } = useResolvedCrbtPlayback(audioFileData, audioFiles, tracks);
  const isCrbtEligible = isTrackEligibleForCrbt(trackDurationSec);
  const handlePreviewClipChange = useCallback(
    (time: string) => {
      setValue("previewClipStartTime", time, { shouldValidate: true });
      if (format === "single" && tracks.length > 0) {
        const updatedTracks = tracks.map((track, index) =>
          index === 0 ? { ...track, previewClipStartTime: time } : track,
        );
        setValue("tracks", updatedTracks, { shouldValidate: true });
      }
    },
    [format, setValue, tracks],
  );
  const isSingle = format === "single";
  const areFeaturedArtistsAllowed = fieldRules.featuredArtists?.allow !== false;
  const instrumentalValue = watch("instrumental");

  // ISRC State — restore checkbox when returning to this step with a saved ISRC
  const isrcValue = watch("isrc");
  const [showIsrc, setShowIsrc] = useState(() => !!isrcValue);
  useEffect(() => {
    if (isrcValue) {
      setShowIsrc(true);
    }
  }, [isrcValue]);
  const { user } = useAuth();

  useEffect(() => {
    if (!isCrbtEligible && previewClipStartTime) {
      setValue("previewClipStartTime", "", { shouldValidate: true });
      if (format === "single" && tracks.length > 0) {
        const updatedTracks = tracks.map((track, index) =>
          index === 0 ? { ...track, previewClipStartTime: "" } : track,
        );
        setValue("tracks", updatedTracks, { shouldValidate: true });
      }
    }
  }, [format, isCrbtEligible, previewClipStartTime, setValue, tracks]);

  // Genres state
  const [genres, setGenres] = useState<Genre[]>([]);
  // Update featuringArtist validation when fieldRules change
  useEffect(() => {
    if (Object.keys(fieldRules).length > 0) {
      register("featuringArtist", {
        required: fieldRules.featuredArtists?.required
          ? "Featuring artist is required"
          : false,
      });
    }
  }, [fieldRules, register]);
  const [genresLoading, setGenresLoading] = useState(true);

  // Fetch genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const fetchedGenres = await getGenres();
        setGenres(fetchedGenres);
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      } finally {
        setGenresLoading(false);
      }
    };
    fetchGenres();
  }, []);

  // Sub-genres state — cached by genre id to avoid reload flicker
  const [subGenres, setSubGenres] = useState<SubGenre[]>([]);
  const [subGenresLoading, setSubGenresLoading] = useState(false);
  const subGenreCacheRef = useRef<Map<string, SubGenre[]>>(new Map());
  const subGenreRequestRef = useRef(0);
  const primaryGenre = watch("primaryGenre");
  const isNoLyricsTrack = isInstrumentalRelease(primaryGenre, instrumentalValue);
  const availableGenres = useMemo(
    () => filterGenresForInstrumentalChoice(genres, instrumentalValue),
    [genres, instrumentalValue],
  );

  const loadSubGenres = useCallback(
    async (genreName: string) => {
      if (!genreName) {
        setSubGenres([]);
        return;
      }

      if (genresLoading) return;

      const selectedGenre = genres.find((g) => g.name === genreName);
      if (!selectedGenre) return;

      const cacheKey = selectedGenre._id;
      const cached = subGenreCacheRef.current.get(cacheKey);
      if (cached) {
        setSubGenres(cached);
        return;
      }

      const requestId = ++subGenreRequestRef.current;
      setSubGenresLoading(true);
      try {
        const fetchedSubGenres = await getSubGenresByGenreId(selectedGenre._id);
        if (requestId !== subGenreRequestRef.current) return;

        subGenreCacheRef.current.set(cacheKey, fetchedSubGenres);
        setSubGenres(fetchedSubGenres);
      } catch (error) {
        if (requestId !== subGenreRequestRef.current) return;
        console.error("Failed to fetch sub-genres:", error);
        setSubGenres([]);
      } finally {
        if (requestId === subGenreRequestRef.current) {
          setSubGenresLoading(false);
        }
      }
    },
    [genres, genresLoading],
  );

  useEffect(() => {
    void loadSubGenres(primaryGenre ?? "");
  }, [primaryGenre, genresLoading, loadSubGenres]);

  const {
    fields: writerFields,
    append: appendWriter,
    remove: removeWriter,
  } = useFieldArray({
    control,
    name: "writers",
  });

  const {
    fields: composerFields,
    append: appendComposer,
    remove: removeComposer,
  } = useFieldArray({
    control,
    name: "composers",
  });

  const handleInstrumentalChange = useCallback(
    (value: "yes" | "no") => {
      setValue("instrumental", value, { shouldValidate: true });

      if (value === "yes") {
        setValue("language", INSTRUMENTAL_LANGUAGE, { shouldValidate: true });
        clearErrors("language");
        const instrumentalGenre = resolveInstrumentalPrimaryGenre(genres);
        if (instrumentalGenre) {
          setValue("primaryGenre", instrumentalGenre, { shouldValidate: true });
          setValue("secondaryGenre", "");
        } else if (primaryGenre && !isInstrumentalPrimaryGenre(primaryGenre)) {
          setValue("primaryGenre", "");
          setValue("secondaryGenre", "");
        }
        return;
      }

      const currentLanguage = watch("language");
      if (currentLanguage === INSTRUMENTAL_LANGUAGE) {
        setValue("language", "");
      }
      if (primaryGenre && isInstrumentalPrimaryGenre(primaryGenre)) {
        setValue("primaryGenre", "");
        setValue("secondaryGenre", "");
      }
    },
    [genres, primaryGenre, setValue, watch, clearErrors],
  );

  useEffect(() => {
    if (isInstrumentalPrimaryGenre(primaryGenre)) {
      setValue("instrumental", "yes");
      setValue("language", INSTRUMENTAL_LANGUAGE, { shouldValidate: true });
      clearErrors("language");
    }
  }, [primaryGenre, setValue, clearErrors]);

  useEffect(() => {
    if (isInstrumentalSelection(instrumentalValue)) {
      setValue("language", INSTRUMENTAL_LANGUAGE, { shouldValidate: true });
      clearErrors("language");
    }
  }, [instrumentalValue, setValue, clearErrors]);

  useEffect(() => {
    if (
      !isInstrumentalSelection(instrumentalValue) ||
      genresLoading ||
      genres.length === 0
    ) {
      return;
    }

    const instrumentalGenre = resolveInstrumentalPrimaryGenre(genres);
    if (!instrumentalGenre) return;

    if (!primaryGenre || !isInstrumentalPrimaryGenre(primaryGenre)) {
      setValue("primaryGenre", instrumentalGenre, { shouldValidate: true });
      setValue("secondaryGenre", "");
    }
  }, [instrumentalValue, genres, genresLoading, primaryGenre, setValue]);

  // No-lyrics track → clear lyric-related fields
  useEffect(() => {
    if (!isNoLyricsTrack) {
      return;
    }
    setValue("writers", []);
    setValue("isExplicit", false);
  }, [isNoLyricsTrack, setValue]);

  // Ensure at least one writer for singles (lyric tracks only)
  useEffect(() => {
    if (isSingle && !isNoLyricsTrack && writerFields.length === 0) {
      appendWriter("");
    }
  }, [isSingle, isNoLyricsTrack, writerFields.length, appendWriter]);

  // Ensure at least one composer for singles if none exist
  useEffect(() => {
    if (isSingle && composerFields.length === 0) {
      appendComposer("");
    }
  }, [isSingle, composerFields.length, appendComposer]);

  const addWriter = () => {
    appendWriter("");
  };

  const addComposer = () => {
    appendComposer("");
  };

  const handlePrimaryGenreChange = useCallback(() => {
    setValue("secondaryGenre", "", { shouldDirty: true });
  }, [setValue]);

  return (
    <>
      <div className="space-y-4">
        {errors.tracks?.message && (
          <p className="text-sm text-red-500 rounded-md border border-red-500/40 bg-red-500/5 px-3 py-2">
            {String(errors.tracks.message)}
          </p>
        )}

        <h3 className="text-xl font-semibold">Credits & Metadata</h3>
        <p className="text-muted-foreground">Give credit to everyone involved</p>

        {/* Track Price - Show for Albums/EPs */}
        {!isSingle && (
          <div className="space-y-3 pt-6 border-t border-border">
            <Label htmlFor="trackPrice" className="text-lg font-semibold">
              Track Price
            </Label>
            <p className="text-sm text-muted-foreground">
              iTunes and Amazon (USD)
            </p>
            <Controller
              name="trackPrice"
              control={control}
              render={({ field }) => (
                <select
                  id="trackPrice"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={field.value ?? "0.99"}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                >
                  <option value="0.69">$0.69</option>
                  <option value="0.99">$0.99</option>
                  <option value="1.29">$1.29</option>
                </select>
              )}
            />
            <p className="text-xs text-muted-foreground">
              Tracks over 10 minutes long will be priced higher.
            </p>
          </div>
        )}

        {/* Show track list for Album/EP with edit buttons */}
        {!isSingle && tracks.length > 0 && (
          <div className="space-y-3 mt-6">
            <Label className="text-lg font-semibold">Tracks</Label>
            <p className="text-sm text-muted-foreground">
              Click on a track to edit its metadata
            </p>
            {tracks.map((track, index) => {
              return (
                <div
                  key={track.id || index}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50"
                >
                  <Music className="h-8 w-8 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">
                      {index + 1}. {track.title || "Untitled Track"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {track.artistName || "No artist set"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditTrack?.(index)}
                      type="button"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Track
                    </Button>
                    {tracks.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const trackToRemove = tracks[index];
                          const updatedTracks = tracks.filter(
                            (_, i) => i !== index
                          );
                          const currentAudioFiles = watch("audioFiles") || [];
                          const updatedAudioFiles = currentAudioFiles.filter(
                            (af: any) => af.id !== trackToRemove.audioFileId
                          );

                          setValue("tracks", updatedTracks, {
                            shouldValidate: true,
                          });
                          setValue("audioFiles", updatedAudioFiles, {
                            shouldValidate: true,
                          });
                        }}
                        type="button"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-4 mt-6">
          {/* Show these fields only for Singles */}
          {isSingle && (
            <>
              {/* Instrumental — first so genre & language follow this choice */}
              <div className="space-y-3 pt-6 border-t border-border">
                <Label className="text-lg font-semibold">Is Instrumental?</Label>
                <p className="text-sm text-muted-foreground">
                  Choose first — genre and language options below will update based on your answer.
                </p>

                <Controller
                  name="instrumental"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="instrumentalNo"
                          value="no"
                          checked={field.value === "no"}
                          onChange={() => handleInstrumentalChange("no")}
                          onBlur={field.onBlur}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="instrumentalNo" className="font-normal cursor-pointer">
                          This song contains lyrics
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="instrumentalYes"
                          value="yes"
                          checked={field.value === "yes"}
                          onChange={() => handleInstrumentalChange("yes")}
                          onBlur={field.onBlur}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="instrumentalYes" className="font-normal cursor-pointer">
                          This song is instrumental and contains no lyrics
                        </Label>
                      </div>
                    </div>
                  )}
                />
              </div>

              {/* ISRC Logic for Single */}
              <div className="space-y-4 pt-6 border-t border-border">
                <div className="flex flex-col space-y-2">
                  <Label className="text-lg font-semibold">ISRC</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasIsrc"
                      checked={showIsrc}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setShowIsrc(checked);
                        if (checked) {
                          // Pre-fill with default from env if empty
                          if (!watch("isrc")) {
                            setValue(
                              "isrc",
                              process.env.NEXT_PUBLIC_DEFAULT_ISRC
                            );
                          }
                        } else {
                          setValue("isrc", "");
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label
                      htmlFor="hasIsrc"
                      className="font-normal cursor-pointer"
                    >
                      I already have an ISRC code
                    </Label>
                  </div>
                </div>

                {showIsrc && (
                  <div className="space-y-2">
                    <Label htmlFor="isrc">ISRC Code</Label>
                    <Input
                      id="isrc"
                      placeholder="XX-XXX-XX-XXXXX"
                      readOnly={user?.plan === "free"}
                      {...register("isrc", {
                        onChange: (e) => {
                          if (
                            user?.plan === "free"
                          ) {
                            toast.error(
                              "Upgrade to paid plan to use custom ISRC",
                              { id: "isrc-warning" }
                            );
                          }
                        },
                      })}
                      className={errors.isrc ? "border-red-500" : ""}
                    />
                    {user?.plan === "free" && (
                      <p className="text-xs text-amber-600 mt-1">
                        Upgrade to a paid plan to use a custom ISRC code.
                      </p>
                    )}
                    {errors.isrc && (
                      <p className="text-xs text-red-500 mt-1">
                        {String(errors.isrc.message)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Genres */}
              <div className="space-y-4 mt-6">
                <div className="space-y-3">
                  <Label htmlFor="primaryGenre" className="text-lg font-semibold">
                    Primary genre
                    {fieldRules.genres?.required === true && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  <PrimaryGenreSelect
                    control={control}
                    genres={availableGenres}
                    genresLoading={genresLoading}
                    hasError={!!errors.primaryGenre}
                    onGenreChange={handlePrimaryGenreChange}
                  />
                  {errors.primaryGenre && (
                    <p className="text-xs text-red-500 mt-1">
                      {String(errors.primaryGenre.message)}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="secondaryGenre"
                    className="text-lg font-semibold"
                  >
                    Sub-genre
                    {fieldRules.subGenre?.required === true && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  <SecondaryGenreSelect
                    control={control}
                    primaryGenre={primaryGenre ?? ""}
                    subGenres={subGenres}
                    subGenresLoading={subGenresLoading}
                    hasError={!!errors.secondaryGenre}
                  />
                  {errors.secondaryGenre && (
                    <p className="text-xs text-red-500 mt-1">
                      {String(errors.secondaryGenre.message)}
                    </p>
                  )}
                </div>
              </div>

              {/* Mood */}
              <div className="space-y-4 mt-6">
                <div className="space-y-3">
                  <Label htmlFor="mood" className="text-lg font-semibold">
                    Vibe<span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Controller
                    name="mood"
                    control={control}
                    render={({ field }) => (
                      <select
                        id="mood"
                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.mood ? "border-red-500" : ""
                          }`}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      >
                        <option value="">Select a mood</option>
                        <option value="Romantic">Romantic</option>
                        <option value="Happy">Happy</option>
                        <option value="Sad">Sad</option>
                        <option value="Dance">Dance</option>
                        <option value="Bhangra">Bhangra</option>
                        <option value="Patriotic">Patriotic</option>
                        <option value="Nostalgic">Nostalgic</option>
                        <option value="Inspirational">Inspirational</option>
                        <option value="Enthusiastic">Enthusiastic</option>
                        <option value="Optimistic">Optimistic</option>
                        <option value="Passion">Passion</option>
                        <option value="Pessimistic">Pessimistic</option>
                        <option value="Spiritual">Spiritual</option>
                        <option value="Peppy">Peppy</option>
                        <option value="Philosophical">Philosophical</option>
                        <option value="Mellow">Mellow</option>
                        <option value="Calm">Calm</option>
                      </select>
                    )}
                  />
                  {errors.mood && (
                    <p className="text-xs text-red-500 mt-1">
                      {String(errors.mood.message)}
                    </p>
                  )}
                </div>
              </div>

              {/* Language */}
              <div className="space-y-4 pt-6 border-t border-border">
                <div className="space-y-3">
                  <Label htmlFor="language" className="text-lg font-semibold">
                    Language <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <LanguageSelect
                    control={control}
                    isNoLyricsTrack={isNoLyricsTrack}
                    hasError={!!errors.language}
                  />
                  {isNoLyricsTrack && (
                    <p className="text-xs text-muted-foreground">
                      Language is set to Instrumental for tracks without lyrics.
                    </p>
                  )}
                  {errors.language && (
                    <p className="text-xs text-red-500 mt-1">
                      {String(errors.language.message)}
                    </p>
                  )}
                </div>
              </div>

              {/* Featuring Artist - Always show for singles, but disable and show message if not allowed by plan */}
              <div className="space-y-4 pt-6 border-t border-border">
                <div className="space-y-2">
                  <Label htmlFor="featuringArtist" className="text-lg font-semibold">
                    Featuring Artist{fieldRules.featuredArtists?.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    id="featuringArtist"
                    placeholder="Enter Featuring Artist"
                    {...register('featuringArtist')}
                    disabled={!areFeaturedArtistsAllowed}
                    className={errors.featuringArtist ? 'border-red-500' : ''}
                  />
                  {!areFeaturedArtistsAllowed && (
                    <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-md text-xs text-muted-foreground">
                      <Info className="h-3 w-3 mt-0.5" />
                      <span>Upgrade to Creator+ or higher to add featuring artists.</span>
                    </div>
                  )}
                  {errors.featuringArtist && (
                    <p className="text-xs text-red-500 mt-1">{String(errors.featuringArtist.message)}</p>
                  )}
                </div>
              </div>

              {/* Writers - Hidden when instrumental is yes */}
              {fieldRules.songwriters?.allow !== false && !isNoLyricsTrack && (
                <div className="space-y-4 pt-6 border-t border-border">
                  <div>
                    <Label className="text-lg font-semibold">
                      Songwriter/Author
                      {fieldRules.songwriters?.required !== false && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Real names, not stage names. {LEGAL_PERSON_NAME_HINT}
                    </p>
                  </div>

                  {writerFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="space-y-3 p-4 rounded-lg border border-border bg-accent/5"
                    >
                      <div className="grid grid-cols-1 gap-1">
                        <Input
                          placeholder={`Legal full name ${fieldRules.songwriters?.required !== false ? "*" : ""
                            }`}
                          {...register(`writers.${index}` as const)}
                          className="text-sm"
                        />
                        {errors.writers?.[index] && (
                          <p className="text-xs text-red-500 mt-1">
                            {String(errors.writers[index]?.message)}
                          </p>
                        )}
                      </div>

                      {writerFields.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeWriter(index)}
                          className="text-destructive hover:text-destructive"
                          type="button"
                        >
                          Remove writer
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addWriter}
                    className="text-primary hover:text-primary"
                    type="button"
                  >
                    + Add another writer
                  </Button>
                </div>
              )}

              {/* Composers */}
              {fieldRules.composers?.allow !== false && (
                <div className="space-y-4 pt-6 border-t border-border">
                  <div>
                    <Label className="text-lg font-semibold">
                      Composer
                      {fieldRules.composers?.required !== false && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Real names, not stage names. {LEGAL_PERSON_NAME_HINT}
                    </p>
                  </div>

                  {composerFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="space-y-3 p-4 rounded-lg border border-border bg-accent/5"
                    >
                      <div className="grid grid-cols-1 gap-1">
                        <Input
                          placeholder={`Legal full name ${fieldRules.composers?.required !== false ? "*" : ""
                            }`}
                          {...register(`composers.${index}` as const)}
                          className="text-sm"
                        />
                        {errors.composers?.[index] && (
                          <p className="text-xs text-red-500 mt-1">
                            {String(errors.composers[index]?.message)}
                          </p>
                        )}
                      </div>

                      {composerFields.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeComposer(index)}
                          className="text-destructive hover:text-destructive"
                          type="button"
                        >
                          Remove Composer
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addComposer}
                    className="text-primary hover:text-primary"
                    type="button"
                  >
                    + Add Composer
                  </Button>
                </div>
              )}

              {/* Explicit Content — not applicable for instrumental / no-lyrics tracks */}
              {!isNoLyricsTrack && (
              <div className="space-y-3 pt-6 border-t border-border">
                <Label className="text-lg font-semibold flex items-center gap-2">
                  Explicit Content
                  <span className="inline-flex items-center justify-center bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800">
                    18+
                  </span>
                </Label>

                <Controller
                  name="isExplicit"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="isExplicitNo"
                          value="false"
                          checked={field.value === false}
                          onChange={() => field.onChange(false)}
                          onBlur={field.onBlur}
                          className="h-4 w-4"
                        />
                        <Label
                          htmlFor="isExplicitNo"
                          className="font-normal cursor-pointer"
                        >
                          No - Clean content
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="isExplicitYes"
                          value="true"
                          checked={field.value === true}
                          onChange={() => field.onChange(true)}
                          onBlur={field.onBlur}
                          className="h-4 w-4"
                        />
                        <Label
                          htmlFor="isExplicitYes"
                          className="font-normal cursor-pointer"
                        >
                          Yes - Contains explicit content
                        </Label>
                      </div>
                    </div>
                  )}
                />
              </div>
              )}



              {/* Song Highlight Start Time */}
              <div className="space-y-3 pt-6 border-t border-border">
                <Label className="text-lg font-semibold">
                  Song Highlight Start Time{" "}
                  <span className="text-muted-foreground font-normal">
                    (Caller Tune (CRBT), TikTok, Apple Music, iTunes & YouTube Shorts)
                  </span>
                </Label>

                <div className="mt-4">
                  {!hasCrbtAudio ? (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                      <p className="text-sm text-amber-200/90">
                        Upload or load the audio file first to choose a song highlight clip.
                      </p>
                    </div>
                  ) : isResolvingCrbtAudio ? (
                    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        Loading audio waveform...
                      </p>
                    </div>
                  ) : crbtAudioError ? (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
                      <p className="text-sm text-red-200/90">{crbtAudioError}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Go back to the Audio step and confirm the file is validated, then return here.
                      </p>
                    </div>
                  ) : playbackSource ? (
                    <WaveformTrimmer
                      audioFile={playbackSource}
                      trackDurationSec={trackDurationSec}
                      initialStartTime={previewClipStartTime}
                      onTimeChange={handlePreviewClipChange}
                    />
                  ) : null}
                  {errors.previewClipStartTime && (
                    <p className="text-xs text-red-500 mt-2">
                      {errors.previewClipStartTime.message}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>


      </div>
    </>
  );
}
