'use client'

import { useState } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { Info, Lock, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UploadFormData } from './upload-form.schema'
import { getDefaultLabelName } from '@/lib/validation/label-name'
import { saveReleaseMetadata } from '@/lib/api/users'
import { getErrorMessage } from '@/lib/get-error-message'
import { dispatchAuthUserUpdated } from '@/lib/auth-session'
import { setAuthUserCookie } from '@/lib/auth-cookies'

export default function ReleaseMetadataBlock() {
  const { user } = useAuth()
  const {
    control,
    getValues,
    formState: { errors },
  } = useFormContext<UploadFormData>()

  const [showInfo, setShowInfo] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const planKey = user?.plan || 'free'
  const isFreePlan = planKey === 'free'
  const defaultLabel = getDefaultLabelName()
  const isLocked = isFreePlan || Boolean(user?.releaseMetadataLocked)
  const canSave = !isFreePlan && !user?.releaseMetadataLocked
  const hasSavedMetadata = Boolean(user?.savedLabelName)
  const isFirstTimePaidSetup = canSave && !hasSavedMetadata
  const isPaidUpgradeReedit = canSave && hasSavedMetadata

  const handleSave = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault()
    event?.stopPropagation()

    const labelName = getValues('labelName')?.trim() || ''
    const copyright = getValues('copyright')?.trim() || ''
    const publisher = getValues('producers.0')?.trim() || ''

    if (!labelName || !copyright || !publisher) {
      toast.error('Please fill in Label Name, C-Line, and P-Line.')
      return
    }

    setIsSaving(true)
    try {
      const updatedUser = await saveReleaseMetadata({ labelName, copyright, publisher })
      setAuthUserCookie(updatedUser)
      dispatchAuthUserUpdated(updatedUser)
      toast.success('Saved. These values are now locked for all your releases.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save release metadata'))
    } finally {
      setIsSaving(false)
    }
  }

  const lockFieldProps = isLocked
    ? {
        readOnly: true,
        onPaste: (event: React.ClipboardEvent) => event.preventDefault(),
        onKeyDown: (event: React.KeyboardEvent) => event.preventDefault(),
      }
    : {}

  return (
    <div
      id="release-metadata-block"
      className="space-y-4 pt-6 border-t border-border rounded-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold flex items-center gap-2">
            Label &amp; Copyright Details
            {isLocked && !isFreePlan && (
              <Lock className="h-4 w-4 text-muted-foreground" aria-label="Locked" />
            )}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            Set once for all your releases. Free plan uses the default label.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8"
          onClick={() => setShowInfo(true)}
          aria-label="About label and copyright fields"
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
        <div className="space-y-2">
          <Label htmlFor="labelName">
            Label Name <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="labelName"
            control={control}
            render={({ field }) => (
              <Input
                id="labelName"
                placeholder="Enter label name"
                value={isFreePlan ? defaultLabel : (field.value ?? '')}
                onChange={(event) => {
                  if (isLocked) return
                  field.onChange(event.target.value)
                }}
                onBlur={field.onBlur}
                {...lockFieldProps}
                className={errors.labelName ? 'border-red-500' : ''}
              />
            )}
          />
          {errors.labelName && (
            <p className="text-xs text-red-500">{errors.labelName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="copyright">C-Line © <span className="text-red-500">*</span></Label>
          <Controller
            name="copyright"
            control={control}
            render={({ field }) => (
              <Input
                id="copyright"
                placeholder="© Your label name"
                value={isFreePlan ? defaultLabel : (field.value ?? '')}
                onChange={(event) => {
                  if (isLocked) return
                  field.onChange(event.target.value)
                }}
                onBlur={field.onBlur}
                {...lockFieldProps}
                className={errors.copyright ? 'border-red-500' : ''}
              />
            )}
          />
          {errors.copyright && (
            <p className="text-xs text-red-500">{errors.copyright.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="producers">P-Line ℗ <span className="text-red-500">*</span></Label>
          <Controller
            name="producers.0"
            control={control}
            render={({ field }) => (
              <Input
                id="producers"
                placeholder="℗ Your label name"
                value={isFreePlan ? defaultLabel : (field.value ?? '')}
                onChange={(event) => {
                  if (isLocked) return
                  field.onChange(event.target.value)
                }}
                onBlur={field.onBlur}
                {...lockFieldProps}
              />
            )}
          />
          {errors.producers && (
            <p className="text-xs text-red-500">
              {typeof errors.producers === 'object' && 'message' in errors.producers
                ? String(errors.producers.message)
                : Array.isArray(errors.producers) && errors.producers[0]?.message
                  ? errors.producers[0].message
                  : 'P-Line is required'}
            </p>
          )}
        </div>

        {canSave && (
          <div className="flex justify-end pt-1">
            <Button type="button" size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save & Lock'
              )}
            </Button>
          </div>
        )}

        {isFreePlan && (
          <p className="text-xs text-muted-foreground">
            Free plan releases use the default label ({defaultLabel}). Upgrade to set your own
            label, C-Line, and P-Line.
          </p>
        )}

        {isFirstTimePaidSetup && (
          <p className="text-xs text-amber-600">
            You upgraded from free — enter your label, C-Line, and P-Line, then save before
            continuing. After saving, they are locked for all releases.
          </p>
        )}

        {isPaidUpgradeReedit && (
          <p className="text-xs text-amber-600">
            Your plan was upgraded — you can update these values once. Save before continuing.
          </p>
        )}
      </div>

      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Label, C-Line &amp; P-Line</DialogTitle>
            <DialogDescription>
              How label and copyright details work on KratoLib.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              These three fields identify your label and copyright on every release you
              distribute through KratoLib.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Free plan:</strong> all releases use the default label (
                {defaultLabel}). Nothing is saved to your profile.
              </li>
              <li>
                <strong>Upgrade from free:</strong> after upgrading to a paid plan, enter your
                own label name, C-Line (©), and P-Line (℗), then tap{' '}
                <strong>Save &amp; Lock</strong>. You must save before moving to the next step.
                Nothing is saved while you are on the free plan.
              </li>
              <li>
                After saving, values are locked on your account and prefilled on every new
                release.
              </li>
              <li>
                <strong>Upgrade between paid plans:</strong> if you already saved and locked
                values, upgrading to a higher paid plan gives you one more chance to update and
                save them.
              </li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
