import { z } from 'zod'
import {
    isValidLegalPersonName,
    LEGAL_PERSON_NAME_COMPOSER_HINT,
    LEGAL_PERSON_NAME_HINT,
} from '@/lib/validation/legal-person-name'
import { earliestValidReleaseDate } from '@/lib/distribution-issue'

export const songwriterSchema = z.string()
    .refine((val) => {
        if (!val || val.trim() === '') return true;
        return isValidLegalPersonName(val, true);
    }, {
        message: LEGAL_PERSON_NAME_HINT,
    });

export const composerSchema = z.string()
    .refine((val) => {
        if (!val || val.trim() === '') return true;
        return isValidLegalPersonName(val, false);
    }, {
        message: LEGAL_PERSON_NAME_COMPOSER_HINT,
    });

// Audio File Schema (just the file, no metadata)
export const audioFileSchema = z.object({
    id: z.string(),
    file: z.any(), // File object (kept for reference/initial display)
    fileName: z.string(),
    size: z.number().optional(),
    // Fields from Chunk Upload response
    path: z.string().optional(),
    playbackUrl: z.string().optional(),
    duration: z.number().optional(),
    resolution: z.object({
        width: z.number().optional(),
        heigth: z.number().optional() // matching backend typo for consistency
    }).optional(),
    hash: z.string().optional(),
    fingerprint: z.string().optional()
})

export type AudioFile = z.infer<typeof audioFileSchema>

// Artist Profile Schema for rich metadata storage
export const artistProfileSchema = z.object({
    id: z.string(),
    name: z.string(),
    image: z.string().optional(),
    url: z.string().optional(),
    followers: z.number().optional(), // For Spotify
    track: z.string().optional(), // For Apple/YouTube (description/genre)
})

export type ArtistProfile = z.infer<typeof artistProfileSchema>

/** Spotify/Apple profile values stored in form state (id string or rich object). */
export const platformProfileFormSchema = z
    .union([
        z.string(),
        artistProfileSchema,
        z
            .object({
                id: z.string().optional(),
                url: z.string().optional(),
                appleId: z.string().optional(),
                name: z.string().optional(),
                image: z.string().optional(),
            })
            .passthrough(),
    ])
    .optional()
    .nullable()

export type PlatformProfileFormValue = z.infer<typeof platformProfileFormSchema>

// Track Schema (metadata only, NO audio file)
export const trackSchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Track title is required'),
    audioFileId: z.string(), // Reference to audioFiles array
    artistName: z.string().optional(), // Per-track artist name
    language: z.string().optional(), // Per-track language
    isrc: z.string().optional().refine((val) => {
        if (!val || val.trim() === '') return true;
        // Allow alphanumeric in all segments as per 'XX-XXX-XX-XXXXX' request
        return /^[A-Z0-9]{2}-[A-Z0-9]{3}-[A-Z0-9]{2}-[A-Z0-9]{5}$/i.test(val);
    }, {
        message: 'ISRC must be in format: XX-XXX-XX-XXXXX (e.g., US-ABC-12-34567)'
    }),
    previouslyReleased: z.string().optional(),
    originalReleaseDate: z.string().optional(),
    // Genres are filled per-track via the track edit modal (albums/EPs); tracks
    // start as placeholders without them. Enforcement happens in the modal save
    // handler, the album step validation, and the backend DraftGenreDto.
    primaryGenre: z.string().optional(),
    secondaryGenre: z.string().optional(),
    writers: z.array(songwriterSchema).optional(),
    composers: z.array(composerSchema).optional(),
    isInstrumental: z.string().optional(),
    isExplicit: z.preprocess((val) => {
        if (typeof val === 'string') return val === 'true';
        return val;
    }, z.boolean().optional()),
    previewClipStartTime: z.string().optional(),
    // Social media profiles per track (may be id string or rich profile object)
    spotifyProfile: platformProfileFormSchema,
    appleMusicProfile: platformProfileFormSchema,
    youtubeMusicProfile: platformProfileFormSchema,
    instagramProfile: platformProfileFormSchema,
    facebookProfile: platformProfileFormSchema,
    version: z.string().optional(),
    featuringArtist: z.string().optional(),
    mood: z.string().optional(),
})

export type Track = z.infer<typeof trackSchema>

