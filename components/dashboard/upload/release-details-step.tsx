'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UploadFormData } from './types'

interface ReleaseDetailsStepProps {
    formData: UploadFormData
    setFormData: (data: UploadFormData) => void
}

export default function ReleaseDetailsStep({ formData, setFormData }: ReleaseDetailsStepProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Release Details</h3>
            <p className="text-muted-foreground">When do you want to release your music?</p>
            {/* Previously Released */}
            <div className="space-y-3 pt-6 border-t border-border">
                <Label className="text-lg font-semibold">
                    Has this single been previously released?
                </Label>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id="previouslyReleased-no"
                            name="previouslyReleased"
                            value="no"
                            checked={formData.previouslyReleased === 'no'}
                            onChange={(e) => setFormData({ ...formData, previouslyReleased: e.target.value })}
                            className="h-4 w-4 border-primary text-primary focus:ring-primary"
                        />
                        <Label htmlFor="previouslyReleased-no" className="font-normal cursor-pointer">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id="previouslyReleased-yes"
                            name="previouslyReleased"
                            value="yes"
                            checked={formData.previouslyReleased === 'yes'}
                            onChange={(e) => setFormData({ ...formData, previouslyReleased: e.target.value })}
                            className="h-4 w-4 border-primary text-primary focus:ring-primary"
                        />
                        <Label htmlFor="previouslyReleased-yes" className="font-normal cursor-pointer">Yes</Label>
                    </div>
                </div>
            </div>
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

                <div className="space-y-3">
                    <Label htmlFor="primaryGenre" className="text-lg font-semibold">
                        Primary genre
                    </Label>
                    <select
                        id="primaryGenre"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={formData.primaryGenre}
                        onChange={(e) => setFormData({ ...formData, primaryGenre: e.target.value })}
                    >
                        <option value="">Select a genre</option>
                        <option value="pop">Pop</option>
                        <option value="rock">Rock</option>
                        <option value="hip-hop">Hip-Hop/Rap</option>
                        <option value="electronic">Electronic</option>
                        <option value="r&b">R&B/Soul</option>
                        <option value="country">Country</option>
                        <option value="jazz">Jazz</option>
                        <option value="classical">Classical</option>
                        <option value="indie">Indie</option>
                        <option value="alternative">Alternative</option>
                        <option value="folk">Folk</option>
                        <option value="reggae">Reggae</option>
                        <option value="latin">Latin</option>
                        <option value="world">World</option>
                        <option value="metal">Metal</option>
                        <option value="blues">Blues</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="space-y-3">
                    <Label htmlFor="secondaryGenre" className="text-lg font-semibold">
                        Secondary genre <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <select
                        id="secondaryGenre"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={formData.secondaryGenre}
                        onChange={(e) => setFormData({ ...formData, secondaryGenre: e.target.value })}
                    >
                        <option value="">Select another genre</option>
                        <option value="pop">Pop</option>
                        <option value="rock">Rock</option>
                        <option value="hip-hop">Hip-Hop/Rap</option>
                        <option value="electronic">Electronic</option>
                        <option value="r&b">R&B/Soul</option>
                        <option value="country">Country</option>
                        <option value="jazz">Jazz</option>
                        <option value="classical">Classical</option>
                        <option value="indie">Indie</option>
                        <option value="alternative">Alternative</option>
                        <option value="folk">Folk</option>
                        <option value="reggae">Reggae</option>
                        <option value="latin">Latin</option>
                        <option value="world">World</option>
                        <option value="metal">Metal</option>
                        <option value="blues">Blues</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
        </div>
    )
}
