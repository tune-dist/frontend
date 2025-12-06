'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UploadFormData, Songwriter } from './types'

interface CreditsStepProps {
    formData: UploadFormData
    setFormData: (data: UploadFormData) => void
    songwriters: Songwriter[]
    setSongwriters: (data: Songwriter[]) => void
}

export default function CreditsStep({ formData, setFormData, songwriters, setSongwriters }: CreditsStepProps) {

    const addSongwriter = () => {
        setSongwriters([...songwriters, {
            role: 'Music and lyrics',
            firstName: '',
            middleName: '',
            lastName: ''
        }])
    }

    const updateSongwriter = (index: number, field: keyof Songwriter, value: string) => {
        const updated = [...songwriters]
        updated[index] = { ...updated[index], [field]: value }
        setSongwriters(updated)
    }

    const removeSongwriter = (index: number) => {
        if (songwriters.length > 1) {
            setSongwriters(songwriters.filter((_, i) => i !== index))
        }
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Credits & Metadata</h3>
            <p className="text-muted-foreground">Give credit to everyone involved</p>

            <div className="space-y-4 mt-6">
                <div className="space-y-4 pt-6 border-t border-border">
                    <div>
                        <Label className="text-lg font-semibold">
                            Songwriter(s) real name
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                            Real names, not stage names <a href="#" className="text-primary hover:underline">(why?)</a>
                        </p>
                    </div>

                    {songwriters.map((songwriter, index) => (
                        <div key={index} className="space-y-3 p-4 rounded-lg border border-border bg-accent/5">
                            {/* Role Dropdown */}
                            <div className="space-y-2">
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={songwriter.role}
                                    onChange={(e) => updateSongwriter(index, 'role', e.target.value)}
                                >
                                    <option value="Music and lyrics">Music and lyrics</option>
                                    <option value="Music only">Music only</option>
                                    <option value="Lyrics only">Lyrics only</option>
                                    <option value="Producer">Producer</option>
                                    <option value="Composer">Composer</option>
                                </select>
                            </div>

                            {/* Name Fields */}
                            <div className="grid grid-cols-3 gap-3">
                                <Input
                                    placeholder="First name"
                                    value={songwriter.firstName}
                                    onChange={(e) => updateSongwriter(index, 'firstName', e.target.value)}
                                    className="text-sm"
                                />
                                <Input
                                    placeholder="Middle name"
                                    value={songwriter.middleName}
                                    onChange={(e) => updateSongwriter(index, 'middleName', e.target.value)}
                                    className="text-sm"
                                />
                                <Input
                                    placeholder="Last name"
                                    value={songwriter.lastName}
                                    onChange={(e) => updateSongwriter(index, 'lastName', e.target.value)}
                                    className="text-sm"
                                />
                            </div>

                            {/* Remove Button (only show if more than one songwriter) */}
                            {songwriters.length > 1 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeSongwriter(index)}
                                    className="text-destructive hover:text-destructive"
                                    type="button"
                                >
                                    Remove songwriter
                                </Button>
                            )}
                        </div>
                    ))}

                    {/* Add Another Songwriter Button */}
                    <Button
                        variant="outline"
                        onClick={addSongwriter}
                        className="text-primary hover:text-primary"
                        type="button"
                    >
                        + Add another songwriter
                    </Button>
                </div>
                {/* Instrumental */}
                <div className="space-y-3 pt-6 border-t border-border">
                    <Label className="text-lg font-semibold">
                        Instrumental?
                    </Label>

                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="instrumentalNo"
                                name="instrumental"
                                value="no"
                                checked={formData.instrumental === 'no'}
                                onChange={(e) => setFormData({ ...formData, instrumental: e.target.value })}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="instrumentalNo" className="font-normal cursor-pointer">
                                This song contains lyrics
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="instrumentalYes"
                                name="instrumental"
                                value="yes"
                                checked={formData.instrumental === 'yes'}
                                onChange={(e) => setFormData({ ...formData, instrumental: e.target.value })}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="instrumentalYes" className="font-normal cursor-pointer">
                                This song is instrumental and contains no lyrics
                            </Label>
                        </div>
                    </div>
                </div>

                {/* Preview Clip Start Time */}
                <div className="space-y-3 pt-6 border-t border-border">
                    <Label className="text-lg font-semibold">
                        Preview clip start time <span className="text-muted-foreground font-normal">(TikTok, Apple Music, iTunes)</span>
                    </Label>

                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="previewAuto"
                                name="previewClipStartTime"
                                value="auto"
                                checked={formData.previewClipStartTime === 'auto'}
                                onChange={(e) => setFormData({ ...formData, previewClipStartTime: e.target.value })}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="previewAuto" className="font-normal cursor-pointer">
                                Let streaming services decide
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="previewManual"
                                name="previewClipStartTime"
                                value="manual"
                                checked={formData.previewClipStartTime === 'manual'}
                                onChange={(e) => setFormData({ ...formData, previewClipStartTime: e.target.value })}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="previewManual" className="font-normal cursor-pointer">
                                Let me specify when the good part starts
                            </Label>
                        </div>
                    </div>
                </div>

                {/* Track Price */}
                <div className="space-y-3 pt-6 border-t border-border">
                    <Label htmlFor="trackPrice" className="text-lg font-semibold">
                        Track Price
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        iTunes and Amazon (USD)
                    </p>
                    <select
                        id="trackPrice"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        defaultValue="0.99"
                    >
                        <option value="0.69">$0.69</option>
                        <option value="0.99">$0.99</option>
                        <option value="1.29">$1.29</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                        Tracks over 10 minutes long will be priced higher.
                    </p>
                </div>

                {/* Apple Music Additional Requirements */}
                <div className="space-y-4 pt-6 border-t border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.994 6.124a9.23 9.23 0 0 0-.24-2.132c-.317-1.354-1.092-2.145-2.456-2.52A9.44 9.44 0 0 0 19.4.876C17.4.029 15.346-.235 13.27.097c-1.86.297-3.45 1.078-4.898 2.24-.627.502-1.204 1.053-1.748 1.644-.31-.737-.635-1.453-.952-2.17-.077-.174-.28-.343-.49-.396-.27-.07-.56-.02-.773.146-.204.156-.353.398-.428.649-.36 1.206-.71 2.413-1.058 3.62-.22.76-.423 1.525-.65 2.283-.246.82-.564 1.617-.908 2.4-.12.272-.23.55-.35.822-.05.115-.134.227-.227.318-.206.202-.427.218-.647.063-.17-.12-.265-.305-.314-.518-.093-.404-.16-.813-.216-1.222-.05-.362-.063-.725-.064-1.088 0-.17-.016-.344-.052-.51-.08-.369-.435-.577-.804-.465-.328.1-.52.315-.569.65-.062.426-.112.853-.162 1.28-.06.51-.112 1.02-.18 1.53-.06.452-.137.902-.218 1.351-.085.47-.18.938-.278 1.405a9.45 9.45 0 0 1-.32 1.22c-.12.345-.26.683-.41 1.015-.18.4-.39.785-.625 1.155-.29.458-.628.88-1.017 1.264-.36.356-.752.68-1.167.97-.51.358-1.058.67-1.64.925-.615.27-1.256.493-1.914.676-.724.2-1.462.355-2.213.465-.577.085-1.16.14-1.745.174a1.78 1.78 0 0 0-.456.07c-.37.114-.604.407-.615.79-.01.363.197.684.538.838.26.117.544.167.832.186.96.062 1.922.096 2.884.093 1.246-.004 2.49-.064 3.733-.19 1.354-.137 2.693-.37 4.01-.733 1.404-.387 2.76-.912 4.053-1.57 1.323-.672 2.59-1.445 3.798-2.315.93-.67 1.828-1.38 2.682-2.143.612-.548 1.203-1.116 1.767-1.708.485-.51.946-1.04 1.38-1.593.395-.504.76-1.028 1.1-1.57.28-.448.543-.904.788-1.37.208-.396.4-.8.578-1.21.15-.345.285-.696.407-1.052.105-.308.194-.62.273-.935.088-.352.164-.707.23-1.063.068-.37.124-.743.166-1.118.05-.425.082-.852.105-1.28.025-.458.036-.917.023-1.376zM13.27 3.097c1.375-.232 2.748-.19 4.115.092.715.147 1.416.352 2.098.622.306.12.597.27.87.456.272.186.514.408.71.67.175.233.307.49.395.766.093.293.152.596.18.905.053.585.018 1.168-.09 1.744-.122.646-.322 1.272-.584 1.875-.273.626-.61 1.223-1.003 1.788a10.96 10.96 0 0 1-1.363 1.64c-.524.524-1.09 1.01-1.69 1.456-.63.47-1.296.898-1.993 1.285-.71.395-1.447.75-2.208 1.065-.77.318-1.56.598-2.366.838-.825.246-1.663.45-2.513.615-.86.167-1.73.295-2.606.385-.893.092-1.79.15-2.69.178-.91.028-1.822.02-2.733-.024a15.47 15.47 0 0 1-2.712-.307c-.44-.08-.872-.19-1.296-.33-.433-.142-.85-.325-1.244-.555-.408-.238-.782-.525-1.117-.858-.348-.345-.646-.737-.885-1.17-.25-.45-.44-.932-.564-1.437-.135-.55-.21-1.113-.223-1.682-.014-.617.038-1.232.154-1.838.127-.665.328-1.313.602-1.935.285-.647.64-1.26 1.058-1.837.44-.61.947-1.17 1.51-1.678.594-.536 1.243-1.01 1.937-1.422.73-.433 1.497-.81 2.293-1.135.82-.335 1.663-.62 2.524-.86.88-.246 1.774-.448 2.68-.608.92-.163 1.848-.282 2.78-.365.95-.084 1.904-.13 2.86-.14z" />
                            </svg>
                            <h3 className="text-lg font-semibold">Apple Music</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Additional requirements</span>
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Not yet complete
                            </span>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Apple Music requires at least one performer and producer credit for each song.
                    </p>

                    <button
                        type="button"
                        className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border bg-accent/5 hover:bg-accent/10 transition-colors w-full text-left"
                    >
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                            <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-primary">Add credits for each song on this release</p>
                        </div>
                    </button>

                    <p className="text-xs text-muted-foreground">
                        To skip this step for now, simply <a href="#" className="text-primary hover:underline">deselect Apple Music and iTunes at the top of the page</a>. You can always add this release to Apple later.
                    </p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="copyright">Copyright (Optional)</Label>
                    <Input
                        id="copyright"
                        placeholder="© 2025 Your Name"
                        value={formData.copyright || ''}
                        onChange={(e) => setFormData({ ...formData, copyright: e.target.value })}
                    />
                </div>
            </div>
        </div>
    )
}
