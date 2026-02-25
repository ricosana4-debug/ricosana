'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Upload,
  X,
  Save,
  Loader2,
  Edit2,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { format, parseISO, subMonths, startOfYear, endOfYear } from 'date-fns'
import { id } from 'date-fns/locale'

interface FinanceRecord {
  id: string
  type: string
  amount: number
  description: string | null
  category: string | null
  date: string
  admin: { name: string } | null
}

interface Summary {
  totalIncome: number
  totalExpense: number
  balance: number
}

interface MonthlyData {
  [key: string]: { income: number; expense: number }
}

interface User {
  id: string
  role: string
}

const categories = {
  income: ['SPP', 'Pendaftaran', 'Les', 'Lainnya'],
  expense: ['Gaji', 'Sewa', 'Utilitas', 'ATK', 'Lainnya'],
}

export default function FinancePage() {
  const [records, setRecords] = useState<FinanceRecord[]>([])
  const [summary, setSummary] = useState<Summary>({ totalIncome: 0, totalExpense: 0, balance: 0 })
  const [monthlyData, setMonthlyData] = useState<{ month: string; income: number; expense: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<{ type: string; year: string }>({
    type: 'all',
    year: new Date().getFullYear().toString(),
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    type: 'income',
    amount: '',
    description: '',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  })

  useEffect(() => {
    fetchUser()
    fetchFinance()
  }, [filter])

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

  const fetchFinance = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.type !== 'all') params.append('type', filter.type)
      params.append('year', filter.year)

      const res = await fetch(`/api/admin/finance?${params.toString()}`)
      const data = await res.json()

      setRecords(data.finance || [])
      setSummary(data.summary || { totalIncome: 0, totalExpense: 0, balance: 0 })

      // Process monthly data
      if (data.monthlyData) {
        const chartData = Object.entries(data.monthlyData)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .slice(-12)
          .map(([month, val]: [string, any]) => ({
            month: format(new Date(month + '-01'), 'MMM', { locale: id }),
            income: val.income / 1000000,
            expense: val.expense / 1000000,
          }))
        setMonthlyData(chartData)
      }
    } catch (error) {
      console.error('Error fetching finance:', error)
    } finally {
      setLoading(false)
    }
  }

  const isSuperAdmin = user?.role === 'super_admin'

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.amount || !form.date) return

    setSaving(true)
    try {
      const url = '/api/admin/finance'
      const method = editingRecord ? 'PUT' : 'POST'
      const body = editingRecord
        ? { id: editingRecord.id, ...form }
        : form

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setShowModal(false)
        setEditingRecord(null)
        setForm({
          type: 'income',
          amount: '',
          description: '',
          category: '',
          date: format(new Date(), 'yyyy-MM-dd'),
        })
        fetchFinance()
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal menyimpan')
      }
    } catch (error) {
      alert('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return

    try {
      const res = await fetch('/api/admin/finance', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        fetchFinance()
      }
    } catch (error) {
      alert('Terjadi kesalahan')
    }
  }

  const handleExport = () => {
    window.open(`/api/admin/export?type=finance&year=${filter.year}`, '_blank')
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'finance')

    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      alert(data.message || 'Import selesai')
      fetchFinance()
    } catch (error) {
      alert('Gagal import')
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff8c00] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Keuangan</h1>
          <p className="text-gray-500 mt-1">Kelola pemasukan dan pengeluaran</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".xlsx,.xls"
            ref={fileInputRef}
            onChange={handleImport}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => {
              setEditingRecord(null)
              setForm({
                type: 'income',
                amount: '',
                description: '',
                category: '',
                date: format(new Date(), 'yyyy-MM-dd'),
              })
              setShowModal(true)
            }}
            className="bg-gradient-to-r from-[#ff8c00] to-[#ffc107] hover:from-[#e67e00] hover:to-[#e6ad00]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="h-10 px-3 border rounded-lg"
        >
          <option value="all">Semua</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>
        <select
          value={filter.year}
          onChange={(e) => setFilter({ ...filter, year: e.target.value })}
          className="h-10 px-3 border rounded-lg"
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Pemasukan</p>
                  <p className="text-lg lg:text-xl font-bold mt-1">
                    {formatCurrency(summary.totalIncome)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Pengeluaran</p>
                  <p className="text-lg lg:text-xl font-bold mt-1">
                    {formatCurrency(summary.totalExpense)}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-2"
        >
          <Card className={`${
            summary.balance >= 0
              ? 'bg-gradient-to-br from-[#ff8c00] to-[#ffc107]'
              : 'bg-gradient-to-br from-red-600 to-red-500'
          } text-white`}>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Saldo</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-1">
                    {formatCurrency(summary.balance)}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-white/50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Grafik Keuangan Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `${v}jt`} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)} Juta`, '']}
                    labelStyle={{ color: '#333' }}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Pemasukan" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Belum ada data keuangan
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 text-sm font-medium text-gray-500">Tanggal</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">Tipe</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">Kategori</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">Keterangan</th>
                  <th className="text-right p-3 text-sm font-medium text-gray-500">Jumlah</th>
                  {isSuperAdmin && <th className="text-center p-3 text-sm font-medium text-gray-500">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={isSuperAdmin ? 6 : 5} className="text-center py-8 text-gray-500">
                      Belum ada transaksi
                    </td>
                  </tr>
                ) : (
                  records.map((record, index) => (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="p-3 text-sm">
                        {format(parseISO(record.date), 'dd MMM yyyy', { locale: id })}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            record.type === 'income'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {record.type === 'income' ? (
                            <>
                              <TrendingUp className="w-3 h-3" />
                              Masuk
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-3 h-3" />
                              Keluar
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-3 text-sm">{record.category || '-'}</td>
                      <td className="p-3 text-sm">{record.description || '-'}</td>
                      <td className={`p-3 text-sm text-right font-medium ${
                        record.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {record.type === 'income' ? '+' : '-'} {formatCurrency(record.amount)}
                      </td>
                      {isSuperAdmin && (
                        <td className="p-3 text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingRecord(record)
                              setForm({
                                type: record.type,
                                amount: record.amount.toString(),
                                description: record.description || '',
                                category: record.category || '',
                                date: format(parseISO(record.date), 'yyyy-MM-dd'),
                              })
                              setShowModal(true)
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(record.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      )}
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  {editingRecord ? 'Edit Transaksi' : 'Tambah Transaksi'}
                </h2>
                <button onClick={() => setShowModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type */}
                <div>
                  <Label>Tipe</Label>
                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, type: 'income' })}
                      className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                        form.type === 'income'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4 inline mr-1" />
                      Pemasukan
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, type: 'expense' })}
                      className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                        form.type === 'expense'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <TrendingDown className="w-4 h-4 inline mr-1" />
                      Pengeluaran
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <Label>Jumlah (Rp)</Label>
                  <Input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <Label>Kategori</Label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full h-10 px-3 border rounded-lg"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories[form.type as 'income' | 'expense'].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <Label>Keterangan</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Keterangan tambahan"
                  />
                </div>

                {/* Date */}
                <div>
                  <Label>Tanggal</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowModal(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className={`flex-1 ${
                      form.type === 'income'
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Simpan
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
