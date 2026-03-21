'use client'


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, TrendingUp, BarChart3, Upload } from 'lucide-react'
import SpotlightCard from './SpotlightCard';
import { useEffect, useState } from 'react';
import { testimonialsApi, Testimonial } from '@/lib/api/testimonials'
import { S3Image } from '@/components/ui/s3-image'
import { Quote } from 'lucide-react'

export default function Testimonials() {
    const [dynamicTestimonials, setDynamicTestimonials] = useState<Testimonial[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const data = await testimonialsApi.getAll()
                setDynamicTestimonials(data)
            } catch (error) {
                console.error('Failed to fetch testimonials:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchTestimonials()
    }, [])

    if (loading) {
        return (
            <section className="py-20 md:py-32 bg-background relative">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-muted-foreground">Loading testimonials...</p>
                </div>
            </section>
        )
    }

    if (dynamicTestimonials.length === 0) {
        return null
    }
    return (
        <>
            <div className="flex gap-4">
                {dynamicTestimonials.map((testimonial, index) => (
                    <Card className="h-full border-border/50 hover:border-primary/50 transition-colors duration-300 bg-card/50 backdrop-blur-sm w-[400px]">
                        <CardContent className="p-6">
                            <Quote className="h-8 w-8 text-primary/50 mb-4" />
                            <p className="text-muted-foreground mb-6 text-left text-sm font-normal">
                                "{testimonial.quote}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                                    {testimonial.image ? (
                                        <S3Image
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                                            {testimonial.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className='flex flex-col items-start'>
                                    <p className="font-normal text-sm">{testimonial.name}</p>
                                    <p className="text-sm text-muted-foreground font-medium">
                                        {testimonial.role}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    )
}