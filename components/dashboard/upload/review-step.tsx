import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { UploadFormData, MandatoryChecks } from './types'

interface ReviewStepProps {
    formData: UploadFormData
    mandatoryChecks: MandatoryChecks
    setMandatoryChecks: (checks: MandatoryChecks) => void
}

export default function ReviewStep({ formData, mandatoryChecks, setMandatoryChecks }: ReviewStepProps) {
    const hasIrregularCapitalization = (text: string) => {
        if (!text) return false
        return /[a-z][A-Z]/.test(text) || (text === text.toUpperCase() && text.length > 3)
    }

    const needsCapitalizationCheck = hasIrregularCapitalization(formData.title) || hasIrregularCapitalization(formData.artistName)
    const isYoutubeSelected = formData.selectedPlatforms?.includes('YouTube Music') || formData.youtubeMusicProfile !== '' // Approximation

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">Review & Submit</h3>
            <p className="text-muted-foreground">Review your release information before submitting</p>

            <div className="space-y-4">
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
                        {/* <div className="flex justify-between">
                            <span className="text-muted-foreground">Release Date:</span>
                            <span className="font-medium">{formData.releaseDate || 'Not set'}</span>
                        </div> */}
                    </CardContent>
                </Card>

                {/* Mandatory Checks from original upload page */}
                <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                    <h3 className="text-lg font-semibold">Final Checks</h3>

                    {/* Conditional: Capitalization Confirmation */}
                    {needsCapitalizationCheck && (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg space-y-3">
                            <p className="text-sm text-yellow-600 dark:text-yellow-500 font-medium">
                                We detected non-standard capitalization in your title or artist name.
                            </p>
                            <div className="flex items-start space-x-3">
                                <input
                                    type="checkbox"
                                    id="capitalizationConfirmation"
                                    checked={mandatoryChecks.capitalizationConfirmation}
                                    onChange={(e) => setMandatoryChecks({ ...mandatoryChecks, capitalizationConfirmation: e.target.checked })}
                                    className="h-4 w-4 mt-1 rounded border-input text-primary focus:ring-2 focus:ring-primary"
                                />
                                <Label htmlFor="capitalizationConfirmation" className="text-sm leading-relaxed cursor-pointer">
                                    I confirm that the capitalization is intentional and correct.
                                </Label>
                            </div>
                        </div>
                    )}


                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <input
                                type="checkbox"
                                id="promoServices"
                                checked={mandatoryChecks.promoServices}
                                onChange={(e) => setMandatoryChecks({ ...mandatoryChecks, promoServices: e.target.checked })}
                                className="h-4 w-4 mt-1 rounded border-input text-primary focus:ring-2 focus:ring-primary"
                            />
                            <Label htmlFor="promoServices" className="text-sm leading-relaxed cursor-pointer">
                                I understand that Tuneflow is a music distributor, not a promotion service. I am responsible for marketing my own music.
                            </Label>
                        </div>

                        <div className="flex items-start space-x-3">
                            <input
                                type="checkbox"
                                id="rightsAuthorization"
                                checked={mandatoryChecks.rightsAuthorization}
                                onChange={(e) => setMandatoryChecks({ ...mandatoryChecks, rightsAuthorization: e.target.checked })}
                                className="h-4 w-4 mt-1 rounded border-input text-primary focus:ring-2 focus:ring-primary"
                            />
                            <Label htmlFor="rightsAuthorization" className="text-sm leading-relaxed cursor-pointer">
                                I confirm that I control all rights to this music (recording, composition, lyrics, and artwork) and I authorize Tuneflow to distribute it to the selected stores.
                            </Label>
                        </div>

                        <div className="flex items-start space-x-3">
                            <input
                                type="checkbox"
                                id="nameUsage"
                                checked={mandatoryChecks.nameUsage}
                                onChange={(e) => setMandatoryChecks({ ...mandatoryChecks, nameUsage: e.target.checked })}
                                className="h-4 w-4 mt-1 rounded border-input text-primary focus:ring-2 focus:ring-primary"
                            />
                            <Label htmlFor="nameUsage" className="text-sm leading-relaxed cursor-pointer">
                                I will not use another artist's name or a famous band name without their written permission.
                            </Label>
                        </div>

                        <div className="flex items-start space-x-3">
                            <input
                                type="checkbox"
                                id="termsAgreement"
                                checked={mandatoryChecks.termsAgreement}
                                onChange={(e) => setMandatoryChecks({ ...mandatoryChecks, termsAgreement: e.target.checked })}
                                className="h-4 w-4 mt-1 rounded border-input text-primary focus:ring-2 focus:ring-primary"
                            />
                            <Label htmlFor="termsAgreement" className="text-sm leading-relaxed cursor-pointer">
                                I have read and agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                            </Label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
