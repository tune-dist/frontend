'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
    Mail,
    Send,
    Loader2,
    MessageSquare,
    Instagram,
    Youtube,
    Linkedin,
    MapPin,
    Phone
} from 'lucide-react'

const SpotifyIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.306c-.22.36-.68.473-1.04.253-2.884-1.763-6.512-2.162-10.785-1.183-.41.094-.823-.16-.917-.57-.094-.41.16-.823.57-.917 4.675-1.07 8.683-.62 11.92 1.36.36.22.473.68.252 1.04zm1.47-3.26c-.276.45-.86.593-1.31.317-3.298-2.028-8.326-2.617-12.23-1.433-.51.155-1.04-.138-1.194-.648-.154-.51.138-1.04.648-1.194 4.453-1.353 10.003-.703 13.77 1.614.45.276.593.86.316 1.31zm.126-3.415c-3.955-2.348-10.48-2.564-14.26-1.417-.607.184-1.25-.16-1.435-.767-.184-.607.16-1.25.767-1.435 4.34-1.318 11.536-1.066 16.085 1.633.546.324.726 1.03.402 1.576-.324.546-1.03.726-1.576.41z"/>
    </svg>
)

const XIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z"/>
    </svg>
)
import toast from 'react-hot-toast'

const contactInfo = [
    {
        icon: Mail,
        label: 'Email',
        value: 'support@kratolib.com',
        href: 'mailto:support@kratolib.com',
    },
    {
        icon: Phone,
        label: 'Phone',
        value: '02717448117',
        href: 'tel:02717448117',
    },
    {
        icon: MapPin,
        label: 'Office',
        value: '4044, The Retail Park Rajyash City, Bopal, Ahmedabad, Gujarat 380058',
        href: '#',
    },
]

const socialLinks = [
    { icon: Youtube, label: 'YouTube', href: 'https://youtube.com/@kratolib', color: 'hover:text-red-500' },
    { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/kratolib', color: 'hover:text-pink-500' },
    { icon: SpotifyIcon, label: 'Spotify', href: 'https://open.spotify.com', color: 'hover:text-green-500' },
    { icon: Linkedin, label: 'LinkedIn', href: '#', color: 'hover:text-blue-600' },
    { icon: XIcon, label: 'X (Twitter)', href: '#', color: 'hover:text-foreground' },
]

import { sendContactMessage } from '@/lib/api/contact'

export default function Contact() {
    const searchParams = useSearchParams()
    const planFromUrl = searchParams.get('plan')

    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        plan: '',
    })

    // Auto-fill plan from URL
    useEffect(() => {
        if (planFromUrl) {
            setFormData(prev => ({
                ...prev,
                plan: planFromUrl
            }))
        }
    }, [planFromUrl])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await sendContactMessage(formData)
            toast.success('Message sent successfully! We\'ll get back to you soon.')
            setFormData({ name: '', email: '', subject: '', message: '', plan: '' })
        } catch (error: any) {
            console.error('Failed to send message:', error)
            toast.error(error.response?.data?.message || 'Failed to send message. Please try again later.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    return (
        <section id="contact" className="py-20 md:py-32 bg-background relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 animated-gradient-bg rounded-full blur-3xl opacity-10" />
                <div className="absolute bottom-0 left-0 w-96 h-96 animated-gradient-bg rounded-full blur-3xl opacity-10" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 font_heading">
                        Get in{' '}
                        <span className="animated-gradient">Touch</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Have questions about distributing your music? We're here to help you every step of the way.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full animated-gradient-bg flex items-center justify-center">
                                        <MessageSquare className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">Send us a message</h3>
                                        <p className="text-sm text-muted-foreground">We'll respond within 24 hours</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder="Your name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>


                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input
                                            id="subject"
                                            name="subject"
                                            placeholder="How can we help?"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows={5}
                                            placeholder="Tell us more about your inquiry..."
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                        />
                                    </div>

                                    <Button type="submit" className="w-full animated-gradient-bg border-0 text-white" size="lg" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-col justify-center"
                    >
                        <div className="mb-10">
                            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight font_heading">
                                Tell us what you <br className="hidden md:block" />
                                need and we'll <br className="hidden md:block" />
                                <span className='animated-gradient'>reply fast. </span>
                            </h3>
                            <p className="text-muted-foreground text-lg mb-0 max-w-md">
                                Distribution help, custom pricing, marketing retainers, or partnerships—drop a note and we'll route it to the right specialist.
                            </p>
                        </div>
                        <div className="space-y-8">
                            {/* Contact Details */}
                            <div className="space-y-6">
                                {contactInfo.map((item, index) => (
                                    <motion.a
                                        key={item.label}
                                        href={item.href}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                                        className="flex items-center gap-4 transition-all duration-300 group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex flex-shrink-0 items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <item.icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">{item.label}</p>
                                            <p className="font-medium group-hover:text-primary transition-colors">{item.value}</p>
                                        </div>
                                    </motion.a>
                                ))}
                            </div>

                            {/* Social Links */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.6 }}
                                className="pt-6 border-t border-border/50"
                            >
                                <p className="text-sm text-muted-foreground mb-4">Follow us on social media</p>
                                <div className="flex gap-4">
                                    {socialLinks.map((social) => (
                                        <a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 rounded-full bg-card border border-border/50 flex items-center justify-center hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 group"
                                            aria-label={social.label}
                                        >
                                            <social.icon className={`h-5 w-5 transition-colors ${social.color || 'text-muted-foreground group-hover:text-primary'}`} />
                                        </a>
                                    ))}
                                </div>
                            </motion.div>


                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
