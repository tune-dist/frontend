import apiClient from '../api-client'

export interface Genre {
    _id: string
    name: string
    slug: string
}

export interface SubGenre {
    _id: string
    name: string
    slug: string
    genreId: string
}

/**
 * Fetch all genres
 */
export async function getGenres(): Promise<Genre[]> {
    const response = await apiClient.get('/genres')
    return response.data
}

/**
 * Fetch sub-genres for a specific genre by ID
 */
export async function getSubGenresByGenreId(genreId: string): Promise<SubGenre[]> {
    const response = await apiClient.get(`/genres/${genreId}/sub-genres`)
    return response.data
}