export const uploadFormSchema = z.object({
    // Basic Info
    numberOfSongs: z.string().default('1'),
    title: z.string().min(1, 'Title is required'),
    version: z.string().optional(),
    artistName: z.string().min(1, 'Artist Name is required'),
    cosmosArtistId: z.string().optional(),
    artists: z.array(z.object({
        name: z.string().min(1, 'Artist name is required'),
        cosmosArtistId: z.string().optional(),
        spotifyProfile: platformProfileFormSchema,
        appleMusicProfile: platformProfileFormSchema,
        youtubeMusicProfile: platformProfileFormSchema,
        instagramProfile: z.string().optional().nullable(),
        facebookProfile: z.string().optional().nullable(),
    })).default([]),
    isrc: z.string().optional().refine((val) => {
        if (!val || val.trim() === '') return true;
        return /^[A-Z0-9]{2}-[A-Z0-9]{3}-[A-Z0-9]{2}-[A-Z0-9]{5}$/i.test(val);
    }, {
        message: 'ISRC must be in format: XX-XXX-XX-XXXXX (e.g., US-ABC-12-34567)'
    }),
    previouslyReleased: z.enum(['yes', 'no']).optional(),
    originalReleaseDate: z.string().optional(),
    primaryGenre: z.string().optional(),
    secondaryGenre: z.string().optional(),
    language: z.string().optional(),
    releaseType: z.string().default('single'),
    explicitLyrics: z.enum(['yes', 'no']).optional(),
    isExplicit: z.preprocess((val) => {
        if (typeof val === 'string') return val === 'true';
        return val;
    }, z.boolean().default(false)),
    format: z.enum(['single', 'ep', 'album', 'remix', 'compilation'], {
        errorMap: () => ({ message: 'Format is required' })
    }),
    featuringArtist: z.string().optional(),
    trackPrice: z.string().optional().default('0.99'),
    upc: z.string().optional().refine((val) => {
        if (!val || val.trim() === '') return true;
        // UPC should be exactly 13 digits
        return /^\d{13}$/.test(val);
    }, {
        message: 'UPC must be exactly 13 digits or leave empty for auto-generation'
    }),

    // Social media & platforms
    spotifyProfile: platformProfileFormSchema,
    appleMusicProfile: platformProfileFormSchema,
    youtubeMusicProfile: platformProfileFormSchema,
    instagramProfile: z.string().optional().nullable(),
    instagramProfileUrl: z.string().url('Invalid URL').optional().or(z.literal('')).nullable(),
    facebookProfile: z.string().optional().nullable(),
    facebookProfileUrl: z.string().url('Invalid URL').optional().or(z.literal('')).nullable(),

    // Files (Legacy for Single / First track)
    audioFile: z.any().optional(), // Refined validation in component
    audioFileName: z.string().optional(),
    coverArt: z.any().optional(), // Refined validation in component
    coverArtPreview: z.string().optional(),
    coverArtConsent: z.boolean().default(false),
    coverArtValidationStatus: z.string().optional(),
    coverArtValidationIssues: z.array(z.any()).default([]),
    coverArtMetadataStale: z.boolean().default(false),
    /** True only after the user uploads/replaces cover art in this session. */
    coverArtChanged: z.boolean().default(false),
    audioConsent: z.boolean().default(false),
    audioDuplicateDetected: z.boolean().default(false),
    audioWarningMessage: z.string().optional(),
    dolbyAtmos: z.string().optional(),

    // Multi-track support
    audioFiles: z.array(audioFileSchema).default([]),
    tracks: z.array(trackSchema).default([]),

    // Release Details
    releaseDate: z.string().min(1, 'Release date is required').refine((val) => {
        if (!val) return false;
        return val >= earliestValidReleaseDate();
    }, {
        message: 'Release date cannot be in the past'
    }),
    labelName: z.string().min(1, 'Label name is required'),
    distributionTerritories: z.array(z.string()).default(['Worldwide']),

    // Credits
    previewClipStartTime: z.string().optional(),
    copyright: z.string().optional(),
    instrumental: z.string().optional(),

    // Detailed Credits (UI State managed by FieldArray)
    writers: z.array(songwriterSchema).default([]),
    composers: z.array(composerSchema).default([]),

    recordingYear: z.number().default(new Date().getFullYear()),
    mood: z.string().optional(),

    // Legacy/Other
    producers: z.array(z.string()).optional(),
    selectedPlatforms: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
    if (data.format !== 'single') {
        data.tracks.forEach((track, index) => {
            if (!track.mood?.trim()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Track ${index + 1}: Vibe is required`,
                    path: ['tracks', index, 'mood'],
                });
            }
        });
    }

    // Mood is required only for single releases at the root level
    if (data.format === 'single' && (!data.mood || data.mood.trim() === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Vibe is required',
            path: ['mood'],
        });
    }

    if (data.format === 'single') {
        if (!data.primaryGenre?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Primary genre is required',
                path: ['primaryGenre'],
            });
        }
        if (!data.secondaryGenre?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Sub-genre is required',
                path: ['secondaryGenre'],
            });
        }
    }
})

export type UploadFormData = z.infer<typeof uploadFormSchema>
export type SecondaryArtist = z.infer<typeof uploadFormSchema>['artists'][number]

export interface MandatoryChecks {
    youtubeConfirmation: boolean
    capitalizationConfirmation: boolean
    promoServices: boolean
    rightsAuthorization: boolean
    nameUsage: boolean
    termsAgreement: boolean
    ownershipConfirmation: boolean
}
