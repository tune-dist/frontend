import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { TESTIMONIALS_CACHE_TAG } from '@/lib/api/fetch-testimonials.server'

export async function POST() {
  revalidateTag(TESTIMONIALS_CACHE_TAG)
  revalidatePath('/testimonials')
  return NextResponse.json({ revalidated: true })
}
