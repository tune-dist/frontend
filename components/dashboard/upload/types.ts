import { z } from 'zod'

export const songwriterSchema = z.object({
    role: z.string().min(1, 'Role is required'),
    firstName: z.string()
        .min(1, 'Name is required')
        .refine((val) => {
            // Strict regex: 
            // ^[a-zA-Z]{3,} : First name (letters only, min 3 chars)
            // [ ] : Exactly one space
            // [a-zA-Z]{3,}$ : Last name (letters only, min 3 chars)
            return /^[a-zA-Z]{3,} [a-zA-Z]{3,}$/.test(val.trim());
        }, {
            message: 'Must be "Firstname Lastname" (letters only). First and Last names must be at least 3 characters each. No special characters or numbers.'
        }),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
})

export type Songwriter = z.infer<typeof songwriterSchema>

// Audio File Schema (just the file, no metadata)
export const audioFileSchema = z.object({
    id: z.string(),
    file: z.any(), // File object (kept for reference/initial display)
    fileName: z.string(),
    size: z.number().optional(),
    // Fields from Chunk Upload response
    path: z.string().optional(),
    duration: z.number().optional(),
    resolution: z.object({
        width: z.number().optional(),
        heigth: z.number().optional() // matching backend typo for consistency
    }).optional()
})

export type AudioFile = z.infer<typeof audioFileSchema>

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
    primaryGenre: z.string().optional(),
    secondaryGenre: z.string().optional(),
    songwriters: z.array(songwriterSchema).optional(),
    composers: z.array(songwriterSchema).optional(),
    isInstrumental: z.string().optional(),
    previewClipStartTime: z.string().optional(),
    // Social media profiles per track
    spotifyProfile: z.string().optional(),
    appleMusicProfile: z.string().optional(),
    youtubeMusicProfile: z.string().optional(),
    instagramProfile: z.string().optional(),
    facebookProfile: z.string().optional(),
})

export type Track = z.infer<typeof trackSchema>

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

export const uploadFormSchema = z.object({
    // Basic Info
    numberOfSongs: z.string().default('1'),
    title: z.string().min(1, 'Title is required'),
    version: z.string().optional(),
    artistName: z.string().min(1, 'Artist Name is required'),
    artists: z.array(z.object({
        name: z.string().min(1, 'Artist name is required'),
        spotifyProfile: z.union([z.string(), artistProfileSchema]).optional(),
        appleMusicProfile: z.union([z.string(), artistProfileSchema]).optional(),
        youtubeMusicProfile: z.union([z.string(), artistProfileSchema]).optional(),
    })).default([]),
    isrc: z.string().optional().refine((val) => {
        if (!val || val.trim() === '') return true;
        return /^[A-Z0-9]{2}-[A-Z0-9]{3}-[A-Z0-9]{2}-[A-Z0-9]{5}$/i.test(val);
    }, {
        message: 'ISRC must be in format: XX-XXX-XX-XXXXX (e.g., US-ABC-12-34567)'
    }),
    previouslyReleased: z.enum(['yes', 'no']),
    primaryGenre: z.string().min(1, 'Primary genre is required'),
    secondaryGenre: z.string().min(1, 'Secondary genre is required'),
    language: z.string().min(1, 'Language is required'),
    releaseType: z.string().default('single'),
    isExplicit: z.boolean().default(false),
    explicitLyrics: z.string().optional(),
    format: z.enum(['single', 'ep', 'album'], {
        errorMap: () => ({ message: 'Format is required' })
    }),
    featuringArtist: z.string().optional(),
    trackPrice: z.string().optional().default('0.99'),

    // Social media & platforms
    spotifyProfile: z.union([z.string(), artistProfileSchema]).optional(),
    appleMusicProfile: z.union([z.string(), artistProfileSchema]).optional(),
    youtubeMusicProfile: z.union([z.string(), artistProfileSchema]).optional(),
    instagramProfile: z.string().optional(),
    instagramProfileUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    facebookProfile: z.string().optional(),
    facebookProfileUrl: z.string().url('Invalid URL').optional().or(z.literal('')),

    // Files (Legacy for Single / First track)
    audioFile: z.any().optional(), // Refined validation in component
    audioFileName: z.string().optional(),
    coverArt: z.any().optional(), // Refined validation in component
    coverArtPreview: z.string().optional(),
    dolbyAtmos: z.string().optional(),

    // Multi-track support
    audioFiles: z.array(audioFileSchema).default([]),
    tracks: z.array(trackSchema).default([]),

    // Release Details
    releaseDate: z.string().optional(),
    labelName: z.string().optional(),
    distributionTerritories: z.array(z.string()).default(['Worldwide']),

    // Credits
    previewClipStartTime: z.string().optional(),
    copyright: z.string().optional(),
    instrumental: z.string().optional(),

    // Detailed Credits (UI State managed by FieldArray)
    songwriters: z.array(songwriterSchema).default([{ role: 'Music and lyrics', firstName: '', middleName: '', lastName: '' }]),
    composers: z.array(songwriterSchema).default([{ role: 'Composer', firstName: '', middleName: '', lastName: '' }]),

    // Legacy/Other
    producers: z.array(z.string()).optional(),
    writers: z.array(z.string()).optional(),
    selectedPlatforms: z.array(z.string()).optional(),
})

export type UploadFormData = z.infer<typeof uploadFormSchema>
export type SecondaryArtist = z.infer<typeof uploadFormSchema>['artists'][number]

export interface StepProps {
    // We will use react-hook-form context in steps, but kept for backward compatibility if needed, 
    // or we can remove if we fully switch.
    // For now, let's keep it but optional or partial as we transition.
    formData?: UploadFormData
    setFormData?: (data: UploadFormData) => void
}

export interface MandatoryChecks {
    youtubeConfirmation: boolean
    capitalizationConfirmation: boolean
    promoServices: boolean
    rightsAuthorization: boolean
    nameUsage: boolean
    termsAgreement: boolean
}
