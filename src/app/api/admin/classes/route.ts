import { NextResponse } from 'next/server'
import { getSession, isSuperAdmin } from '@/lib/auth'
import { db } from '@/lib/db'

// GET all classes with sessions and students
export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all classes (Kelas 1-12)
    const classes = await db.class.findMany({
      include: {
        sessions: {
          orderBy: { name: 'asc' },
        },
        students: {
          orderBy: { studentId: 'asc' },
        },
        _count: {
          select: { students: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ classes })
  } catch (error) {
    console.error('Get classes error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}

// POST create new class (super admin only)
export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json(
        { error: 'Hanya super admin yang dapat menambah kelas' },
        { status: 403 }
      )
    }

    const { name } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Nama kelas harus diisi' },
        { status: 400 }
      )
    }

    // Check if class already exists
    const existingClass = await db.class.findUnique({
      where: { name },
    })

    if (existingClass) {
      return NextResponse.json(
        { error: 'Kelas sudah ada' },
        { status: 400 }
      )
    }

    const newClass = await db.class.create({
      data: { name },
    })

    return NextResponse.json({ class: newClass })
  } catch (error) {
    console.error('Create class error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
