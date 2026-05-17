import { Card, CardContent } from '@/components/ui/card'
import { Quote } from 'lucide-react'
import { Testimonial } from '@/lib/api/testimonials'
import Image from 'next/image'

interface TestiCardProps {
    testimonial: Testimonial;
}

export default function TestiCard({ testimonial }: TestiCardProps) {
    if (!testimonial) {
        return null;
    }

    return (
        <Card className="h-full border-white/20 hover:border-white/50 transition-colors duration-300 bg-card/50 backdrop-blur-sm w-full mx-auto rounded-2xl">
            <CardContent className="flex flex-col h-full p-6">
                <Quote className="h-8 w-8 text-primary/50 mb-4 shrink-0" />
                <p className="text-muted-foreground mb-6 text-left text-sm font-normal flex-grow">
                    "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                        {testimonial.image ? (
                            <Image
                                src={testimonial.image}
                                alt={testimonial.name}
                                width={48}
                                height={48}
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
    )
}