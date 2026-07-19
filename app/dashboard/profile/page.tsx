'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { User as UserIcon, Mail, CreditCard, Loader2, Save, MapPin, Shield, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { updateUserProfile } from '@/lib/api/users'
import { beginDigilockerVerification } from '@/lib/digilocker-flow'
import { uploadFileDirectly } from '@/lib/upload/chunk-uploader'
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

  const [isStartingDigilocker, setIsStartingDigilocker] = useState(false)
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

  const handleStartDigilocker = async () => {
    setIsStartingDigilocker(true);
    try {
      await beginDigilockerVerification();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to start DigiLocker verification'));
      setIsStartingDigilocker(false);
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
                Verify your identity with DigiLocker to complete PAN and Aadhaar verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.isKyc || user?.isProfileVerified ? (
                <p className="text-sm font-medium text-green-500 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Your profile is fully verified
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Complete DigiLocker verification to get your profile verified badge.
                </p>
              )}

              <div className="flex flex-wrap gap-3 text-sm">
                <span className={user?.isPanVerified ? 'text-green-500' : 'text-muted-foreground'}>
                  PAN: {user?.isPanVerified ? 'Verified' : 'Pending'}
                </span>
                <span className={user?.isAadharVerified ? 'text-green-500' : 'text-muted-foreground'}>
                  Aadhaar: {user?.isAadharVerified ? 'Verified' : 'Pending'}
                </span>
              </div>

              {!user?.isKyc && !user?.isProfileVerified ? (
                <Button
                  onClick={handleStartDigilocker}
                  disabled={isStartingDigilocker}
                  className="w-full sm:w-auto"
                >
                  {isStartingDigilocker ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Shield className="mr-2 h-4 w-4" />
                  )}
                  Verify with DigiLocker
                </Button>
              ) : null}
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
    </>
  )
}

