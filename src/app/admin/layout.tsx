'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  DollarSign,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface User {
  id: string
  email: string
  name: string
  role: string
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false)
      return
    }
    checkAuth()
  }, [pathname])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        router.push('/admin/login')
        return
      }
      const data = await res.json()
      setUser(data.user)
    } catch {
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const getNavItems = () => {
    const baseItems = [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/students', label: 'Data Siswa', icon: Users },
      { href: '/admin/attendance', label: 'Absensi', icon: ClipboardCheck },
    ]
    
    if (user?.role === 'super_admin') {
      baseItems.push({ href: '/admin/finance', label: 'Keuangan', icon: DollarSign })
      baseItems.push({ href: '/admin/classes', label: 'Kelas', icon: BookOpen })
    }
    
    return baseItems
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff8c00] border-t-transparent" />
      </div>
    )
  }

  const navItems = getNavItems()
  const isSuperAdmin = user?.role === 'super_admin'

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop Sidebar - Icon Only */}
      <aside className="hidden lg:flex flex-col bg-gradient-to-b from-[#ff8c00] to-[#e67e00] text-white shadow-lg w-14 flex-shrink-0">
        {/* Logo */}
        <div className="p-2 border-b border-white/20">
          <Link href="/" className="flex items-center justify-center">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#ff8c00] font-bold text-sm">S</span>
            </div>
          </Link>
        </div>

        {/* Navigation - Icon Only */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center justify-center p-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-[#ff8c00]'
                    : 'hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
              </Link>
            )
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-2 border-t border-white/20 space-y-1">
          <div 
            className="flex items-center justify-center p-2 bg-white/10 rounded-lg"
            title={`${user?.name} (${isSuperAdmin ? 'Super Admin' : 'Guru'})`}
          >
            <Users className="w-5 h-5" />
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -200 }}
            animate={{ x: 0 }}
            exit={{ x: -200 }}
            className="lg:hidden fixed left-0 top-0 h-full w-52 bg-gradient-to-b from-[#ff8c00] to-[#e67e00] text-white shadow-xl z-50"
          >
            <div className="p-3 border-b border-white/20 flex items-center justify-between">
              <span className="font-bold text-sm">Starlish</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all text-sm ${
                      isActive ? 'bg-white text-[#ff8c00]' : 'hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/20">
              <p className="text-xs font-medium mb-2">{user?.name}</p>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full text-white hover:bg-white/10 justify-start gap-2 text-sm h-8"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar - Mobile */}
        <header className="lg:hidden bg-white shadow-sm p-3 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="font-bold text-gray-900 text-sm">Starlish Admin</h1>
          <div className="w-5" />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 lg:p-4 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
