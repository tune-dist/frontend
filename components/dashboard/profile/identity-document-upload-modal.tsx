'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AlertCircle, CheckCircle2, ClipboardCheck, Loader2, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  IdentityValidationIssue,
  IdentityValidationResponse,
  ProfileVerificationRequest,
  submitVerificationRequest,
  validateIdentityDocument,
  VerificationDocumentType,
} from '@/lib/api/profile-verifications'
import {
  mergeIdentityDetails,
  type IdentityDocumentDetails,
} from '@/lib/verification-details'
import { uploadFileDirectly } from '@/lib/upload/chunk-uploader'
import {
  getVerificationFileError,
  VERIFICATION_FILE_ACCEPT,
  VERIFICATION_FILE_HINT,
} from '@/lib/verification-document'
import {
  aadhaarUploadIssues,
  getIdentityRequirements,
  getIdentityRequirementStatus,
} from '@/lib/identity-document-requirements'
import { getErrorMessage } from '@/lib/get-error-message'

interface IdentityDocumentUploadModalProps {
  open: boolean
  documentType: VerificationDocumentType | null
  onOpenChange: (open: boolean) => void
  onSubmitted: (request: ProfileVerificationRequest) => Promise<void> | void
}

export function IdentityDocumentUploadModal({
  open,
  documentType,
  onOpenChange,
  onSubmitted,
}: IdentityDocumentUploadModalProps) {
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [frontValidation, setFrontValidation] =
    useState<IdentityValidationResponse | null>(null)
  const [backValidation, setBackValidation] =
    useState<IdentityValidationResponse | null>(null)
  const [validatingSide, setValidatingSide] = useState<'front' | 'back' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isPan = documentType === VerificationDocumentType.PAN
  const label = isPan ? 'PAN Card' : 'Aadhaar Card'
  const requirements = documentType ? getIdentityRequirements(documentType) : []
  const mergedDetails = mergeIdentityDetails(
    frontValidation?.extractedDetails,
    backValidation?.extractedDetails,
  )
  const aadhaarReady =
    Boolean(mergedDetails.numberMasked) &&
    Boolean(mergedDetails.name) &&
    Boolean(mergedDetails.address)
  const visibleIssues = isPan
    ? frontValidation?.issues || []
    : aadhaarUploadIssues(mergedDetails, Boolean(frontFile), Boolean(backFile))
  const issueCodes = isPan
    ? (frontValidation?.issues || []).map((issue) => issue.code)
    : visibleIssues.map((issue) => issue.code)
  const hasBlockingErrors = visibleIssues.some((issue) => issue.severity === 'error')
  const onlyNeedsOtherSide =
    !isPan &&
    visibleIssues.length > 0 &&
    visibleIssues.every(
      (issue) =>
        issue.code === 'AADHAAR_BACK_MISSING' ||
        issue.code === 'AADHAAR_FRONT_MISSING',
    )
  const showIssues = visibleIssues.length > 0
  const issuesAreErrors = hasBlockingErrors && !onlyNeedsOtherSide
  let issuesTitle = 'Validation warnings'
  if (onlyNeedsOtherSide) {
    issuesTitle = 'Upload the other side'
  } else if (issuesAreErrors) {
    issuesTitle = `${label} rejected`
  }
  const canSubmit = isPan
    ? Boolean(frontFile && frontValidation && !hasBlockingErrors)
    : Boolean((frontFile || backFile) && aadhaarReady)
  const busy = Boolean(validatingSide) || isSubmitting

  const resetState = () => {
    setFrontFile(null)
    setBackFile(null)
    setFrontValidation(null)
    setBackValidation(null)
    setValidatingSide(null)
    setIsSubmitting(false)
  }

  const closeModal = () => {
    if (busy) return
    resetState()
    onOpenChange(false)
  }

  const runValidation = async (file: File, side: 'front' | 'back') => {
    if (!documentType) return

    const fileError = getVerificationFileError(file)
    if (fileError) {
      toast.error(fileError)
      if (side === 'back') {
        setBackFile(null)
        setBackValidation(null)
      } else {
        setFrontFile(null)
        setFrontValidation(null)
      }
      return
    }

    if (side === 'back') {
      setBackFile(file)
      setBackValidation(null)
    } else {
      setFrontFile(file)
      setFrontValidation(null)
    }

    const existingDetails =
      side === 'back'
        ? frontValidation?.extractedDetails
        : backValidation?.extractedDetails

    setValidatingSide(side)
    try {
      const result = await validateIdentityDocument(
        documentType,
        file,
        existingDetails,
      )
      if (side === 'back') {
        setBackValidation(result)
      } else {
        setFrontValidation(result)
      }
      if (result.status === 'approved') {
        toast.success(`${label} validated successfully`)
      }
    } catch (error) {
      if (side === 'back') {
        setBackFile(null)
        setBackValidation(null)
      } else {
        setFrontFile(null)
        setFrontValidation(null)
      }
      toast.error(getErrorMessage(error, 'Failed to validate document'))
    } finally {
      setValidatingSide(null)
    }
  }

  const handleSubmit = async () => {
    if (!documentType || !canSubmit) {
      toast.error('Upload a valid document before continuing')
      return
    }

    const profileFile = frontFile || backFile
    if (!profileFile) {
      toast.error('Upload a valid document before continuing')
      return
    }

    setIsSubmitting(true)
    try {
      const uploadType = documentType === VerificationDocumentType.PAN ? 'pan' : 'aadhar'
      const uploadResult = await uploadFileDirectly(profileFile, '', undefined, uploadType)
      const submitted = await submitVerificationRequest({
        documentType,
        document: {
          url: uploadResult.path,
          filename: profileFile.name,
          uploadedAt: new Date().toISOString(),
        },
        extractedDetails: isPan
          ? frontValidation?.extractedDetails
          : mergedDetails,
      })
      await onSubmitted(submitted)
      resetState()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to upload verification document'))
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          closeModal()
          return
        }
        onOpenChange(true)
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload {label}</DialogTitle>
          <DialogDescription>
            {isPan
              ? 'Upload the front of your PAN card. We will read the details from the file.'
              : 'Upload the front of your Aadhaar card, then the back. If the front already has both sides, you can continue.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <DocumentSideDropzone
            inputId="verificationDocFrontUpload"
            label={isPan ? 'PAN card (front)' : 'Aadhaar card (front)'}
            file={frontFile}
            isValidating={validatingSide === 'front'}
            disabled={busy}
            onFile={(file) => {
              void runValidation(file, 'front')
            }}
          />

          {!isPan ? (
            <DocumentSideDropzone
              inputId="verificationDocBackUpload"
              label="Aadhaar card (back)"
              file={backFile}
              isValidating={validatingSide === 'back'}
              disabled={busy}
              onFile={(file) => {
                void runValidation(file, 'back')
              }}
            />
          ) : null}

          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wide">
                {isPan ? 'PAN requirements' : 'Aadhaar requirements'}
              </h3>
            </div>
            <ul className="space-y-2">
              {requirements.map((requirement) => {
                const status = getIdentityRequirementStatus(
                  requirement.codes,
                  Boolean(frontValidation || backValidation),
                  issueCodes,
                )
                return (
                  <li key={requirement.id} className="flex items-start gap-2 text-sm">
                    <RequirementIcon status={validatingSide ? 'pending' : status} />
                    <span className="text-muted-foreground">{requirement.label}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          {showIssues ? (
            <div
              className={`p-4 rounded-xl border space-y-3 ${
                issuesAreErrors
                  ? 'border-red-500/30 bg-red-500/5'
                  : 'border-amber-500/30 bg-amber-500/5'
              }`}
            >
              <div
                className={`flex items-center gap-2 ${
                  issuesAreErrors ? 'text-red-400' : 'text-amber-500'
                }`}
              >
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-semibold">{issuesTitle}</h3>
              </div>
              <ul className="space-y-1.5">
                {visibleIssues.map((issue: IdentityValidationIssue) => (
                  <li key={issue.code} className="text-sm text-muted-foreground">
                    {issue.severity === 'error' ? 'Error: ' : 'Warning: '}
                    {issue.message}
                  </li>
                ))}
              </ul>
              {hasBlockingErrors && isPan ? (
                <p className="text-xs text-muted-foreground">
                  We need a PAN number from this file to continue.
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={closeModal} className="flex-1" disabled={busy}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={busy || !canSubmit}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : validatingSide ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Upload & Verify'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DocumentSideDropzone({
  inputId,
  label,
  file,
  isValidating,
  disabled,
  onFile,
}: {
  inputId: string
  label: string
  file: File | null
  isValidating: boolean
  disabled: boolean
  onFile: (file: File) => void
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className={`border-2 border-dashed rounded-xl text-center transition-all duration-300 overflow-hidden ${
          disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
        } ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-card/20'}`}
        onClick={() => {
          if (!disabled) {
            document.getElementById(inputId)?.click()
          }
        }}
        onDrop={(event) => {
          event.preventDefault()
          if (disabled) return
          const dropped = event.dataTransfer.files?.[0]
          if (dropped) onFile(dropped)
        }}
        onDragOver={(event) => event.preventDefault()}
      >
        <input
          id={inputId}
          type="file"
          className="hidden"
          accept={VERIFICATION_FILE_ACCEPT}
          disabled={disabled}
          onChange={(event) => {
            const selected = event.target.files?.[0]
            event.target.value = ''
            if (selected) onFile(selected)
          }}
        />
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt={file?.name || 'Document preview'}
              className="w-full max-h-56 object-contain bg-black/20"
              onError={() => setPreviewUrl(null)}
            />
            {isValidating ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            ) : null}
            <p className="py-2 text-xs text-muted-foreground">
              {isValidating ? 'Validating document...' : 'Click or drag to change'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              {isValidating ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <UploadCloud className="h-6 w-6" />
              )}
            </div>
            {file ? (
              <div className="space-y-1">
                <p className="font-medium text-sm text-primary">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {isValidating ? 'Validating document...' : 'Click or drag to change'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-medium text-sm">Drag & drop your document</p>
                <p className="text-xs text-muted-foreground">{VERIFICATION_FILE_HINT}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function RequirementIcon({ status }: { status: 'pending' | 'success' | 'error' }) {
  if (status === 'success') {
    return (
      <div className="mt-0.5 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
        <CheckCircle2 className="h-3 w-3 stroke-[3px]" />
      </div>
    )
  }
  if (status === 'error') {
    return (
      <div className="mt-0.5 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0">
        <AlertCircle className="h-3 w-3" />
      </div>
    )
  }
  return (
    <div className="mt-0.5 h-5 w-5 rounded-full border-2 border-primary/40 flex items-center justify-center shrink-0">
      <div className="w-2 h-2 rounded-full bg-primary/30" />
    </div>
  )
}
