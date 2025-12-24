'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, Search, Settings, LogOut, User as UserIcon, ChevronDown, Upload, Zap, Menu, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'

export default function TopNavbar() {
  const { user, logout } = useAuth()
  const { openUpgradeModal, isMobileMenuOpen, toggleMobileMenu } = useUI()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
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

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search releases, tracks..."
            className="pl-10 w-full"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Upgrade Button */}
        <Button
          size="sm"
          variant="ghost"
          className="text-primary hover:text-primary hover:bg-primary/10 gap-2 font-bold"
          onClick={openUpgradeModal}
        >
          <Zap className="h-4 w-4 fill-primary" />
          <span className="hidden sm:inline">Upgrade Plan</span>
        </Button>

        {/* Upload Button */}
        <Link href="/dashboard/upload">
          <Button size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden md:inline">Upload</span>
          </Button>
        </Link>

        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
        </Button>

        {/* User Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 group"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                <UserIcon className="h-4 w-4 text-primary group-hover:text-white transition-colors" />
              </div>
              <span className="hidden md:inline text-sm">{user?.fullName || 'User'}</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </Button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-background shadow-lg z-50">
                <div className="p-2 border-b border-border">
                  <p className="text-sm font-medium">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-primary mt-1 capitalize">{user?.plan} Plan</p>
                </div>
                <div className="p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      setShowUserMenu(false)
                      // Navigate to settings
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => {
                      setShowUserMenu(false)
                      logout()
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}


