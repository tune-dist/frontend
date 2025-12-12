"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadFormData, Songwriter, Track, AudioFile } from "./types";
import { useFormContext, useFieldArray } from "react-hook-form";
import { useState, useEffect } from "react";
import { Music, Pencil } from "lucide-react";
import TrackEditModal from "./track-edit-modal";
import {
  getGenres,
  getSubGenresByGenreId,
  type Genre,
  type SubGenre,
} from "@/lib/api/genres";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

interface CreditsStepProps {
  formData?: UploadFormData;
  setFormData?: (data: UploadFormData) => void;
  songwriters?: Songwriter[];
  setSongwriters?: (data: Songwriter[]) => void;
  composers?: Songwriter[];
  setComposers?: (data: Songwriter[]) => void;
}

export default function CreditsStep({
  formData: propFormData,
  setFormData: propSetFormData,
  songwriters: propSongwriters,
  setSongwriters: propSetSongwriters,
  composers: propComposers,
  setComposers: propSetComposers,
}: CreditsStepProps) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<UploadFormData>();

  const format = watch("format");
  const tracks = watch("tracks") || [];
  const audioFiles = watch("audioFiles") || [];
  const isSingle = format === "single";

  // ISRC State
  const [showIsrc, setShowIsrc] = useState(false);
  const { user } = useAuth();

  // Track modal state
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [editingTrackIndex, setEditingTrackIndex] = useState<number | null>(
    null
  );

  // Genres state
  const [genres, setGenres] = useState<Genre[]>([]);
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

  // Sub-genres state
  const [subGenres, setSubGenres] = useState<SubGenre[]>([]);
  const [subGenresLoading, setSubGenresLoading] = useState(false);
  const primaryGenre = watch("primaryGenre");

  // Fetch sub-genres when primary genre changes
  useEffect(() => {
    const fetchSubGenres = async () => {
      if (!primaryGenre) {
        setSubGenres([]);
        return;
      }

      // Find the genre _id from the selected slug
      const selectedGenre = genres.find((g) => g.slug === primaryGenre);
      if (!selectedGenre) {
        setSubGenres([]);
        return;
      }

      setSubGenresLoading(true);
      try {
        const fetchedSubGenres = await getSubGenresByGenreId(selectedGenre._id);
        setSubGenres(fetchedSubGenres);
        // Clear secondary genre if it's not in the new sub-genres list
        const currentSecondary = watch("secondaryGenre");
        if (
          currentSecondary &&
          !fetchedSubGenres.some((sg) => sg.slug === currentSecondary)
        ) {
          setValue("secondaryGenre", "");
        }
      } catch (error) {
        console.error("Failed to fetch sub-genres:", error);
        setSubGenres([]);
      } finally {
        setSubGenresLoading(false);
      }
    };
    fetchSubGenres();
  }, [primaryGenre, genres, setValue, watch]);

  // UseFieldArray for songwriters and composers (for single format)
  const {
    fields: songwriterFields,
    append: appendSongwriter,
    remove: removeSongwriter,
  } = useFieldArray({
    control,
    name: "songwriters",
  });

  const {
    fields: composerFields,
    append: appendComposer,
    remove: removeComposer,
  } = useFieldArray({
    control,
    name: "composers",
  });

  const addSongwriter = () => {
    appendSongwriter({
      role: "Music and lyrics",
      firstName: "",
      middleName: "",
      lastName: "",
    });
  };

  const addComposer = () => {
    appendComposer({
      role: "Composer",
      firstName: "",
      middleName: "",
      lastName: "",
    });
  };

  const openTrackModal = (index: number) => {
    setEditingTrackIndex(index);
    setIsTrackModalOpen(true);
  };

  const saveTrackModal = (
    updatedTrack: Track,
    songwriters: Songwriter[],
    composers: Songwriter[]
  ) => {
    if (editingTrackIndex !== null) {
      const updatedTracks = [...tracks];
      updatedTracks[editingTrackIndex] = {
        ...updatedTrack,
        songwriters,
        composers,
      };
      setValue("tracks", updatedTracks);
    }
  };

  return (
    <div className="space-y-4">
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
          <select
            id="trackPrice"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register("trackPrice")}
            defaultValue="0.99"
          >
            <option value="0.69">$0.69</option>
            <option value="0.99">$0.99</option>
            <option value="1.29">$1.29</option>
          </select>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openTrackModal(index)}
                  type="button"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Track
                </Button>
              </div>
            );
          })}

          {/* Add Track Button */}
          <Button
            variant="outline"
            onClick={() => {
              const newTrack: Track = {
                id: crypto.randomUUID(),
                title: "",
                audioFileId: "", // Will be linked later
              };
              setValue("tracks", [...tracks, newTrack]);
              openTrackModal(tracks.length);
            }}
            className="w-full text-primary hover:text-primary"
            type="button"
          >
            + Add track
          </Button>
        </div>
      )}

      <div className="space-y-4 mt-6">
        {/* Show these fields only for Singles */}
        {isSingle && (
          <>
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
                          setValue("isrc", process.env.NEXT_PUBLIC_DEFAULT_ISRC || "QZ-K6P-25-00001");
                        }
                      } else {
                        setValue("isrc", "");
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="hasIsrc" className="font-normal cursor-pointer">
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
                    readOnly={user?.plan === 'free'} // Make strictly readonly for free users? Or just warn? Request says "free user change that then show warning" which implies they *can* change it but we warn them. But stricter: "purchase paid plan for that". Let's assume allow edit + warning for now, or use the pattern requested.
                    // Better UX: Allow typing but show error/warning immediately.
                    {...register("isrc", {
                      onChange: (e) => {
                        if (user?.plan === 'free' && e.target.value !== (process.env.NEXT_PUBLIC_DEFAULT_ISRC || "QZ-K6P-25-00001")) {
                          toast.error("Upgrade to paid plan to use custom ISRC", { id: "isrc-warning" });
                        }
                      }
                    })}
                    className={errors.isrc ? "border-red-500" : ""}
                  />
                  {user?.plan === 'free' && (
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

            {/* Previously Released */}
            <div className="space-y-3 pt-6 border-t border-border">
              <Label className="text-lg font-semibold">
                Has this single been previously released?
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="previouslyReleased-no"
                    value="no"
                    {...register("previouslyReleased")}
                    className="h-4 w-4 border-primary text-primary focus:ring-primary"
                  />
                  <Label
                    htmlFor="previouslyReleased-no"
                    className="font-normal cursor-pointer"
                  >
                    No
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="previouslyReleased-yes"
                    value="yes"
                    {...register("previouslyReleased")}
                    className="h-4 w-4 border-primary text-primary focus:ring-primary"
                  />
                  <Label
                    htmlFor="previouslyReleased-yes"
                    className="font-normal cursor-pointer"
                  >
                    Yes
                  </Label>
                </div>
              </div>
              {errors.previouslyReleased && (
                <p className="text-xs text-red-500 mt-1">
                  {String(errors.previouslyReleased.message)}
                </p>
              )}
            </div>

            {/* Genres */}
            <div className="space-y-4 mt-6">
              <div className="space-y-3">
                <Label htmlFor="primaryGenre" className="text-lg font-semibold">
                  Primary genre *
                </Label>
                <select
                  id="primaryGenre"
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.primaryGenre ? "border-red-500" : ""
                    }`}
                  {...register("primaryGenre")}
                >
                  <option value="">Select a genre</option>
                  {genresLoading ? (
                    <option disabled>Loading genres...</option>
                  ) : (
                    genres.map((genre) => (
                      <option key={genre._id} value={genre.slug}>
                        {genre.name}
                      </option>
                    ))
                  )}
                </select>
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
                  Sub-genre *
                </Label>
                <select
                  id="secondaryGenre"
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.secondaryGenre ? "border-red-500" : ""
                    }`}
                  {...register("secondaryGenre")}
                  disabled={!primaryGenre || subGenresLoading}
                >
                  <option value="">
                    {!primaryGenre
                      ? "Select a genre first"
                      : subGenresLoading
                        ? "Loading sub-genres..."
                        : "Select a sub-genre"}
                  </option>
                  {subGenres.map((subGenre) => (
                    <option key={subGenre._id} value={subGenre.slug}>
                      {subGenre.name}
                    </option>
                  ))}
                </select>
                {errors.secondaryGenre && (
                  <p className="text-xs text-red-500 mt-1">
                    {String(errors.secondaryGenre.message)}
                  </p>
                )}
              </div>
            </div>

            {/* Songwriters */}
            <div className="space-y-4 pt-6 border-t border-border">
              <div>
                <Label className="text-lg font-semibold">
                  Songwriter/Author
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Real names, not stage names
                </p>
              </div>

              {songwriterFields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-3 p-4 rounded-lg border border-border bg-accent/5"
                >
                  <div className="grid grid-cols-1 gap-1">
                    <Input
                      placeholder="Enter First name and last name *"
                      {...register(`songwriters.${index}.firstName` as const)}
                      className="text-sm"
                    />
                    {errors.songwriters?.[index]?.firstName && (
                      <p className="text-xs text-red-500 mt-1">
                        {String(errors.songwriters[index]?.firstName?.message)}
                      </p>
                    )}
                  </div>

                  {songwriterFields.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSongwriter(index)}
                      className="text-destructive hover:text-destructive"
                      type="button"
                    >
                      Remove songwriter
                    </Button>
                  )}
                </div>
              ))}

              <Button
                variant="outline"
                onClick={addSongwriter}
                className="text-primary hover:text-primary"
                type="button"
              >
                + Add another songwriter
              </Button>
            </div>

            {/* Composers */}
            <div className="space-y-4 pt-6 border-t border-border">
              <div>
                <Label className="text-lg font-semibold">Composer</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Real names, not stage names
                </p>
              </div>

              {composerFields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-3 p-4 rounded-lg border border-border bg-accent/5"
                >
                  <div className="grid grid-cols-1 gap-1">
                    <Input
                      placeholder="Enter First name and last name"
                      {...register(`composers.${index}.firstName` as const)}
                      className="text-sm"
                    />
                    {errors.composers?.[index]?.firstName && (
                      <p className="text-xs text-red-500 mt-1">
                        {String(errors.composers[index]?.firstName?.message)}
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

            {/* Instrumental */}
            <div className="space-y-3 pt-6 border-t border-border">
              <Label className="text-lg font-semibold">Instrumental?</Label>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="instrumentalNo"
                    value="no"
                    {...register("instrumental")}
                    className="h-4 w-4"
                  />
                  <Label
                    htmlFor="instrumentalNo"
                    className="font-normal cursor-pointer"
                  >
                    This song contains lyrics
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="instrumentalYes"
                    value="yes"
                    {...register("instrumental")}
                    className="h-4 w-4"
                  />
                  <Label
                    htmlFor="instrumentalYes"
                    className="font-normal cursor-pointer"
                  >
                    This song is instrumental and contains no lyrics
                  </Label>
                </div>
              </div>
            </div>

            {/* Preview Clip Start Time */}
            <div className="space-y-3 pt-6 border-t border-border">
              <Label className="text-lg font-semibold">
                Preview clip start time{" "}
                <span className="text-muted-foreground font-normal">
                  (TikTok, Apple Music, iTunes)
                </span>
              </Label>

              <div className="grid grid-cols-1 gap-1">
                <Input
                  placeholder="HH:MM:SS"
                  type="text"
                  {...register("previewClipStartTime", {
                    onChange: (e) => {
                      let v = e.target.value.replace(/\D/g, ""); // only digits

                      // limit to HHMMSS (6 digits)
                      if (v.length > 6) v = v.slice(0, 6);

                      let hh = v.substring(0, 2);
                      let mm = v.substring(2, 4);
                      let ss = v.substring(4, 6);

                      let formatted = "";
                      if (hh) formatted = hh;
                      if (mm) formatted += ":" + mm;
                      if (ss) formatted += ":" + ss;

                      e.target.value = formatted;
                    },
                  })}
                  className="text-sm"
                />

              </div>
            </div>
          </>
        )}
      </div>

      {/* Track Modal */}
      <TrackEditModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        track={editingTrackIndex !== null ? tracks[editingTrackIndex] : null}
        trackIndex={editingTrackIndex}
        onSave={saveTrackModal}
      />
    </div>
  );
}
