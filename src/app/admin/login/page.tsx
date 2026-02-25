'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login gagal. Periksa email dan password Anda.')
        setLoading(false)
        return
      }

      router.push('/admin/dashboard')
    } catch (err) {
      setError('Terjadi kesalahan saat login. Silakan coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff8e1] via-[#ffecd2] to-[#fcb69f] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold">
              <span className="text-gray-900">Starlish</span>
              <span className="text-[#ff8c00]"> Bimbel</span>
            </h1>
          </Link>
          <p className="text-gray-600 mt-2">Admin Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-[#ff8c00] to-[#ffc107] rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Login Admin</h2>
            <p className="text-gray-500 text-sm mt-1">Masukkan email dan password Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#ff8c00] to-[#ffc107] hover:from-[#e67e00] hover:to-[#e6ad00] text-white font-semibold rounded-xl"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Login'
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 text-center">
              🔐 Masukkan email dan password yang telah diberikan oleh administrator.
              <br />
              Hubungi admin jika Anda lupa kredensial login.
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <p className="text-center mt-6">
          <Link href="/" className="text-[#ff8c00] hover:underline text-sm">
            ← Kembali ke Beranda
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
