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
  GraduationCap,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Jenjang {
  id: string
  name: string
  classes: ClassData[]
}

interface ClassData {
  id: string
  name: string
  jenjang: { id: string; name: string }
  sessions: { id: string; name: string; time: string | null }[]
  students: { id: string; studentId: string; name: string | null }[]
  _count: { students: number }
}

interface User {
  id: string
  role: string
}

export default function ClassesPage() {
  const [jenjangList, setJenjangList] = useState<Jenjang[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJenjang, setSelectedJenjang] = useState<Jenjang | null>(null)
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<any>(null)
  const [studentForm, setStudentForm] = useState({
    studentId: '',
    name: '',
    classId: '',
  })
  const [saving, setSaving] = useState(false)

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
      setJenjangList(data.jenjang || [])
      if (data.jenjang?.length > 0) {
        setSelectedJenjang(data.jenjang[0])
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const isSuperAdmin = user?.role === 'super_admin'

  const filteredStudents = selectedClass?.students.filter((s) =>
    (s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSuperAdmin || !editingStudent) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingStudent.id,
          studentId: studentForm.studentId,
          name: studentForm.name || null,
          classId: studentForm.classId || selectedClass?.id,
        }),
      })

      if (res.ok) {
        await fetchData()
        setEditingStudent(null)
        setStudentForm({ studentId: '', name: '', classId: '' })
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal mengupdate siswa')
      }
    } catch (error) {
      alert('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteStudent = async (id: string) => {
    if (!isSuperAdmin) return
    if (!confirm('Yakin ingin menghapus siswa ini?')) return

    try {
      const res = await fetch('/api/admin/students', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
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
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Kelas & Siswa</h1>
        <p className="text-gray-500 mt-1">Kelola data kelas dan siswa</p>
      </div>

      {/* Jenjang Tabs */}
      <div className="flex flex-wrap gap-2">
        {jenjangList.map((j) => (
          <button
            key={j.id}
            onClick={() => {
              setSelectedJenjang(j)
              setSelectedClass(null)
            }}
            className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
              selectedJenjang?.id === j.id
                ? 'bg-gradient-to-r from-[#ff8c00] to-[#ffc107] text-white shadow-lg'
                : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            {j.name}
            <span className="text-xs opacity-80">({j.classes?.length || 0} kelas)</span>
          </button>
        ))}
      </div>

      {/* Classes Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {selectedJenjang?.classes.map((cls, index) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={`cursor-pointer hover:shadow-lg transition-all ${
                selectedClass?.id === cls.id ? 'ring-2 ring-[#ff8c00]' : ''
              }`}
              onClick={() => {
                setSelectedClass(cls)
                setSearchQuery('')
              }}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-[#ff8c00] to-[#ffc107] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900">{cls.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{cls.sessions.length} sesi</p>
                <div className="flex items-center justify-center gap-1 mt-2 text-[#ff8c00]">
                  <Users className="w-4 h-4" />
                  <span className="font-bold">{cls._count.students}</span>
                  <span className="text-xs text-gray-500">siswa</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Student List Modal */}
      <AnimatePresence>
        {selectedClass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedClass(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b bg-gradient-to-r from-[#ff8c00] to-[#ffc107] text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{selectedClass.name}</h2>
                    <p className="text-white/80 text-sm mt-1">
                      {selectedClass.jenjang.name} • {selectedClass._count.students} siswa • {selectedClass.sessions.length} sesi
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedClass(null)}
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Sessions */}
              <div className="p-4 border-b bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-2">Jadwal Sesi:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedClass.sessions.map((s) => (
                    <span
                      key={s.id}
                      className="px-3 py-1 bg-white border rounded-full text-sm text-gray-600"
                    >
                      {s.name}: {s.time || '-'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Cari siswa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Students List */}
              <div className="p-4 overflow-y-auto max-h-[400px]">
                {selectedClass.students.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Belum ada siswa</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="pb-2 w-20">No. Urut</th>
                        <th className="pb-2">Nama Siswa</th>
                        {isSuperAdmin && <th className="pb-2 text-right w-24">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {(searchQuery ? filteredStudents : selectedClass.students)?.map((student) => (
                        <tr key={student.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-3 text-sm font-medium">{student.studentId}</td>
                          <td className="py-3 text-sm">
                            {student.name || <span className="text-gray-400 italic">Belum diisi</span>}
                          </td>
                          {isSuperAdmin && (
                            <td className="py-3 text-right">
                              <button
                                onClick={() => {
                                  setEditingStudent(student)
                                  setStudentForm({
                                    studentId: student.studentId,
                                    name: student.name || '',
                                    classId: selectedClass.id,
                                  })
                                }}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(student.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Student Modal */}
      <AnimatePresence>
        {editingStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setEditingStudent(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Edit Siswa</h2>
              <form onSubmit={handleUpdateStudent} className="space-y-4">
                <div>
                  <Label>No. Urut</Label>
                  <Input
                    value={studentForm.studentId}
                    onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Nama Siswa</Label>
                  <Input
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    placeholder="Kosongkan jika belum diisi"
                  />
                </div>
                <div>
                  <Label>Kelas</Label>
                  <select
                    value={studentForm.classId}
                    onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })}
                    className="w-full h-10 px-3 border rounded-lg"
                    required
                  >
                    {jenjangList.flatMap((j) => j.classes).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.jenjang.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditingStudent(null)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-[#ff8c00] hover:bg-[#e67e00]"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Update
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
