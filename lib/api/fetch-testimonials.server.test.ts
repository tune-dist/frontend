import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { TESTIMONIALS_CACHE_TAG } from './fetch-testimonials.server'

describe('testimonials public page cache', () => {
  it('uses a named cache tag so admin writes can invalidate the list', () => {
    const source = readFileSync(
      join(process.cwd(), 'lib/api/fetch-testimonials.server.ts'),
      'utf8',
    )

    expect(TESTIMONIALS_CACHE_TAG).toBe('testimonials')
    expect(source).toContain('tags: [TESTIMONIALS_CACHE_TAG]')
    expect(source).toContain('revalidate: 300')
  })

  it('exposes a revalidate route for create, update, and delete', () => {
    const source = readFileSync(
      join(process.cwd(), 'app/api/revalidate/testimonials/route.ts'),
      'utf8',
    )

    expect(source).toContain('revalidateTag(TESTIMONIALS_CACHE_TAG)')
    expect(source).toContain("revalidatePath('/testimonials')")
  })

  it('busts the public page cache after testimonial writes', () => {
    const source = readFileSync(
      join(process.cwd(), 'lib/api/testimonials.ts'),
      'utf8',
    )

    expect(source).toContain("fetch('/api/revalidate/testimonials'")
    expect(source).toContain('await bustTestimonialsPageCache()')
  })
})
