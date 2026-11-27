import { config } from '@/lib/config'
import type { Testimonial } from '@/lib/api/testimonials'

export const TESTIMONIALS_CACHE_TAG = 'testimonials'

export async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const response = await fetch(`${config.apiUrl}/testimonials`, {
      next: { tags: [TESTIMONIALS_CACHE_TAG], revalidate: 300 },
    })

    if (!response.ok) {
      return []
    }

    return response.json()
  } catch {
    return []
  }
}
