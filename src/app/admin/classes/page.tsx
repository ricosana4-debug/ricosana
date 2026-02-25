'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  BookOpen,
  Search,
  X,
  Save,
  Loader2,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ClassData {
  id: string
  name: string
  sessions: { id: string; name: string; time: string | null }[]
  students: { id: string; studentId: string; name: string | null }[]
  _count: { students: number }
}

interface User {
  id: string
  role: string
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showStudentsModal, setShowStudentsModal] = useState(false)
  
  // Form states
  const [formData, setFormData] = useState({ name: '' })
  const [editingClass, setEditingClass] = useState<ClassData | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetchUser()
    fetchData()
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

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/classes')
      const data = await res.json()
      setClasses(data.classes || [])
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const isSuperAdmin = user?.role === 'super_admin'

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddClass = async () => {
    setFormError('')
    
    if (!formData.name.trim()) {
      setFormError('Nama kelas harus diisi')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name.trim() }),
      })

      const data = await res.json()

      if (res.ok) {
        await fetchData()
        setShowAddModal(false)
        setFormData({ name: '' })
        setFormError('')
      } else {
        setFormError(data.error || 'Gagal menambah kelas')
      }
    } catch (error) {
      setFormError('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  const handleEditClass = async () => {
    setFormError('')
    
    if (!editingClass || !formData.name.trim()) {
      setFormError('Nama kelas harus diisi')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingClass.id,
          name: formData.name.trim(),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        await fetchData()
        setShowEditModal(false)
        setEditingClass(null)
        setFormData({ name: '' })
        setFormError('')
      } else {
        setFormError(data.error || 'Gagal mengubah kelas')
      }
    } catch (error) {
      setFormError('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClass = async (classId: string) => {
    const cls = classes.find(c => c.id === classId)
    if (!cls) return

    if (cls._count.students > 0) {
      alert(`Kelas masih memiliki ${cls._count.students} siswa. Hapus siswa terlebih dahulu.`)
      return
    }

    if (!confirm(`Yakin ingin menghapus kelas "${cls.name}"?`)) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/classes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: classId }),
      })

      const data = await res.json()

      if (res.ok) {
        await fetchData()
        if (selectedClass?.id === classId) {
          setSelectedClass(null)
          setShowStudentsModal(false)
        }
      } else {
        alert(data.error || 'Gagal menghapus kelas')
      }
    } catch (error) {
      alert('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  const openEditModal = (cls: ClassData) => {
    setEditingClass(cls)
    setFormData({ name: cls.name })
    setFormError('')
    setShowEditModal(true)
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Kelola Kelas</h1>
          <p className="text-gray-500 text-sm mt-1">Tambah, edit, atau hapus kelas</p>
        </div>
        {isSuperAdmin && (
          <Button
            onClick={() => {
              setFormData({ name: '' })
              setFormError('')
              setShowAddModal(true)
            }}
            className="bg-gradient-to-r from-[#ff8c00] to-[#ffc107] hover:from-[#e67e00] hover:to-[#e6ad00] h-9"
          >
            <Plus className="w-4 h-4 mr-1" />
            Tambah Kelas
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Cari kelas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Classes Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredClasses.map((cls, index) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`hover:shadow-lg transition-all cursor-pointer ${
              selectedClass?.id === cls.id ? 'ring-2 ring-[#ff8c00]' : ''
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      setSelectedClass(cls)
                      setShowStudentsModal(true)
                    }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-[#ff8c00] to-[#ffc107] rounded-xl flex items-center justify-center mb-3">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{cls.name}</h3>
                  </div>
                  {isSuperAdmin && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(cls)}
                        className="h-7 w-7 p-0 text-blue-500 hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteClass(cls.id)}
                        className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                        title="Hapus"
                        disabled={saving}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 text-[#ff8c00]" />
                    <span>{cls._count.students} siswa</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-[#ff8c00]" />
                    <span>{cls.sessions.length} sesi</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 h-8 text-[#ff8c00] border-[#ff8c00]"
                  onClick={() => {
                    setSelectedClass(cls)
                    setShowStudentsModal(true)
                  }}
                >
                  Lihat Siswa
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">Tidak ada kelas ditemukan</p>
        </div>
      )}

      {/* Add Class Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl w-full max-w-md p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold mb-4">Tambah Kelas Baru</h2>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Nama Kelas *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    placeholder="Contoh: Kelas 1A, Kelas 12"
                    className="h-10 mt-1"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-10"
                    onClick={() => {
                      setShowAddModal(false)
                      setFormData({ name: '' })
                      setFormError('')
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    className="flex-1 h-10 bg-gradient-to-r from-[#ff8c00] to-[#ffc107] hover:from-[#e67e00] hover:to-[#e6ad00]"
                    onClick={handleAddClass}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-1" />
                    )}
                    Simpan
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Class Modal */}
      <AnimatePresence>
        {showEditModal && editingClass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl w-full max-w-md p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold mb-4">Edit Kelas</h2>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Nama Kelas *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    placeholder="Nama kelas"
                    className="h-10 mt-1"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-10"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingClass(null)
                      setFormData({ name: '' })
                      setFormError('')
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    className="flex-1 h-10 bg-gradient-to-r from-[#ff8c00] to-[#ffc107] hover:from-[#e67e00] hover:to-[#e6ad00]"
                    onClick={handleEditClass}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-1" />
                    )}
                    Simpan
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Students Modal */}
      <AnimatePresence>
        {showStudentsModal && selectedClass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowStudentsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl w-full max-w-2xl max-h-[70vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-5 border-b bg-gradient-to-r from-[#ff8c00] to-[#ffc107] text-white flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">{selectedClass.name}</h2>
                  <p className="text-white/80 text-sm mt-1">{selectedClass._count.students} siswa • {selectedClass.sessions.length} sesi</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStudentsModal(false)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5">
                {selectedClass.students.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Belum ada siswa di kelas ini</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium text-gray-600 w-20">ID</th>
                          <th className="text-left p-3 font-medium text-gray-600">Nama</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedClass.students.map((student) => (
                          <tr key={student.id} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="p-3 font-medium text-[#ff8c00]">{student.studentId}</td>
                            <td className="p-3">
                              {student.name || <span className="text-gray-400 italic text-xs">(belum diisi)</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
