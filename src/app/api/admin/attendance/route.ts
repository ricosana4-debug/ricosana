import { NextRequest, NextResponse } from 'next/server'
import { getSession, isSuperAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { parseISO, startOfDay, endOfDay } from 'date-fns'

// GET attendance records
export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const classId = searchParams.get('classId')
    const sessionId = searchParams.get('sessionId')

    const where: any = {}
    
    if (date) {
      const dateObj = parseISO(date)
      where.date = {
        gte: startOfDay(dateObj),
        lte: endOfDay(dateObj),
      }
    }

    if (sessionId) {
      where.sessionId = sessionId
    }

    // Build student filter
    const studentWhere: any = {}
    if (classId) {
      studentWhere.classId = classId
    }

    if (Object.keys(studentWhere).length > 0) {
      const students = await db.student.findMany({
        where: studentWhere,
        select: { id: true },
      })
      where.studentId = { in: students.map((s) => s.id) }
    }

    const attendance = await db.attendance.findMany({
      where,
      include: {
        student: {
          include: { 
            class: true
          },
        },
        session: true,
        admin: true,
      },
      orderBy: [{ date: 'desc' }, { student: { studentId: 'asc' } }],
    })

    return NextResponse.json({ attendance })
  } catch (error) {
    console.error('Get attendance error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}

// POST create or update attendance
export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { studentId, sessionId, date, present } = await request.json()

    if (!studentId || !sessionId || !date) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    const dateObj = parseISO(date)
    const dayStart = startOfDay(dateObj)

    // Upsert attendance record
    const attendance = await db.attendance.upsert({
      where: {
        studentId_sessionId_date: {
          studentId,
          sessionId,
          date: dayStart,
        },
      },
      update: {
        present,
        adminId: user.id,
      },
      create: {
        studentId,
        sessionId,
        date: dayStart,
        present,
        adminId: user.id,
      },
      include: {
        student: {
          include: { class: true }
        },
        session: true,
      },
    })

    return NextResponse.json({ attendance })
  } catch (error) {
    console.error('Create/update attendance error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}

// PUT update attendance (super admin only)
export async function PUT(request: Request) {
  try {
    const user = await getSession()
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json(
        { error: 'Hanya super admin yang dapat mengubah absensi' },
        { status: 403 }
      )
    }

    const { id, present } = await request.json()

    const attendance = await db.attendance.update({
      where: { id },
      data: { present },
    })

    return NextResponse.json({ attendance })
  } catch (error) {
    console.error('Update attendance error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}

// DELETE attendance record (super admin only)
export async function DELETE(request: Request) {
  try {
    const user = await getSession()
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json(
        { error: 'Hanya super admin yang dapat menghapus absensi' },
        { status: 403 }
      )
    }

    const { id } = await request.json()

    await db.attendance.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete attendance error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
