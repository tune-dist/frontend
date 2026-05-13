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

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Releases', href: '/dashboard/releases', icon: Music, permission: 'VIEW_RELEASES' },
  { name: 'Upload Music', href: '/dashboard/upload', icon: Upload, permission: 'UPLOAD_RELEASE' },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard, permission: 'VIEW_BILLING' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, permission: 'VIEW_ANALYTICS' },
  { name: 'Finance', href: '/dashboard/finance', icon: Wallet },
  { name: 'Promotion', href: '/dashboard/promotion', icon: Sparkles, permission: 'MANAGE_PROMOTION' },
  { name: 'Testimonials', href: '/dashboard/admin/testimonials', icon: Quote, permission: 'MANAGE_TESTIMONIALS' },
  { name: 'Profile', href: '/dashboard/profile', icon: User, permission: 'PROFILE' },
  { name: 'YouTube Service', href: '/dashboard/youtube-service', icon: Youtube, permission: 'USE_YOUTUBE_SERVICE' },
  { name: 'Users', href: '/dashboard/users', icon: User, permission: 'MANAGE_USERS' },
  { name: 'Plan Management', href: '/dashboard/admin/plans', icon: Settings, permission: 'MANAGE_PLANS' },
  { name: 'Permissions', href: '/dashboard/admin/permissions', icon: Shield, permission: 'MANAGE_PERMISSIONS' },
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
          isSidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64',
          isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
        )}
        style={{
          background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)'
        }}
      >

        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={cn(
            "flex h-16 items-center border-b border-border transition-all duration-300 shrink-0",
            isSidebarCollapsed ? "justify-center px-0" : "justify-between px-6"
          )}>
            {!isSidebarCollapsed && (
              <Link href="/dashboard" className="flex items-center">
                <img src="/logo.png" alt="KratoLib" className="w-[120px] max-w-[100%]" />
              </Link>
            )}
            {isSidebarCollapsed && (
              <Link href="/dashboard" className="flex items-center">
                <img src="/favicon.png" alt="KratoLib" className="w-8 h-8 object-contain" />
              </Link>
            )}
            <button
              onClick={toggleSidebar}
              className={cn(
                "hidden lg:flex items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground transition-all duration-200 fixed right-[-12px] top-6 z-50 h-6 w-6 shadow-md hover:scale-110",
              )}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-3.5 w-3.5" />
              ) : (
                <PanelLeftClose className="h-3.5 w-3.5" />
              )}
            </button>
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
                          ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(124,58,237,0.1)]'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <Icon className={cn(
                        "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
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
            <Tooltip content={user?.fullName || 'User'} enabled={isSidebarCollapsed}>
              <div className={cn(
                "flex items-center w-full",
                isSidebarCollapsed ? "justify-center" : "gap-3"
              )}>
                <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
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
            </Tooltip>
          </div>
        </div>
      </aside>
    </>
  )
}


