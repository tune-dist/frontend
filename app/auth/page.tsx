'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Mail, Lock, User, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

// Login form schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// Signup form schema
const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>
type SignupFormData = z.infer<typeof signupSchema>

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, register: registerUser } = useAuth()

  // Get tab from URL query params, default to 'login'
  const tabFromUrl = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabFromUrl === 'signup' ? 'signup' : 'login')
  const [isLoading, setIsLoading] = useState(false)

  // Update tab when URL changes
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'signup' || tab === 'login') {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Login form
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Signup form
  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    setValue: setSignupValue,
    formState: { errors: signupErrors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  // Pre-fill signup form if params exist
  useEffect(() => {
    const email = searchParams.get('email')
    const fullName = searchParams.get('fullName')
    if (email) setSignupValue('email', email)
    if (fullName) setSignupValue('fullName', fullName)
  }, [searchParams, setSignupValue])
  // Get plan from URL if user came from pricing
  const planFromUrl = searchParams.get('plan')

  // Build redirect URL based on plan parameter
  const getRedirectUrl = () => {
    if (planFromUrl && planFromUrl !== 'free') {
      // Redirect to checkout page with plan
      return `/checkout?plan=${planFromUrl}`
    }
    return '/dashboard'
  }

  // Handle login
  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password, getRedirectUrl())
      toast.success('Welcome back!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle signup
  const onSignup = async (data: SignupFormData) => {
    setIsLoading(true)
    try {
      const googleId = searchParams.get('googleId') || undefined
      const spotifyId = searchParams.get('spotifyId') || undefined
      const avatar = searchParams.get('avatar') || undefined

      await registerUser(
        data.email,
        data.password,
        data.fullName,
        'artist',
        googleId,
        spotifyId,
        avatar,
        getRedirectUrl()
      )
      // await registerUser(data.email, data.password, data.fullName, 'artist', getRedirectUrl())
      toast.success('Account created successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, submitFn: any) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault()
      submitFn()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex justify-center mb-8">
          <img src="/logo.png" alt="KratoLib" className="w-[150px] max-w-[100%]" />
        </Link>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome to KratoLib
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === 'login'
                ? 'Sign in to your account to continue'
                : 'Create an account to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleSubmitLogin(onLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        className={`pl-10 ${loginErrors.email ? 'border-red-500' : ''}`}
                        {...registerLogin('email')}
                        onKeyDown={(e) => handleKeyDown(e, handleSubmitLogin(onLogin))}
                      />
                    </div>
                    {loginErrors.email && (
                      <p className="text-sm text-red-500">
                        {loginErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <Link
                        href="#forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className={`pl-10 ${loginErrors.password ? 'border-red-500' : ''}`}
                        {...registerLogin('password')}
                        onKeyDown={(e) => handleKeyDown(e, handleSubmitLogin(onLogin))}
                      />
                    </div>
                    {loginErrors.password && (
                      <p className="text-sm text-red-500">
                        {loginErrors.password.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/google`}
                    >
                      <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                      </svg>
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/spotify`}
                    >
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.11 17.182c-.172.283-.55.373-.833.202-2.313-1.413-5.225-1.73-8.655-.947-.323.074-.648-.133-.722-.456-.073-.323.133-.648.456-.722 3.75-.858 6.974-.486 9.55 1.09.284.172.373.55.204.833zm1.36-3.235c-.216.353-.674.464-1.027.247-2.647-1.627-6.68-2.1-9.808-1.15-.4-.122-.824.1-.947.5-.123.4.1.824.5.947 3.58-1.085 8.04-.563 11.08 1.307.353.217.464.675.247 1.028zm.13-3.327C15.147 8.544 9.17 8.347 5.71 9.397c-.507.153-1.04-.136-1.194-.643-.153-.507.136-1.04.643-1.194 3.986-1.21 10.584-.98 14.653 1.438.455.27.604.856.333 1.31-.27.455-.856.605-1.31.334z" />
                      </svg>
                      Spotify
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSubmitSignup(onSignup)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        className={`pl-10 ${signupErrors.fullName ? 'border-red-500' : ''}`}
                        {...registerSignup('fullName')}
                        onKeyDown={(e) => handleKeyDown(e, handleSubmitSignup(onSignup))}
                      />
                    </div>
                    {signupErrors.fullName && (
                      <p className="text-sm text-red-500">
                        {signupErrors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        className={`pl-10 ${signupErrors.email ? 'border-red-500' : ''}`}
                        {...registerSignup('email')}
                        onKeyDown={(e) => handleKeyDown(e, handleSubmitSignup(onSignup))}
                      />
                    </div>
                    {signupErrors.email && (
                      <p className="text-sm text-red-500">
                        {signupErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className={`pl-10 ${signupErrors.password ? 'border-red-500' : ''}`}
                        {...registerSignup('password')}
                        onKeyDown={(e) => handleKeyDown(e, handleSubmitSignup(onSignup))}
                      />
                    </div>
                    {signupErrors.password && (
                      <p className="text-sm text-red-500">
                        {signupErrors.password.message}
                      </p>
                    )}
                  </div>



                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/google`}
                    >
                      <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                      </svg>
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/spotify`}
                    >
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.11 17.182c-.172.283-.55.373-.833.202-2.313-1.413-5.225-1.73-8.655-.947-.323.074-.648-.133-.722-.456-.073-.323.133-.648.456-.722 3.75-.858 6.974-.486 9.55 1.09.284.172.373.55.204.833zm1.36-3.235c-.216.353-.674.464-1.027.247-2.647-1.627-6.68-2.1-9.808-1.15-.4-.122-.824.1-.947.5-.123.4.1.824.5.947 3.58-1.085 8.04-.563 11.08 1.307.353.217.464.675.247 1.028zm.13-3.327C15.147 8.544 9.17 8.347 5.71 9.397c-.507.153-1.04-.136-1.194-.643-.153-.507.136-1.04.643-1.194 3.986-1.21 10.584-.98 14.653 1.438.455.27.604.856.333 1.31-.27.455-.856.605-1.31.334z" />
                      </svg>
                      Spotify
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Back to home link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div >
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  )
}
