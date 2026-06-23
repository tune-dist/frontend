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
  Wallet,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import { Tooltip } from '@/components/ui/tooltip'
import { S3Image } from '@/components/ui/s3-image'
import { canAccessNavItem, canAccessYouTubeService } from '@/lib/permissions'

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Releases', href: '/dashboard/releases', icon: Music, permission: 'VIEW_RELEASES' },
  { name: 'Upload Music', href: '/dashboard/upload', icon: Upload, permission: 'UPLOAD_RELEASE' },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard, permission: 'VIEW_BILLING' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, permission: 'VIEW_ANALYTICS' },
  { name: 'Finance', href: '/dashboard/finance', icon: Wallet, permission: 'VIEW_BILLING' },
  { name: 'Promotion', href: '/dashboard/promotion', icon: Sparkles, permission: 'MANAGE_PROMOTION' },
  { name: 'Testimonials', href: '/dashboard/admin/testimonials', icon: Quote, permission: 'MANAGE_TESTIMONIALS' },
  { name: 'Profile', href: '/dashboard/profile', icon: User, permission: 'PROFILE' },
  { name: 'YouTube Service', href: '/dashboard/youtube-service', icon: Youtube, permission: 'USE_YOUTUBE_SERVICE' },
  { name: 'Verifications', href: '/dashboard/verifications', icon: Shield, permission: 'APPROVE_RELEASE' },
  { name: 'Users', href: '/dashboard/users', icon: User, permission: 'VIEW_USERS' },
  { name: 'Plan Management', href: '/dashboard/admin/plans', icon: Settings, permission: 'MANAGE_PLANS' },
  { name: 'Permissions', href: '/dashboard/admin/permissions', icon: Shield, permission: 'VIEW_PERMISSIONS' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { openUpgradeModal, isMobileMenuOpen, closeMobileMenu, isSidebarCollapsed, toggleSidebar } = useUI()
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
          'fixed left-0 top-0 z-40 h-screen border-r border-border/50 bg-background/95 backdrop-blur-xl transition-all duration-300 ease-in-out',
          'lg:translate-x-0',
          isSidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-[220px]',
          isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
        )}
        style={{
          background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)'
        }}
      >

        <div className="flex h-full flex-col overflow-hidden">
          {/* Logo + collapse */}
          <div
            className={cn(
              'flex shrink-0 items-center border-b border-border',
              isSidebarCollapsed
                ? 'h-[4.5rem] flex-col justify-center gap-1.5 px-1'
                : 'h-16 justify-between gap-2 px-3',
            )}
          >
            <Link
              href="/dashboard"
              className={cn(
                'flex items-center min-w-0',
                isSidebarCollapsed ? 'justify-center' : 'flex-1',
              )}
            >
              {isSidebarCollapsed ? (
                <img src="/favicon.png" alt="KratoLib" className="h-7 w-7 object-contain" />
              ) : (
                <img src="/logo.png" alt="KratoLib" className="h-8 w-auto max-w-[120px] object-contain" />
              )}
            </Link>

            <button
              onClick={toggleSidebar}
              className={cn(
                'hidden lg:flex shrink-0 items-center justify-center rounded-lg border border-border/80 bg-card text-muted-foreground hover:bg-accent hover:text-foreground transition-colors',
                isSidebarCollapsed ? 'h-6 w-6' : 'h-8 w-8',
              )}
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-3.5 w-3.5" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin" data-lenis-prevent="true">
            {navigation
              .filter((item) => {
                if (item.href === '/dashboard/youtube-service') {
                  return canAccessYouTubeService(user);
                }
                return canAccessNavItem(user, (item as { permission?: string }).permission);
              })
              .map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Tooltip
                    key={item.name}
                    content={item.name}
                    enabled={isSidebarCollapsed}
                  >
                    <Link
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={cn(
                        'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group w-full',
                        isSidebarCollapsed ? 'justify-center' : 'gap-3',
                        isActive
                          ? 'bg-primary text-white shadow-[0_0_15px_rgba(124,58,237,0.1)]'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <Icon className={cn(
                        "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                        isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                    </Link>
                  </Tooltip>
                )
              })}
          </nav>

          {/* User Section */}
          <div className="border-t border-border p-4 space-y-3">
            {user?.plan !== 'enterprise' && (
              <Tooltip content="Upgrade Plan" enabled={isSidebarCollapsed}>
                <button
                  onClick={openUpgradeModal}
                  className={cn(
                    "w-full flex items-center justify-center rounded-lg bg-gradient-to-r from-primary/80 to-primary text-sm font-medium text-primary-foreground hover:from-primary hover:to-primary/90 transition-all shadow-sm",
                    isSidebarCollapsed ? "p-2" : "gap-2 px-3 py-2"
                  )}
                >
                  <Sparkles className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span>Upgrade Plan</span>}
                </button>
              </Tooltip>
            )}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-border shrink-0">
                {user?.avatar ? (
                  <S3Image
                    src={user.avatar}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    fallback={<User className="h-5 w-5 text-primary" />}
                  />
                ) : (
                  <User className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {!isSidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.fullName || 'User'}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.role === 'super_admin' ? 'Super Admin' :
                          user?.role === 'release_manager' ? 'Release Manager' : 'Artist'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}


