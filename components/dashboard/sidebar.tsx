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
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import UpgradePlanModal from './upgrade-plan-modal'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Releases', href: '/dashboard/releases', icon: Music },
  { name: 'Upload Music', href: '/dashboard/upload', icon: Upload },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Users', href: '/dashboard/users', icon: User },
  { name: 'Plan Management', href: '/dashboard/admin/plans', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
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
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-background border border-border hover:bg-accent transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
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
          <div className="flex h-16 items-center border-b border-border px-6">
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="KratoLib" className="h-[6rem] w-auto" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation
              .filter(item => {
                if (user?.role === 'release_manager') {
                  return ['Dashboard', 'My Releases', 'Upload Music', 'Billing'].includes(item.name)
                }

                if (user?.role === 'super_admin') {
                  // Super admin sees Users and Plan Management, but not Upload Music or Billing
                  if (item.name === 'Upload Music' || item.name === 'Billing') return false;
                  return true;
                }

                // Default behavior for other users (e.g., artists)
                if (item.name === 'Users' || item.name === 'Plan Management') return false;
                return true
              })
              .map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
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
                onClick={() => setIsUpgradeModalOpen(true)}
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

      <UpgradePlanModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </>
  )
}


