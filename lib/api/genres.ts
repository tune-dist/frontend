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

export interface GenreWithSubGenres {
    genre: Genre
    subGenres: SubGenre[]
}

/**
 * Fetch all genres
 */
export async function getGenres(): Promise<Genre[]> {
    const response = await apiClient.get('/genres')
    return response.data
}

/**
 * Fetch all genres with their sub-genres
 */
export async function getGenresWithSubGenres(): Promise<GenreWithSubGenres[]> {
    const response = await apiClient.get('/genres/with-subgenres')
    return response.data
}

/**
 * Search genres by name
 */
export async function searchGenres(query: string): Promise<Genre[]> {
    const response = await apiClient.get('/genres/search', {
        params: { q: query }
    })
    return response.data
}
