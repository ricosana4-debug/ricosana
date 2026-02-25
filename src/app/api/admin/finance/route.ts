import { NextRequest, NextResponse } from 'next/server'
import { getSession, isSuperAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns'

// GET finance records
export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const where: any = {}

    if (type && (type === 'income' || type === 'expense')) {
      where.type = type
    }

    if (month && year) {
      const dateObj = new Date(parseInt(year), parseInt(month) - 1)
      where.date = {
        gte: startOfMonth(dateObj),
        lte: endOfMonth(dateObj),
      }
    } else if (year) {
      const dateObj = new Date(parseInt(year), 0)
      where.date = {
        gte: startOfYear(dateObj),
        lte: endOfYear(dateObj),
      }
    }

    const finance = await db.finance.findMany({
      where,
      include: {
        admin: true,
      },
      orderBy: { date: 'desc' },
    })

    // Calculate summary
    const totalIncome = finance
      .filter((f) => f.type === 'income')
      .reduce((sum, f) => sum + f.amount, 0)

    const totalExpense = finance
      .filter((f) => f.type === 'expense')
      .reduce((sum, f) => sum + f.amount, 0)

    const balance = totalIncome - totalExpense

    // Monthly summary for charts
    const monthlyData: { [key: string]: { income: number; expense: number } } = {}
    
    finance.forEach((f) => {
      const monthKey = format(f.date, 'yyyy-MM')
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 }
      }
      if (f.type === 'income') {
        monthlyData[monthKey].income += f.amount
      } else {
        monthlyData[monthKey].expense += f.amount
      }
    })

    return NextResponse.json({
      finance,
      summary: {
        totalIncome,
        totalExpense,
        balance,
      },
      monthlyData,
    })
  } catch (error) {
    console.error('Get finance error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}

// POST create finance record
export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, amount, description, category, date } = await request.json()

    if (!type || !amount || !date) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    if (type !== 'income' && type !== 'expense') {
      return NextResponse.json(
        { error: 'Tipe harus income atau expense' },
        { status: 400 }
      )
    }

    const finance = await db.finance.create({
      data: {
        type,
        amount: parseFloat(amount),
        description,
        category,
        date: parseISO(date),
        adminId: user.id,
      },
    })

    return NextResponse.json({ finance })
  } catch (error) {
    console.error('Create finance error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}

// PUT update finance record (super admin only)
export async function PUT(request: Request) {
  try {
    const user = await getSession()
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json(
        { error: 'Hanya super admin yang dapat mengubah data keuangan' },
        { status: 403 }
      )
    }

    const { id, type, amount, description, category, date } = await request.json()

    const finance = await db.finance.update({
      where: { id },
      data: {
        type,
        amount: parseFloat(amount),
        description,
        category,
        date: parseISO(date),
      },
    })

    return NextResponse.json({ finance })
  } catch (error) {
    console.error('Update finance error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}

// DELETE finance record (super admin only)
export async function DELETE(request: Request) {
  try {
    const user = await getSession()
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json(
        { error: 'Hanya super admin yang dapat menghapus data keuangan' },
        { status: 403 }
      )
    }

    const { id } = await request.json()

    await db.finance.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete finance error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
