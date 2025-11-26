'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Upload, Music, Image as ImageIcon, Info, Calendar, Users, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

const steps = [
  { id: 1, name: 'Basic Info', icon: Info },
  { id: 2, name: 'Audio File', icon: Music },
  { id: 3, name: 'Cover Art', icon: ImageIcon },
  { id: 4, name: 'Release Details', icon: Calendar },
  { id: 5, name: 'Credits', icon: Users },
  { id: 6, name: 'Review', icon: CheckCircle },
]

export default function UploadPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<any>({
    // Basic Info
    title: '',
    artistName: '',
    genres: [],
    language: 'English',
    releaseType: 'single',
    isExplicit: false,
    
    // Files (these would be uploaded via API)
    audioFile: null,
    coverArt: null,
    
    // Release Details
    releaseDate: '',
    
    // Credits
    producers: [],
    writers: [],
  })

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    toast.error('Upload endpoint not yet implemented. Backend needs to be completed first.')
    // This will be implemented once the backend upload endpoints are ready
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Basic Information</h3>
            <p className="text-muted-foreground">Let's start with the basics about your release</p>
            
            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="title">Track/Album Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="artistName">Artist Name *</Label>
                <Input
                  id="artistName"
                  placeholder="Your artist name"
                  value={formData.artistName}
                  onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="releaseType">Release Type *</Label>
                <select
                  id="releaseType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.releaseType}
                  onChange={(e) => setFormData({ ...formData, releaseType: e.target.value })}
                >
                  <option value="single">Single</option>
                  <option value="ep">EP</option>
                  <option value="album">Album</option>
                  <option value="compilation">Compilation</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language *</Label>
                <Input
                  id="language"
                  placeholder="e.g., English"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isExplicit"
                  checked={formData.isExplicit}
                  onChange={(e) => setFormData({ ...formData, isExplicit: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="isExplicit">Contains explicit content</Label>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Audio File Upload</h3>
            <p className="text-muted-foreground">Upload your high-quality audio file</p>
            
            <div className="mt-6">
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Drag & drop your audio file here</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supported formats: WAV, MP3, FLAC, AIFF (Max 500MB)
                </p>
                <Button variant="outline">Browse Files</Button>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-600 dark:text-yellow-500">
                  <strong>Note:</strong> Upload endpoints are not yet implemented in the backend. 
                  This feature will be available once the backend upload module is completed.
                </p>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Cover Art Upload</h3>
            <p className="text-muted-foreground">Add eye-catching cover art for your release</p>
            
            <div className="mt-6">
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Upload your cover art</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Required: 3000x3000px, JPG or PNG (Max 10MB)
                </p>
                <Button variant="outline">Browse Images</Button>
              </div>
              
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-500">
                  <strong>Tip:</strong> Use high-resolution square images (1:1 aspect ratio) for best results across all platforms.
                </p>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Release Details</h3>
            <p className="text-muted-foreground">When do you want to release your music?</p>
            
            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="releaseDate">Release Date *</Label>
                <Input
                  id="releaseDate"
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 7 days from today
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="genres">Genres *</Label>
                <Input
                  id="genres"
                  placeholder="e.g., Pop, Electronic (comma-separated)"
                  onChange={(e) => setFormData({ ...formData, genres: e.target.value.split(',').map((g: string) => g.trim()) })}
                />
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Credits & Metadata</h3>
            <p className="text-muted-foreground">Give credit to everyone involved</p>
            
            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="producers">Producers (Optional)</Label>
                <Input
                  id="producers"
                  placeholder="Comma-separated names"
                  onChange={(e) => setFormData({ ...formData, producers: e.target.value.split(',').map((p: string) => p.trim()) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="writers">Writers/Composers (Optional)</Label>
                <Input
                  id="writers"
                  placeholder="Comma-separated names"
                  onChange={(e) => setFormData({ ...formData, writers: e.target.value.split(',').map((w: string) => w.trim()) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="copyright">Copyright (Optional)</Label>
                <Input
                  id="copyright"
                  placeholder="© 2025 Your Name"
                  value={formData.copyright}
                  onChange={(e) => setFormData({ ...formData, copyright: e.target.value })}
                />
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Review & Submit</h3>
            <p className="text-muted-foreground">Review your release information before submitting</p>
            
            <div className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Release Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Title:</span>
                    <span className="font-medium">{formData.title || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Artist:</span>
                    <span className="font-medium">{formData.artistName || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium capitalize">{formData.releaseType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Release Date:</span>
                    <span className="font-medium">{formData.releaseDate || 'Not set'}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-600 dark:text-yellow-500">
                  <strong>Backend Integration Required:</strong> The upload and submission features require the backend upload endpoints to be completed first.
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold mb-2">
            <span className="animated-gradient">Upload</span> New Release
          </h1>
          <p className="text-muted-foreground">
            Follow the steps to upload and distribute your music
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = step.id === currentStep
                  const isCompleted = step.id < currentStep
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : isCompleted
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs mt-2 text-center max-w-[80px]">{step.name}</span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`h-0.5 w-12 mx-2 ${
                            isCompleted ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Step Content */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              {renderStepContent()}
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Save as Draft
            </Button>

            {currentStep < steps.length ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                Submit for Review
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}

