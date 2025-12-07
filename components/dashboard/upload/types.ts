export interface Songwriter {
    role: string
    firstName: string
    middleName: string
    lastName: string
}

// Track specific data
export interface Track {
    id: string
    title: string
    subtitle?: string // version/subtitle
    artistName: string
    audioFile: File | null
    audioFileName: string
    isExplicit: boolean
    explicitLyrics: string
    isInstrumental: string
    previewStartTime: string
    price?: string
    songwriters?: Songwriter[]
    composers?: Songwriter[]
    featuringArtist?: string
    language?: string
    spotifyProfile?: string
    youtubeMusicProfile?: string
    instagramProfile?: string
    instagramProfileUrl?: string
    facebookProfile?: string
    facebookProfileUrl?: string
    previouslyReleased?: string
    originalReleaseDate?: string
    primaryGenre?: string
    secondaryGenre?: string
}

export interface UploadFormData {
    // Basic Info
    numberOfSongs: string
    title: string
    artistName: string
    previouslyReleased: string // 'yes' | 'no'
    primaryGenre: string
    secondaryGenre: string
    language: string
    releaseType: string
    isExplicit: boolean
    explicitLyrics: string // 'yes' | 'no'
    format: 'single' | 'ep' | 'album' | string

    // Social media & platforms
    spotifyProfile: string
    appleMusicProfile: string
    youtubeMusicProfile: string
    instagramProfile: string
    instagramProfileUrl: string
    facebookProfile: string
    facebookProfileUrl: string

    // Files (Legacy for Single / First track)
    audioFile: File | null
    audioFileName: string
    coverArt: File | null
    coverArtPreview: string
    dolbyAtmos: string // 'yes' | 'no'

    // Multi-track support
    tracks: Track[]

    // Release Details
    releaseDate: string

    // Credits
    previewClipStartTime: string,
    copyright: string // Optional
    instrumental: string // 'yes' | 'no'

    // Legacy/Other state initialized but maybe unused
    producers: string[]
    writers: string[]
    selectedPlatforms?: string[] // For validation convenience
}

export interface StepProps {
    formData: UploadFormData
    setFormData: (data: UploadFormData) => void
}

export interface MandatoryChecks {
    youtubeConfirmation: boolean
    capitalizationConfirmation: boolean
    promoServices: boolean
    rightsAuthorization: boolean
    nameUsage: boolean
    termsAgreement: boolean
}
