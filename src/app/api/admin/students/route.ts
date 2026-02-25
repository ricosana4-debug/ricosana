import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

// GET all students
export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    const where: any = {}

    if (classId) {
      where.classId = classId
    }

    const students = await db.student.findMany({
      where,
      include: {
        class: true,
        session: true,
      },
      orderBy: [{ studentId: 'asc' }],
    })

    return NextResponse.json({ students })
  } catch (error) {
    console.error('Get students error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}

// POST create new student (all admins can add students)
export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { studentId, name, classId, sessionId } = await request.json()

    // Validate required fields
    if (!studentId || !studentId.trim()) {
      return NextResponse.json(
        { error: 'ID siswa harus diisi' },
        { status: 400 }
      )
    }

    if (!classId) {
      return NextResponse.json(
        { error: 'Kelas harus dipilih' },
        { status: 400 }
      )
    }

    // Check if student ID already exists
    const existingStudent = await db.student.findUnique({
      where: { studentId: studentId.trim().toUpperCase() },
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'ID siswa sudah digunakan. Gunakan ID lain.' },
        { status: 400 }
      )
    }

    // Validate class exists
    const classExists = await db.class.findUnique({
      where: { id: classId },
    })

    if (!classExists) {
      return NextResponse.json(
        { error: 'Kelas tidak valid' },
        { status: 400 }
      )
    }

    // Validate session if provided
    if (sessionId) {
      const sessionExists = await db.session.findFirst({
        where: { id: sessionId, classId },
      })

      if (!sessionExists) {
        return NextResponse.json(
          { error: 'Sesi tidak valid untuk kelas ini' },
          { status: 400 }
        )
      }
    }

    const student = await db.student.create({
      data: {
        studentId: studentId.trim().toUpperCase(),
        name: name?.trim() || null,
        classId,
        sessionId: sessionId || null,
      },
      include: {
        class: true,
        session: true,
      },
    })

    return NextResponse.json({ student })
  } catch (error) {
    console.error('Create student error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menyimpan data' },
      { status: 500 }
    )
  }
}

// PUT update student (all admins can update students)
export async function PUT(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, name, classId, sessionId } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID siswa harus diisi' },
        { status: 400 }
      )
    }

    // Validate class if provided
    if (classId) {
      const classExists = await db.class.findUnique({
        where: { id: classId },
      })

      if (!classExists) {
        return NextResponse.json(
          { error: 'Kelas tidak valid' },
          { status: 400 }
        )
      }
    }

    // Validate session if provided
    if (sessionId) {
      const sessionExists = await db.session.findFirst({
        where: { id: sessionId, classId },
      })

      if (!sessionExists) {
        return NextResponse.json(
          { error: 'Sesi tidak valid untuk kelas ini' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    
    if (name !== undefined) updateData.name = name?.trim() || null
    if (classId !== undefined) updateData.classId = classId
    if (sessionId !== undefined) updateData.sessionId = sessionId || null

    const student = await db.student.update({
      where: { id },
      data: updateData,
      include: {
        class: true,
        session: true,
      },
    })

    return NextResponse.json({ student })
  } catch (error) {
    console.error('Update student error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate data' },
      { status: 500 }
    )
  }
}

// DELETE student (all admins can delete students)
export async function DELETE(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID siswa harus diisi' },
        { status: 400 }
      )
    }

    // Delete attendance records first (cascade)
    await db.attendance.deleteMany({
      where: { studentId: id },
    })

    await db.student.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete student error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus data' },
      { status: 500 }
    )
  }
}
