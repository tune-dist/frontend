import { z } from 'zod'

export const songwriterSchema = z.object({
    role: z.string().min(1, 'Role is required'),
    firstName: z.string().min(1, 'First name is required'),
    middleName: z.string().optional(),
    lastName: z.string().min(1, 'Last name is required'),
})

export type Songwriter = z.infer<typeof songwriterSchema>

// Audio File Schema (just the file, no metadata)
export const audioFileSchema = z.object({
    id: z.string(),
    file: z.any(), // File object
    fileName: z.string(),
    size: z.number().optional()
})

export type AudioFile = z.infer<typeof audioFileSchema>

// Track Schema (metadata only, NO audio file)
export const trackSchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Track title is required'),
    audioFileId: z.string(), // Reference to audioFiles array
    artistName: z.string().optional(), // Per-track artist name
    language: z.string().optional(), // Per-track language
    isrc: z.string().optional(),
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

export const uploadFormSchema = z.object({
    // Basic Info
    numberOfSongs: z.string().default('1'),
    title: z.string().min(1, 'Title is required'),
    version: z.string().optional(),
    artistName: z.string().min(1, 'Artist Name is required'),
    isrc: z.string().optional(), // Add regex validation if needed
    previouslyReleased: z.enum(['yes', 'no']),
    primaryGenre: z.string().min(1, 'Primary genre is required'),
    secondaryGenre: z.string().optional(),
    language: z.string().min(1, 'Language is required'),
    releaseType: z.string().default('single'),
    isExplicit: z.boolean().default(false),
    explicitLyrics: z.enum(['yes', 'no']).default('no'),
    format: z.enum(['single', 'ep', 'album'], {
        errorMap: () => ({ message: 'Format is required' })
    }),
    featuringArtist: z.string().optional(),
    trackPrice: z.string().optional().default('0.99'),

    // Social media & platforms
    spotifyProfile: z.string().optional(),
    appleMusicProfile: z.string().optional(),
    youtubeMusicProfile: z.string().optional(),
    instagramProfile: z.string().optional(),
    instagramProfileUrl: z.string().optional(),
    facebookProfile: z.string().optional(),
    facebookProfileUrl: z.string().optional(),

    // Files (Legacy for Single / First track)
    audioFile: z.any().optional(), // Refined validation in component or refine here if browser capable
    audioFileName: z.string().optional(),
    coverArt: z.any().optional(), // Refined validation in component
    coverArtPreview: z.string().optional(),
    dolbyAtmos: z.string().optional(),

    // Multi-track support
    audioFiles: z.array(audioFileSchema).default([]), // Audio files for albums/EPs (separate from metadata)
    tracks: z.array(trackSchema).default([]), // Track metadata only

    // Release Details
    releaseDate: z.string().optional(),

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
