'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { User as UserIcon, Mail, CreditCard, Loader2, Save, MapPin, FileText, Shield, CheckCircle2, UploadCloud } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { updateUserProfile, updateAddress } from '@/lib/api/users'
import {
  getVerificationRequests,
  submitVerificationRequest,
  ProfileVerificationRequest,
  VerificationDocumentType,
  VerificationRequestStatus,
} from '@/lib/api/profile-verifications'
import { uploadFileDirectly } from '@/lib/upload/chunk-uploader'
import { getDisplayUrl } from '@/lib/api/s3'
import { isAllowedVerificationFile, VERIFICATION_FILE_ACCEPT, VERIFICATION_FILE_HINT } from '@/lib/verification-document'
import { API_URL } from '@/lib/config'
import { getErrorMessage } from '@/lib/get-error-message'
import { hasPermission } from '@/lib/permissions'
import { formatPlanDisplayName } from '@/lib/utils'
import { S3Image } from '@/components/ui/s3-image'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
})

type ProfileFormData = z.infer<typeof profileSchema>

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

export default function ProfilePage() {
  const { user, refreshUser, loading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  // Phone verification — disabled for now
  // const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  // const [isSendingOTP, setIsSendingOTP] = useState(false)
  // const [showOTPModal, setShowOTPModal] = useState(false)
  // const [otp, setOtp] = useState('')
  // const [isVerifyingOTP, setIsVerifyingOTP] = useState(false)

  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [uploadDocType, setUploadDocType] = useState<VerificationDocumentType | null>(null)
  const [docFile, setDocFile] = useState<File | null>(null)
  const [verificationRequests, setVerificationRequests] = useState<ProfileVerificationRequest[]>([])
  // const [passportFile, setPassportFile] = useState<File | null>(null)
  // const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [isVerifyingProfile, setIsVerifyingProfile] = useState(false)
  const [openingVerifyDoc, setOpeningVerifyDoc] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      if (!hasPermission(user, 'PROFILE')) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  // Initialize address from user data
  useEffect(() => {
    if (user) {
      // setPhoneNumber(user.phoneNumber || '');
      setAddress(user.address || '');
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'artist') {
      getVerificationRequests()
        .then(setVerificationRequests)
        .catch(() => {});
    }
  }, [user?.role]);

  const getLatestRequest = (type: VerificationDocumentType) =>
    verificationRequests.find((request) => request.documentType === type);

  const openUploadModal = (type: VerificationDocumentType) => {
    setUploadDocType(type);
    setDocFile(null);
    setShowVerifyModal(true);
  };

  const handleVerifySubmit = async () => {
    if (!uploadDocType || !docFile) {
      toast.error('Please select a document to upload');
      return;
    }

    if (!isAllowedVerificationFile(docFile)) {
      toast.error('Please upload an image (JPG, PNG, WEBP) or PDF file');
      return;
    }

    setIsVerifyingProfile(true);
    try {
      const uploadType = uploadDocType === VerificationDocumentType.PAN ? 'pan' : 'aadhar';
      const uploadResult = await uploadFileDirectly(docFile, '', undefined, uploadType);

      const documentData = {
        url: uploadResult.path,
        filename: docFile.name,
        uploadedAt: new Date().toISOString(),
      };

      await submitVerificationRequest({
        documentType: uploadDocType,
        document: documentData,
      });

      await refreshUser();
      const requests = await getVerificationRequests();
      setVerificationRequests(requests);
      toast.success(`${uploadDocType === VerificationDocumentType.PAN ? 'PAN' : 'Aadhar'} submitted for verification`);
      setShowVerifyModal(false);
      setDocFile(null);
      setUploadDocType(null);
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, 'Failed to upload verification document'));
    } finally {
      setIsVerifyingProfile(false);
    }
  };

  /* Selfie + passport flow — disabled for now */

  /* Phone verification — disabled for now
  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsSendingOTP(true);
    try {
      const response = await sendPhoneOTP(phoneNumber);
      toast.success(response.otp
        ? `OTP sent: ${response.otp}`
        : 'OTP sent to your phone number. Please check console logs.');
      setShowOTPModal(true);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to send OTP'));
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    setIsVerifyingOTP(true);
    try {
      const result = await verifyPhoneOTP(otp);
      toast.success(result.message);
      setShowOTPModal(false);
      setOtp('');
      await refreshUser();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Invalid OTP'));
    } finally {
      setIsVerifyingOTP(false);
    }
  };
  */

  const handleUpdateAddress = async () => {
    setIsLoading(true);
    try {
      await updateUserProfile({
        address
      });

      await refreshUser();
      toast.success('Address updated successfully');
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, 'Failed to update address'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewVerifyDoc = async (url: string | undefined, type: string) => {
    if (!url) return;
    setOpeningVerifyDoc(type);
    try {
      const signedUrl = await getDisplayUrl(url);
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error('Failed to open document');
    } finally {
      setOpeningVerifyDoc(null);
    }
  };
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const result = await uploadFileDirectly(file, '', undefined, 'avatar');
      await updateUserProfile({
        avatar: result.path,
        avatarUrl: result.path
      } as any);
      toast.success('Profile picture updated successfully');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, 'Failed to upload profile picture'));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      await updateUserProfile(data)
      await refreshUser()
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update profile'))
    } finally {
      setIsLoading(false)
    }
  }

  const renderVerificationDocCard = (
    type: VerificationDocumentType,
    label: string,
    document?: { url: string; filename: string; uploadedAt: string },
    isVerified?: boolean,
  ) => {
    const latestRequest = getLatestRequest(type);
    const isPending = latestRequest?.status === VerificationRequestStatus.PENDING;
    const isRejected = latestRequest?.status === VerificationRequestStatus.REJECTED;

    return (
      <div className="flex-1 p-4 border border-border/80 rounded-lg bg-muted/30 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{label}</span>
          {isVerified ? (
            <span className="text-xs font-medium text-green-500 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verified
            </span>
          ) : isPending ? (
            <span className="text-xs font-medium text-amber-500">Pending review</span>
          ) : isRejected ? (
            <span className="text-xs font-medium text-destructive">Rejected</span>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">Not uploaded</span>
          )}
        </div>

        {document ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewVerifyDoc(document.url, type)}
            disabled={openingVerifyDoc === type}
          >
            {openingVerifyDoc === type ? <Loader2 className="h-3 w-3 animate-spin mx-4" /> : 'View'}
          </Button>
        ) : null}

        {isRejected && latestRequest?.rejectionReason ? (
          <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">
            {latestRequest.rejectionReason}
          </p>
        ) : null}

        {!isVerified ? (
          <Button size="sm" onClick={() => openUploadModal(type)} className="w-full sm:w-auto">
            <UploadCloud className="mr-2 h-4 w-4" />
            {document ? 'Re-upload' : 'Upload'}
          </Button>
        ) : null}
      </div>
    );
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

    return (
    <>
    <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold mb-2">
            <span className="animated-gradient">Profile</span> Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </motion.div>

        {/* Profile Information */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8">
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-4 order-2 md:order-1">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="flex gap-2">
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        disabled
                        className="flex-1 bg-muted"
                        {...register('fullName')}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.location.href = 'mailto:support@yourlabel.com?subject=Request Name Change'}
                      >
                        Request Change
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      To change your legal name, please contact support.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="pl-10 bg-muted"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>

                <div className="flex flex-col items-center gap-4 order-1 md:order-2">
                  <div className="relative group">
                    <div className="h-32 w-32 rounded-lg border-2 border-dashed border-border overflow-hidden bg-muted flex items-center justify-center relative">
                      {user?.avatar ? (
                        <S3Image
                          src={user.avatar}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-12 w-12 text-muted-foreground" />
                      )}
                      
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    
                    <input
                      id="avatarUpload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => document.getElementById('avatarUpload')?.click()}
                      disabled={isUploadingAvatar}
                    >
                      {user?.avatar ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    
                    <p className="text-[10px] text-muted-foreground mt-2 text-center max-w-[128px]">
                      Recommended: Square image, max 2MB.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Phone Verification — disabled for now
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Phone Verification
              </CardTitle>
              <CardDescription>
                Verify your phone number for enhanced security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={user?.isPhoneVerified}
                    className={user?.isPhoneVerified ? 'bg-muted' : ''}
                  />
                  {user?.isPhoneVerified ? (
                    <Button variant="outline" disabled className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Verified
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSendOTP}
                      disabled={isSendingOTP || !phoneNumber}
                      className="flex items-center gap-2"
                    >
                      {isSendingOTP ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4" />
                          Verify
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {user?.isPhoneVerified && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ✓ Your phone number has been verified
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        */}

        {/* Address Information */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
              <CardDescription>
                Update your residential address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your full address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleUpdateAddress}
                disabled={isLoading || !address}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Address
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Verification */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Profile Verification
              </CardTitle>
              <CardDescription>
                Upload your PAN and Aadhar card (image or PDF) for identity verification. Our team will review your documents manually.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.isProfileVerified ? (
                <p className="text-sm font-medium text-green-500 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Your profile is fully verified
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Complete PAN and Aadhar verification to get your profile verified badge.
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                {renderVerificationDocCard(
                  VerificationDocumentType.PAN,
                  'PAN Card',
                  user?.pan,
                  user?.isPanVerified,
                )}
                {renderVerificationDocCard(
                  VerificationDocumentType.AADHAR,
                  'Aadhar Card',
                  user?.aadhar,
                  user?.isAadharVerified,
                )}
              </div>

              {/* Selfie with uploaded document — disabled for now
              <div className="flex-1 p-3 border border-border/80 rounded-md bg-muted/50">
                ...
              </div>
              */}
            </CardContent>
          </Card>
        </motion.div>

        {/* Subscription Information */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription
              </CardTitle>
              <CardDescription>
                Your current plan and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border/80 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Current Plan</p>
                  <p className="text-2xl font-bold mt-1">{formatPlanDisplayName(user?.plan)}</p>
                </div>
                {user?.plan !== 'enterprise' && (
                  <Button variant="outline" onClick={() => router.push('/dashboard/subscription')}>Upgrade Plan</Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-border/80 rounded-lg">
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="text-lg font-semibold mt-1">
                    {formatDate(user?.createdAt)}
                  </p>
                </div>
                <div className="p-4 border border-border/80 rounded-lg">
                  <p className="text-sm text-muted-foreground">Plan Started</p>
                  <p className="text-lg font-semibold mt-1">
                    {formatDate(user?.planStartDate)}
                  </p>
                </div>
              </div>

              {user?.plan === 'free' && (
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <p className="text-sm font-medium text-primary">
                    Upgrade to Pro or Enterprise for unlimited releases and more storage!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Stats */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
              <CardDescription>
                Your activity and usage statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-border/80 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Releases</p>
                  <p className="text-2xl font-bold mt-1">
                    {user?.usage.totalReleases || 0}
                  </p>
                </div>
                <div className="p-4 border border-border/80 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Stream</p>
                  <p className="text-2xl font-bold mt-1">
                    {user?.usage.totalStreams || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* OTP Verification Modal — disabled for now
      <Dialog open={showOTPModal} onOpenChange={setShowOTPModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Phone Number</DialogTitle>
            <DialogDescription>
              Enter the 6-digit OTP sent to {phoneNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="otp">OTP Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowOTPModal(false);
                  setOtp('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyOTP}
                disabled={isVerifyingOTP || otp.length !== 6}
                className="flex-1"
              >
                {isVerifyingOTP ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      */}

      {/* Verify Profile Modal */}
      <Dialog
        open={showVerifyModal}
        onOpenChange={(open) => {
          setShowVerifyModal(open);
          if (!open) {
            setDocFile(null);
            setUploadDocType(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Upload {uploadDocType === VerificationDocumentType.PAN ? 'PAN Card' : 'Aadhar Card'}
            </DialogTitle>
            <DialogDescription>
              Upload a clear {uploadDocType === VerificationDocumentType.PAN ? 'PAN' : 'Aadhar'} card as an image or PDF. Our team will review it manually.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>{uploadDocType === VerificationDocumentType.PAN ? 'PAN Card' : 'Aadhar Card'}</Label>
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer 
                  ${docFile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-card/20'}`}
                onClick={() => document.getElementById('verificationDocUpload')?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (!file) return;
                  if (!isAllowedVerificationFile(file)) {
                    toast.error('Please upload an image (JPG, PNG, WEBP) or PDF file');
                    return;
                  }
                  setDocFile(file);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <input
                  id="verificationDocUpload"
                  type="file"
                  className="hidden"
                  accept={VERIFICATION_FILE_ACCEPT}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!isAllowedVerificationFile(file)) {
                      toast.error('Please upload an image (JPG, PNG, WEBP) or PDF file');
                      e.target.value = '';
                      return;
                    }
                    setDocFile(file);
                  }}
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  {docFile ? (
                    <div className="space-y-1">
                      <p className="font-medium text-sm text-primary">{docFile.name}</p>
                      <p className="text-xs text-muted-foreground">Click or drag to change</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Drag & drop your document</p>
                      <p className="text-xs text-muted-foreground">{VERIFICATION_FILE_HINT}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selfie with uploaded document — disabled for now
            <div className="space-y-2">
              <Label>Selfie with uploaded document</Label>
              ...
            </div>
            */}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowVerifyModal(false);
                  setDocFile(null);
                  setUploadDocType(null);
                }}
                className="flex-1"
                disabled={isVerifyingProfile}
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifySubmit}
                disabled={isVerifyingProfile || !docFile}
                className="flex-1"
              >
                {isVerifyingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Submit for Review'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

