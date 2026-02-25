import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import Papa from 'papaparse'

interface StudentRow {
  studentId?: string
  id?: string
  name?: string
  classId?: string
  sessionId?: string
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 }
      )
    }

    const text = await file.text()
    const classId = formData.get('classId') as string

    if (!classId) {
      return NextResponse.json(
        { error: 'Kelas harus dipilih' },
        { status: 400 }
      )
    }

    // Validate class exists
    const classExists = await db.class.findUnique({
      where: { id: classId },
    })

    if (!classExists) {
      return NextResponse.json(
        { error: 'Kelas tidak ditemukan' },
        { status: 400 }
      )
    }

    // Get admin for this class
    const admin = await db.admin.findFirst({
      where: { assignedClass: classExists.name },
    })

    // Parse CSV
    let rows: StudentRow[] = []
    
    try {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          rows = results.data as StudentRow[]
        },
        error: (error) => {
          throw new Error(`CSV Parse Error: ${error.message}`)
        }
      })
    } catch (error) {
      return NextResponse.json(
        { error: `Error parsing file: ${(error as Error).message}` },
        { status: 400 }
      )
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'File tidak memiliki data siswa' },
        { status: 400 }
      )
    }

    // Validate and import
    const results = {
      success: 0,
      failed: 0,
      errors: [] as { row: number; studentId: string; error: string }[]
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // +2 because row 1 is header
      
      const studentId = (row.studentId || row.id || '').trim().toUpperCase()
      const name = (row.name || '').trim()
      const sessionId = (row.sessionId || '').trim() || null

      // Validation
      if (!studentId) {
        results.failed++
        results.errors.push({
          row: rowNum,
          studentId: 'N/A',
          error: 'ID siswa kosong'
        })
        continue
      }

      if (!name) {
        results.failed++
        results.errors.push({
          row: rowNum,
          studentId,
          error: 'Nama siswa kosong'
        })
        continue
      }

      // Check duplicate
      const existing = await db.student.findUnique({
        where: { studentId }
      })

      if (existing) {
        results.failed++
        results.errors.push({
          row: rowNum,
          studentId,
          error: 'ID siswa sudah terdaftar'
        })
        continue
      }

      // Validate session if provided
      if (sessionId) {
        const sessionValid = await db.session.findFirst({
          where: { id: sessionId, classId }
        })

        if (!sessionValid) {
          results.failed++
          results.errors.push({
            row: rowNum,
            studentId,
            error: 'Sesi tidak ditemukan untuk kelas ini'
          })
          continue
        }
      }

      // Create student
      try {
        await db.student.create({
          data: {
            studentId,
            name,
            classId,
            sessionId: sessionId as string | null,
            status: 'active',
            adminId: admin?.id || null
          }
        })
        results.success++
      } catch (error) {
        results.failed++
        results.errors.push({
          row: rowNum,
          studentId,
          error: 'Gagal menyimpan data'
        })
      }
    }

    return NextResponse.json({
      message: `Import selesai: ${results.success} berhasil, ${results.failed} gagal`,
      results,
      totalCount: rows.length
    })
  } catch (error) {
    console.error('Import students error:', error)
    return NextResponse.json(
      { error: `Terjadi kesalahan: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}
