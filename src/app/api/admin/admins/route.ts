import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

// GET all admins
export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admins = await db.admin.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ admins })
  } catch (error) {
    console.error('Get admins error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
