import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'

// GET - Export data to Excel
export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'attendance' or 'finance'

    if (type === 'attendance') {
      return await exportAttendance(searchParams)
    } else if (type === 'finance') {
      return await exportFinance(searchParams)
    } else {
      return NextResponse.json(
        { error: 'Tipe export tidak valid' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat export' },
      { status: 500 }
    )
  }
}

async function exportAttendance(searchParams: URLSearchParams) {
  const classId = searchParams.get('classId')
  const month = searchParams.get('month')
  const year = searchParams.get('year')

  const where: any = {}

  if (classId) {
    const students = await db.student.findMany({
      where: { classId },
      select: { id: true },
    })
    where.studentId = { in: students.map((s) => s.id) }
  }

  if (month && year) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
    where.date = { gte: startDate, lte: endDate }
  }

  const attendance = await db.attendance.findMany({
    where,
    include: {
      student: { include: { class: true } },
      session: true,
    },
    orderBy: [{ date: 'asc' }, { student: { studentId: 'asc' } }],
  })

  const data = attendance.map((a) => ({
    Tanggal: format(a.date, 'dd/MM/yyyy'),
    'Nomor Induk': a.student.studentId,
    'Nama Siswa': a.student.name,
    Kelas: a.student.class.name,
    Sesi: a.session.name,
    'Waktu Sesi': a.session.time || '-',
    Status: a.present ? 'Hadir' : 'Tidak Hadir',
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Absensi')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="absensi-${format(new Date(), 'yyyyMMdd')}.xlsx"`,
    },
  })
}

async function exportFinance(searchParams: URLSearchParams) {
  const month = searchParams.get('month')
  const year = searchParams.get('year')

  const where: any = {}

  if (month && year) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
    where.date = { gte: startDate, lte: endDate }
  } else if (year) {
    const startDate = new Date(parseInt(year), 0, 1)
    const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59)
    where.date = { gte: startDate, lte: endDate }
  }

  const finance = await db.finance.findMany({
    where,
    orderBy: { date: 'desc' },
  })

  const data = finance.map((f) => ({
    Tanggal: format(f.date, 'dd/MM/yyyy'),
    Tipe: f.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    Jumlah: f.amount,
    Kategori: f.category || '-',
    Keterangan: f.description || '-',
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Keuangan')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="keuangan-${format(new Date(), 'yyyyMMdd')}.xlsx"`,
    },
  })
}
