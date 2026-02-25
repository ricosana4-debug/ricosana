'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  RefreshCw,
  Users,
  Search,
  User,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format, addDays, subDays } from 'date-fns'
import { id } from 'date-fns/locale/id'

interface ClassData {
  id: string
  name: string
  sessions: { id: string; name: string; time: string | null }[]
  students: { id: string; studentId: string; name: string | null }[]
  _count: { students: number }
}

interface AttendanceRecord {
  id: string
  studentId: string
  present: boolean
  date: string
  admin: { id: string; name: string } | null
  session: { id: string; name: string }
}

interface User {
  id: string
  name: string
  role: string
}

export default function AttendancePage() {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [selectedSession, setSelectedSession] = useState<{ id: string; name: string; time: string | null } | null>(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [attendance, setAttendance] = useState<Map<string, { present: boolean; adminName: string | null }>>(new Map())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [savingAll, setSavingAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchUser()
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedClass && selectedSession) {
      fetchAttendance()
    }
  }, [selectedClass, selectedSession, selectedDate])

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

  const fetchAttendance = async () => {
    if (!selectedSession) return

    try {
      const res = await fetch(
        `/api/admin/attendance?date=${selectedDate}&sessionId=${selectedSession.id}`
      )
      const data = await res.json()
      
      const attendanceMap = new Map<string, { present: boolean; adminName: string | null }>()
      data.attendance?.forEach((a: AttendanceRecord) => {
        attendanceMap.set(a.studentId, {
          present: a.present,
          adminName: a.admin?.name || null
        })
      })
      setAttendance(attendanceMap)
    } catch (error) {
      console.error('Error fetching attendance:', error)
    }
  }

  const handleAttendanceChange = async (studentId: string, present: boolean) => {
    if (!selectedSession) return

    setSaving(studentId)
    try {
      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          sessionId: selectedSession.id,
          date: selectedDate,
          present,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setAttendance((prev) => {
          const newMap = new Map(prev)
          newMap.set(studentId, {
            present,
            adminName: user?.name || null
          })
          return newMap
        })
      }
    } catch (error) {
      console.error('Error updating attendance:', error)
    } finally {
      setSaving(null)
    }
  }

  const handleMarkAllPresent = async () => {
    if (!selectedClass || !selectedSession) return

    setSavingAll(true)
    try {
      const promises = selectedClass.students.map((student) =>
        fetch('/api/admin/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: student.id,
            sessionId: selectedSession.id,
            date: selectedDate,
            present: true,
          }),
        })
      )

      await Promise.all(promises)
      
      const newMap = new Map<string, { present: boolean; adminName: string | null }>()
      selectedClass.students.forEach((s) => newMap.set(s.id, { present: true, adminName: user?.name || null }))
      setAttendance(newMap)
    } catch (error) {
      console.error('Error marking all present:', error)
    } finally {
      setSavingAll(false)
    }
  }

  const handleExport = async () => {
    if (!selectedClass) return

    const month = selectedDate.split('-')[1]
    const year = selectedDate.split('-')[0]

    window.open(
      `/api/admin/export?type=attendance&classId=${selectedClass.id}&month=${month}&year=${year}`,
      '_blank'
    )
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const current = new Date(selectedDate)
    const newDate = direction === 'next' ? addDays(current, 1) : subDays(current, 1)
    setSelectedDate(format(newDate, 'yyyy-MM-dd'))
  }

  const handleClassChange = (classId: string) => {
    const cls = classes.find((c) => c.id === classId)
    if (cls) {
      setSelectedClass(cls)
      if (cls.sessions?.length > 0) {
        setSelectedSession(cls.sessions[0])
      }
      setAttendance(new Map())
    }
  }

  const handleSessionChange = (sessionId: string) => {
    const session = selectedClass?.sessions.find((s) => s.id === sessionId)
    if (session) {
      setSelectedSession(session)
    }
  }

  // Filter students from database - NO MANUAL INPUT
  const filteredStudents = selectedClass?.students.filter((s) =>
    (s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Count attendance stats
  const presentCount = Array.from(attendance.values()).filter(v => v.present === true).length
  const absentCount = Array.from(attendance.values()).filter(v => v.present === false).length
  const notMarkedCount = (filteredStudents?.length || 0) - presentCount - absentCount

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
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Absensi Siswa</h1>
        <p className="text-gray-500 text-sm mt-1">Catat kehadiran siswa berdasarkan data yang tersedia di database</p>
      </div>

      {/* Teacher Info Card */}
      {user && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-blue-900">Guru: {user.name}</p>
            <p className="text-sm text-blue-600">Absensi akan dicatat atas nama Anda</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Class Select - Kelas 1-12 */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Kelas</label>
          <select
            value={selectedClass?.id || ''}
            onChange={(e) => handleClassChange(e.target.value)}
            className="w-full h-9 px-2 border rounded-lg text-sm bg-white"
          >
            <option value="">Pilih Kelas</option>
            {classes?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c._count?.students || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Session Select - Sesi 1-5 */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Sesi</label>
          <select
            value={selectedSession?.id || ''}
            onChange={(e) => handleSessionChange(e.target.value)}
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

        {/* Date Picker */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Tanggal</label>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 px-2 border rounded-lg flex-1 text-sm"
            />
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => navigateDate('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Cari Siswa</label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="ID / nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-[#ff8c00] to-[#ffc107] text-white rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6" />
            <div>
              <p className="font-semibold">
                {format(new Date(selectedDate), 'EEEE, dd MMMM yyyy', { locale: id })}
              </p>
              <p className="text-white/80 text-sm flex items-center gap-2">
                <span>{selectedClass?.name || 'Pilih kelas'}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {selectedSession?.name || 'Pilih sesi'}
                </span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAttendance}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 h-8"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 h-8"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button
              onClick={handleMarkAllPresent}
              disabled={savingAll || !selectedClass || !selectedSession || filteredStudents?.length === 0}
              size="sm"
              className="bg-green-500 hover:bg-green-600 h-8"
            >
              {savingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span className="ml-1">Semua Hadir</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{presentCount}</p>
          <p className="text-xs text-green-600">Hadir</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{absentCount}</p>
          <p className="text-xs text-red-600">Tidak Hadir</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-600">{notMarkedCount}</p>
          <p className="text-xs text-gray-600">Belum Absen</p>
        </div>
      </div>

      {/* Attendance Card */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            Daftar Siswa dari Database ({filteredStudents?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!selectedClass ? (
            <p className="text-center text-gray-500 py-8 text-sm">Pilih kelas terlebih dahulu</p>
          ) : !selectedSession ? (
            <p className="text-center text-gray-500 py-8 text-sm">Pilih sesi terlebih dahulu</p>
          ) : filteredStudents && filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Belum ada siswa di kelas ini.</p>
              <p className="text-xs mt-1">Tambahkan siswa di menu "Data Siswa" terlebih dahulu.</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="border-b">
                    <th className="text-left p-3 text-xs font-medium text-gray-500 w-16">ID</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500">Nama Siswa</th>
                    <th className="text-center p-3 text-xs font-medium text-gray-500 w-28">Status</th>
                    <th className="text-center p-3 text-xs font-medium text-gray-500 w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents?.map((student, index) => {
                    const attendanceData = attendance.get(student.id)
                    const isPresent = attendanceData?.present
                    const adminName = attendanceData?.adminName
                    const isLoading = saving === student.id

                    return (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.005 }}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >
                        <td className="p-3 text-sm font-medium text-[#ff8c00]">{student.studentId}</td>
                        <td className="p-3 text-sm">
                          <div>
                            {student.name || <span className="text-gray-400 italic text-xs">Nama belum diisi</span>}
                            {adminName && isPresent !== undefined && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                Dicatat oleh: {adminName}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              isPresent
                                ? 'bg-green-100 text-green-700'
                                : isPresent === false
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {isPresent ? (
                              <><Check className="w-3 h-3" /> Hadir</>
                            ) : isPresent === false ? (
                              <><X className="w-3 h-3" /> Tidak Hadir</>
                            ) : (
                              'Belum'
                            )}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center gap-1">
                            <Button
                              size="sm"
                              variant={isPresent === true ? 'default' : 'outline'}
                              onClick={() => handleAttendanceChange(student.id, true)}
                              disabled={isLoading || !selectedSession}
                              className={`h-7 w-7 p-0 ${isPresent === true ? 'bg-green-500 hover:bg-green-600' : 'border-green-500 text-green-500 hover:bg-green-50'}`}
                              title="Hadir"
                            >
                              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant={isPresent === false ? 'destructive' : 'outline'}
                              onClick={() => handleAttendanceChange(student.id, false)}
                              disabled={isLoading || !selectedSession}
                              className={`h-7 w-7 p-0 ${isPresent === false ? '' : 'border-red-500 text-red-500 hover:bg-red-50'}`}
                              title="Tidak Hadir"
                            >
                              <X className="w-3 h-3" />
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

      {/* Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs text-amber-700">
          <strong>Catatan:</strong> Data siswa diambil otomatis dari database. Untuk menambah siswa baru, gunakan menu "Data Siswa". 
          Absensi akan mencatat guru yang melakukan input.
        </p>
      </div>
    </div>
  )
}
