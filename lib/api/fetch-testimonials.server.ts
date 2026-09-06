import { config } from '@/lib/config'
import type { Testimonial } from '@/lib/api/testimonials'

export async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const response = await fetch(`${config.apiUrl}/testimonials`, {
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      return []
    }

    return response.json()
  } catch {
    return []
  }
}
