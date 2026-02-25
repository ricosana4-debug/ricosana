'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ClipboardCheck,
  Calendar,
  UserCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface DashboardStats {
  totalStudents: number
  totalClasses: number
  totalSessions: number
  totalIncome: number
  totalExpense: number
  balance: number
  todayAttendance: number
}

interface MonthlyData {
  month: string
  income: number
  expense: number
}

interface User {
  id: string
  name: string
  role: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
    fetchDashboardData()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      // Fetch classes for counts
      const classesRes = await fetch('/api/admin/classes')
      const classesData = await classesRes.json()

      // Fetch finance (only for super admin)
      const financeRes = await fetch('/api/admin/finance')
      const financeData = await financeRes.json()

      // Calculate stats
      let totalStudents = 0
      let totalSessions = 0
      
      if (classesData.classes) {
        classesData.classes.forEach((c: any) => {
          totalStudents += c._count?.students || 0
          totalSessions += c.sessions?.length || 0
        })
      }

      setStats({
        totalStudents,
        totalClasses: classesData.classes?.length || 0,
        totalSessions,
        totalIncome: financeData.summary?.totalIncome || 0,
        totalExpense: financeData.summary?.totalExpense || 0,
        balance: financeData.summary?.balance || 0,
        todayAttendance: 0,
      })

      // Process monthly data for chart
      if (financeData.monthlyData && Object.keys(financeData.monthlyData).length > 0) {
        const chartData = Object.entries(financeData.monthlyData)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .slice(-6)
          .map(([month, val]: [string, any]) => ({
            month: format(new Date(month + '-01'), 'MMM', { locale: id }),
            income: val.income / 1000000,
            expense: val.expense / 1000000,
          }))
        setMonthlyData(chartData)
      } else {
        setMonthlyData([])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const isSuperAdmin = user?.role === 'super_admin'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff8c00] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Selamat datang, {user?.name} 
          <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
            {isSuperAdmin ? 'Super Admin' : 'Guru'}
          </span>
        </p>
      </div>

      {/* Stats Cards - Show different cards based on role */}
      <div className={`grid gap-3 ${isSuperAdmin ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-2 lg:grid-cols-3'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs">Total Siswa</p>
                  <p className="text-lg lg:text-xl font-bold mt-1">{stats?.totalStudents}</p>
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs">Total Kelas</p>
                  <p className="text-lg lg:text-xl font-bold mt-1">{stats?.totalClasses}</p>
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-xs">Total Sesi</p>
                  <p className="text-lg lg:text-xl font-bold mt-1">{stats?.totalSessions}</p>
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Finance cards - Only for Super Admin */}
        {isSuperAdmin && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-3 lg:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-xs">Pemasukan</p>
                      <p className="text-xs lg:text-sm font-bold mt-1">
                        {formatCurrency(stats?.totalIncome || 0)}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                <CardContent className="p-3 lg:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-xs">Pengeluaran</p>
                      <p className="text-xs lg:text-sm font-bold mt-1">
                        {formatCurrency(stats?.totalExpense || 0)}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      {/* Balance Card - Only for Super Admin */}
      {isSuperAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className={`${
            (stats?.balance || 0) >= 0
              ? 'bg-gradient-to-r from-[#ff8c00] to-[#ffc107]'
              : 'bg-gradient-to-r from-red-600 to-red-500'
          } text-white`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Saldo Kas</p>
                  <p className="text-xl lg:text-2xl font-bold mt-1">
                    {formatCurrency(stats?.balance || 0)}
                  </p>
                  {stats?.balance === 0 && (
                    <p className="text-white/60 text-xs mt-1">
                      Belum ada transaksi keuangan
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Charts - Only for Super Admin */}
      {isSuperAdmin && (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Income vs Expense Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base">Grafik Keuangan (Juta Rupiah)</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => `${v}jt`} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value: number) => [`${value.toFixed(1)} Juta`, '']}
                        labelStyle={{ color: '#333', fontSize: 12 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="income" name="Pemasukan" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex flex-col items-center justify-center text-gray-500">
                    <DollarSign className="w-12 h-12 mb-3 text-gray-300" />
                    <p className="text-sm font-medium">Belum ada data keuangan</p>
                    <p className="text-xs mt-1">Data keuangan akan muncul setelah input transaksi</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base">Aksi Cepat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  onClick={() => router.push('/admin/students')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 text-sm">Data Siswa</p>
                    <p className="text-xs text-gray-500">Tambah dan kelola data siswa</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/admin/attendance')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 text-sm">Absensi</p>
                    <p className="text-xs text-gray-500">Catat kehadiran siswa</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/admin/finance')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 text-sm">Keuangan</p>
                    <p className="text-xs text-gray-500">Input pemasukan dan pengeluaran</p>
                  </div>
                </button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Quick Actions for Teacher */}
      {!isSuperAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">Aksi Cepat Guru</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => router.push('/admin/students')}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 text-sm">Data Siswa</p>
                  <p className="text-xs text-gray-500">Tambah dan kelola data siswa</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/admin/attendance')}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
              >
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 text-sm">Absensi</p>
                  <p className="text-xs text-gray-500">Catat kehadiran siswa</p>
                </div>
              </button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Info Banner */}
      {!isSuperAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <strong>Catatan:</strong> Sebagai guru, Anda dapat menambahkan siswa baru dan mencatat absensi. 
            Menu keuangan hanya dapat diakses oleh Super Admin.
          </p>
        </div>
      )}
    </div>
  )
}
