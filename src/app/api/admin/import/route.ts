import { NextRequest, NextResponse } from 'next/server'
import { getSession, isSuperAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'
import { parse } from 'date-fns'

// POST - Import data from Excel
export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'attendance', 'finance', 'students'

    if (!file || !type) {
      return NextResponse.json(
        { error: 'File dan tipe import harus diisi' },
        { status: 400 }
      )
    }

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    if (type === 'students') {
      return await importStudents(data, user)
    } else if (type === 'finance') {
      return await importFinance(data, user)
    } else {
      return NextResponse.json(
        { error: 'Tipe import tidak valid' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat import' },
      { status: 500 }
    )
  }
}

async function importStudents(data: any[], user: any) {
  if (!isSuperAdmin(user)) {
    return NextResponse.json(
      { error: 'Hanya super admin yang dapat import siswa' },
      { status: 403 }
    )
  }

  let imported = 0
  let errors = 0

  for (const row of data) {
    try {
      // Find class by name
      const className = row['Kelas'] || row['kelas']
      const classData = await db.class.findFirst({
        where: { name: className },
      })

      if (!classData) {
        errors++
        continue
      }

      const studentId = row['Nomor Induk'] || row['nomor_induk'] || row['No Induk']
      const name = row['Nama'] || row['nama'] || row['Nama Siswa']

      if (!studentId || !name) {
        errors++
        continue
      }

      // Check if exists
      const existing = await db.student.findUnique({
        where: { studentId: String(studentId) },
      })

      if (existing) {
        // Update
        await db.student.update({
          where: { studentId: String(studentId) },
          data: { name: String(name), classId: classData.id },
        })
      } else {
        // Create
        await db.student.create({
          data: {
            studentId: String(studentId),
            name: String(name),
            classId: classData.id,
          },
        })
      }
      imported++
    } catch {
      errors++
    }
  }

  return NextResponse.json({
    success: true,
    imported,
    errors,
    message: `Berhasil import ${imported} siswa, ${errors} error`,
  })
}

async function importFinance(data: any[], user: any) {
  let imported = 0
  let errors = 0

  for (const row of data) {
    try {
      const tipeRaw = row['Tipe'] || row['tipe'] || row['Jenis']
      const type = tipeRaw?.toLowerCase().includes('masuk') ? 'income' : 'expense'
      
      const amountRaw = row['Jumlah'] || row['jumlah'] || row['Nominal']
      const amount = parseFloat(String(amountRaw).replace(/[^0-9.-]/g, ''))

      const category = row['Kategori'] || row['kategori'] || '-'
      const description = row['Keterangan'] || row['keterangan'] || row['Deskripsi'] || '-'

      // Parse date
      let date: Date
      const dateRaw = row['Tanggal'] || row['tanggal']
      if (dateRaw) {
        if (typeof dateRaw === 'number') {
          // Excel date serial number
          date = new Date((dateRaw - 25569) * 86400 * 1000)
        } else {
          date = parse(dateRaw, 'dd/MM/yyyy', new Date())
        }
      } else {
        date = new Date()
      }

      if (isNaN(amount)) {
        errors++
        continue
      }

      await db.finance.create({
        data: {
          type,
          amount,
          category,
          description,
          date,
          adminId: user.id,
        },
      })
      imported++
    } catch {
      errors++
    }
  }

  return NextResponse.json({
    success: true,
    imported,
    errors,
    message: `Berhasil import ${imported} transaksi, ${errors} error`,
  })
}
