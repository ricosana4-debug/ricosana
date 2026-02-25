'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Search,
  Save,
  Loader2,
  Check,
  X,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  UserPlus,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'

interface ClassData {
  id: string
  name: string
  sessions: { id: string; name: string; time: string | null }[]
  students: { id: string; studentId: string; name: string | null; sessionId: string | null }[]
  _count: { students: number }
}

interface User {
  id: string
  name: string
  role: string
}

export default function StudentsPage() {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [selectedSession, setSelectedSession] = useState<{ id: string; name: string; time: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<{ id: string; studentId: string; name: string; classId: string; sessionId: string | null } | null>(null)
  
  // Form states for adding new student
  const [newStudentId, setNewStudentId] = useState('')
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentClass, setNewStudentClass] = useState('')
  const [newStudentSession, setNewStudentSession] = useState('')
  const [addingStudent, setAddingStudent] = useState(false)
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
      const classesRes = await fetch('/api/admin/classes')
      const classesData = await classesRes.json()
      
      setClasses(classesData.classes || [])
      
      if (classesData.classes?.length > 0) {
        const firstClass = classesData.classes[0]
        setSelectedClass(firstClass)
        
        if (firstClass.sessions?.length > 0) {
          setSelectedSession(firstClass.sessions[0])
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetAddForm = () => {
    setNewStudentId('')
    setNewStudentName('')
    setNewStudentClass(selectedClass?.id || '')
    setNewStudentSession('')
    setFormError('')
  }

  const handleAddStudent = async () => {
    setFormError('')
    
    if (!newStudentId.trim()) {
      setFormError('ID Siswa harus diisi!')
      return
    }
    if (!newStudentName.trim()) {
      setFormError('Nama siswa harus diisi!')
      return
    }
    if (!newStudentClass) {
      setFormError('Kelas harus dipilih!')
      return
    }

    setAddingStudent(true)
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: newStudentId.trim(),
          name: newStudentName.trim(),
          classId: newStudentClass,
          sessionId: newStudentSession || null,
        }),
      })

      if (res.ok) {
        await fetchData()
        setShowAddModal(false)
        resetAddForm()
      } else {
        const data = await res.json()
        setFormError(data.error || 'Gagal menambah siswa')
      }
    } catch (error) {
      setFormError('Terjadi kesalahan')
    } finally {
      setAddingStudent(false)
    }
  }

  const handleEditStudent = async () => {
    if (!editingStudent || !editingStudent.name.trim()) {
      setFormError('Nama harus diisi!')
      return
    }

    setSaving(editingStudent.id)
    try {
      const res = await fetch('/api/admin/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingStudent.id,
          name: editingStudent.name.trim(),
          classId: editingStudent.classId,
          sessionId: editingStudent.sessionId,
        }),
      })

      if (res.ok) {
        await fetchData()
        setShowEditModal(false)
        setEditingStudent(null)
        setFormError('')
      } else {
        const data = await res.json()
        setFormError(data.error || 'Gagal mengupdate siswa')
      }
    } catch (error) {
      setFormError('Terjadi kesalahan')
    } finally {
      setSaving(null)
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Yakin ingin menghapus siswa ini? Data absensi siswa ini juga akan terhapus.')) return

    try {
      const res = await fetch('/api/admin/students', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: studentId }),
      })

      if (res.ok) {
        await fetchData()
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal menghapus siswa')
      }
    } catch (error) {
      alert('Terjadi kesalahan')
    }
  }

  const openAddModal = () => {
    resetAddForm()
    setNewStudentClass(selectedClass?.id || '')
    setShowAddModal(true)
  }

  const openEditModal = (student: { id: string; studentId: string; name: string | null; classId: string; sessionId: string | null }) => {
    setEditingStudent({
      id: student.id,
      studentId: student.studentId,
      name: student.name || '',
      classId: student.classId,
      sessionId: student.sessionId,
    })
    setFormError('')
    setShowEditModal(true)
  }

  const handleClassChange = (cls: ClassData) => {
    setSelectedClass(cls)
    if (cls.sessions?.length > 0) {
      setSelectedSession(cls.sessions[0])
    }
  }

  const filteredStudents = selectedClass?.students.filter((s) => {
    const name = s.name || ''
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Get sessions for selected class in add/edit modal
  const getSessionsForClass = (classId: string) => {
    const cls = classes.find(c => c.id === classId)
    return cls?.sessions || []
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
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Data Siswa</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola data siswa - Tambah, Edit, Hapus</p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-gradient-to-r from-[#ff8c00] to-[#ffc107] hover:from-[#e67e00] hover:to-[#e6ad00] h-9"
        >
          <Plus className="w-4 h-4 mr-1" />
          Tambah Siswa
        </Button>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Class Select - Kelas 1-12 */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Filter Kelas</label>
          <select
            value={selectedClass?.id || ''}
            onChange={(e) => {
              const cls = classes.find((c) => c.id === e.target.value)
              if (cls) handleClassChange(cls)
            }}
            className="w-full h-9 px-2 border rounded-lg text-sm bg-white"
          >
            {classes.length > 0 ? (
              classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c._count?.students || 0} siswa)
                </option>
              ))
            ) : (
              <option value="">Tidak ada kelas</option>
            )}
          </select>
        </div>

        {/* Session Select - Sesi 1-5 */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Filter Sesi</label>
          <select
            value={selectedSession?.id || ''}
            onChange={(e) => {
              const session = selectedClass?.sessions.find((s) => s.id === e.target.value)
              setSelectedSession(session || null)
            }}
            className="w-full h-9 px-2 border rounded-lg text-sm bg-white"
            disabled={!selectedClass?.sessions?.length}
          >
            {selectedClass?.sessions && selectedClass.sessions.length > 0 ? (
              selectedClass.sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.time ? `(${s.time})` : ''}
                </option>
              ))
            ) : (
              <option value="">Tidak ada sesi</option>
            )}
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Cari Siswa</label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="ID / nama siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-[#ff8c00] to-[#ffc107] text-white rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6" />
            <div>
              <p className="font-semibold">
                {selectedClass?.name || 'Pilih Kelas'}
              </p>
              <p className="text-white/80 text-sm">
                Total {filteredStudents?.length || 0} siswa
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 h-8"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            Daftar Siswa ({filteredStudents?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!selectedClass ? (
            <p className="text-center text-gray-500 py-8 text-sm">Pilih kelas terlebih dahulu</p>
          ) : selectedClass.students.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Belum ada siswa di kelas ini.</p>
              <p className="text-xs mt-1">Klik "Tambah Siswa" untuk menambahkan siswa baru.</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="border-b">
                    <th className="text-left p-3 text-xs font-medium text-gray-500 w-16">ID</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500">Nama Siswa</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 w-20">Kelas</th>
                    <th className="text-center p-3 text-xs font-medium text-gray-500 w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents?.map((student, index) => {
                    const isLoading = saving === student.id

                    return (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.01 }}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >
                        <td className="p-3 text-sm font-medium text-[#ff8c00]">{student.studentId}</td>
                        <td className="p-3 text-sm">
                          {student.name || <span className="text-gray-400 italic text-xs">Belum diisi</span>}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                            {selectedClass.name}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal({ ...student, classId: selectedClass.id })}
                              disabled={isLoading}
                              className="h-7 w-7 p-0"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteStudent(student.id)}
                              className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                              title="Hapus"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Student Modal */}
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
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#ff8c00]" />
                Tambah Siswa Baru
              </h2>
              
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                {/* Student ID */}
                <div>
                  <Label className="text-sm font-medium">ID Siswa (Unik) *</Label>
                  <Input
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value.toUpperCase())}
                    placeholder="Contoh: S001, A001, dll"
                    className="h-10 mt-1"
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">ID unik untuk mengidentifikasi siswa</p>
                </div>

                {/* Student Name */}
                <div>
                  <Label className="text-sm font-medium">Nama Siswa *</Label>
                  <Input
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Nama lengkap siswa"
                    className="h-10 mt-1"
                  />
                </div>

                {/* Class Selection */}
                <div>
                  <Label className="text-sm font-medium">Kelas *</Label>
                  <select
                    value={newStudentClass}
                    onChange={(e) => {
                      setNewStudentClass(e.target.value)
                      setNewStudentSession('') // Reset session when class changes
                    }}
                    className="w-full h-10 px-3 border rounded-lg text-sm mt-1"
                  >
                    <option value="">Pilih Kelas...</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Session Selection */}
                <div>
                  <Label className="text-sm font-medium">Sesi (Opsional)</Label>
                  <select
                    value={newStudentSession}
                    onChange={(e) => setNewStudentSession(e.target.value)}
                    className="w-full h-10 px-3 border rounded-lg text-sm mt-1"
                    disabled={!newStudentClass}
                  >
                    <option value="">Pilih Sesi...</option>
                    {getSessionsForClass(newStudentClass).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.time ? `(${s.time})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-10"
                    onClick={() => {
                      setShowAddModal(false)
                      resetAddForm()
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    className="flex-1 h-10 bg-gradient-to-r from-[#ff8c00] to-[#ffc107] hover:from-[#e67e00] hover:to-[#e6ad00]"
                    onClick={handleAddStudent}
                    disabled={addingStudent}
                  >
                    {addingStudent ? (
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

      {/* Edit Student Modal */}
      <AnimatePresence>
        {showEditModal && editingStudent && (
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
              <h2 className="text-lg font-bold mb-4">Edit Siswa</h2>
              
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">ID Siswa</Label>
                  <Input
                    value={editingStudent.studentId}
                    disabled
                    className="h-10 mt-1 bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">ID tidak dapat diubah</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Nama Siswa *</Label>
                  <Input
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    placeholder="Nama lengkap siswa"
                    className="h-10 mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Kelas *</Label>
                  <select
                    value={editingStudent.classId}
                    onChange={(e) => {
                      setEditingStudent({ ...editingStudent, classId: e.target.value, sessionId: null })
                    }}
                    className="w-full h-10 px-3 border rounded-lg text-sm mt-1"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Sesi</Label>
                  <select
                    value={editingStudent.sessionId || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, sessionId: e.target.value || null })}
                    className="w-full h-10 px-3 border rounded-lg text-sm mt-1"
                  >
                    <option value="">Pilih Sesi...</option>
                    {getSessionsForClass(editingStudent.classId).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.time ? `(${s.time})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-10"
                    onClick={() => {
                      setShowEditModal(false)
                      setFormError('')
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    className="flex-1 h-10 bg-gradient-to-r from-[#ff8c00] to-[#ffc107] hover:from-[#e67e00] hover:to-[#e6ad00]"
                    onClick={handleEditStudent}
                    disabled={saving === editingStudent.id}
                  >
                    {saving === editingStudent.id ? (
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
    </div>
  )
}
