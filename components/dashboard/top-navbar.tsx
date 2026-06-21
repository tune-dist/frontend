'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, LogOut, User as UserIcon, ChevronDown, Upload, Zap, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import { S3Image } from '@/components/ui/s3-image'
import { formatPlanDisplayName } from '@/lib/utils'

export default function TopNavbar() {
  const { user, logout } = useAuth()
  const { openUpgradeModal, isMobileMenuOpen, toggleMobileMenu } = useUI()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Upgrade Button */}
        {user?.plan !== 'enterprise' && (
          <Button
            size="sm"
            variant="ghost"
            className="text-primary hover:text-primary hover:bg-primary/10 gap-2 font-bold"
            onClick={openUpgradeModal}
          >
            <Zap className="h-4 w-4 fill-primary" />
            <span className="hidden sm:inline">Upgrade Plan</span>
          </Button>
        )}

        {/* Upload Button */}
        <Link href="/dashboard/upload">
          <Button size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden md:inline">Upload</span>
          </Button>
        </Link>

        {/* User Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-1.5 py-1.5 hover:bg-primary/10 transition-all duration-300 group flex items-center gap-1.5 max-w-[200px]"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="flex items-center gap-2 min-w-0 w-full">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-border flex-shrink-0">
                {user?.avatar ? (
                  <S3Image
                    src={user.avatar}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    fallback={<UserIcon className="h-4 w-4 text-primary" />}
                  />
                ) : (
                  <UserIcon className="h-4 w-4 text-primary" />
                )}
              </div>
              <span title={user?.fullName || 'User'} className="hidden md:inline-block text-sm max-w-[100px] truncate align-middle">{user?.fullName || 'User'}</span>
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            </div>
          </Button>

          <AnimatePresence>
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-64 rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20 shadow-inner flex-shrink-0 overflow-hidden">
                        {user?.avatar ? (
                          <S3Image
                            src={user.avatar}
                            alt="Profile"
                            className="h-full w-full object-cover"
                            fallback={<UserIcon className="h-5 w-5 text-primary" />}
                          />
                        ) : (
                          <UserIcon className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p title={user?.fullName || ''} className="text-sm font-bold text-foreground truncate">{user?.fullName}</p>
                        <p title={user?.email || ''} className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/20 text-[10px] font-bold text-primary tracking-wide border border-primary/10">
                        {formatPlanDisplayName(user?.plan)} Plan
                      </span>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 px-3 py-2.5 h-auto text-sm font-medium hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl group"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted group-hover:bg-primary/20 transition-colors">
                        <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                      </div>
                      Settings
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 px-3 py-2.5 h-auto text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-200 rounded-xl group"
                      onClick={() => {
                        setShowUserMenu(false)
                        logout()
                      }}
                    >
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                        <LogOut className="h-4 w-4 text-destructive" />
                      </div>
                      Logout
                    </Button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}


