'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Music,
  Upload,
  BarChart3,
  User,
  Menu,
  X,
  LogOut,
  Settings,
  CreditCard,
  Sparkles,
  Youtube,
  Quote,
  Shield,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Releases', href: '/dashboard/releases', icon: Music, permission: 'VIEW_RELEASES' },
  { name: 'Upload Music', href: '/dashboard/upload', icon: Upload, permission: 'UPLOAD_RELEASE' },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard, permission: 'VIEW_BILLING' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, permission: 'VIEW_ANALYTICS' },
  { name: 'Promotion', href: '/dashboard/promotion', icon: Sparkles, permission: 'MANAGE_PROMOTION' },
  { name: 'Testimonials', href: '/dashboard/admin/testimonials', icon: Quote, permission: 'MANAGE_TESTIMONIALS' },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'YouTube Service', href: '/dashboard/youtube-service', icon: Youtube, permission: 'USE_YOUTUBE_SERVICE' },
  { name: 'Users', href: '/dashboard/users', icon: User, permission: 'MANAGE_USERS' },
  { name: 'Plan Management', href: '/dashboard/admin/plans', icon: Settings, permission: 'MANAGE_PLANS' },
  { name: 'Permissions', href: '/dashboard/admin/permissions', icon: Shield, permission: 'MANAGE_PERMISSIONS' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { openUpgradeModal, isMobileMenuOpen, closeMobileMenu } = useUI()
  const { user } = useAuth()
  // const router = useRouter()

  // const handleLogout = async () => {
  //   try {
  //     await logout()
  //     router.push('/login')
  //   } catch (error) {
  //     console.error('Logout failed:', error)
  //   }
  // }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-background transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-border px-6">
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="KratoLib" className="w-[150px] max-w-[100%]" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation
              .filter(item => {
                if ((item as any).permission) {
                  return user?.permissions?.includes((item as any).permission);
                }
                return true;
              })
              .map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
          </nav>

          {/* User Section */}
          <div className="border-t border-border p-4 space-y-3">
            {user?.plan !== 'enterprise' && (
              <button
                onClick={openUpgradeModal}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary/80 to-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:from-primary hover:to-primary/90 transition-all shadow-sm"
              >
                <Sparkles className="h-4 w-4" />
                Upgrade Plan
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.fullName || 'User'}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.role === 'super_admin' ? 'Super Admin' :
                      user?.role === 'release_manager' ? 'Release Manager' : 'Artist'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}


