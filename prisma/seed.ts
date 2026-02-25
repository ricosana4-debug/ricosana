import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  await prisma.attendance.deleteMany()
  await prisma.finance.deleteMany()
  await prisma.student.deleteMany()
  await prisma.session.deleteMany()
  await prisma.class.deleteMany()
  await prisma.admin.deleteMany()

  // Create 12 Admin accounts (1 super_admin, 8 teachers, 3 reserve admins)
  // Passwords are hashed using bcrypt
  const superAdminPassword = await bcrypt.hash('starlish@218', 10)
  const teacherPassword = await bcrypt.hash('admin123', 10)
  
  const admins = await Promise.all([
    // Super Admin
    prisma.admin.create({
      data: {
        email: 'charlien@starlish.com',
        name: 'Charlien Liuw',
        password: superAdminPassword,
        role: 'super_admin',
        isActive: true,
      },
    }),
    // 8 Teachers
    prisma.admin.create({
      data: {
        email: 'nadia@starlish.com',
        name: 'Nadia Dorothy',
        password: teacherPassword,
        role: 'teacher',
        isActive: true,
      },
    }),
    prisma.admin.create({
      data: {
        email: 'fadiya@starlish.com',
        name: 'Fadiya',
        password: teacherPassword,
        role: 'teacher',
        isActive: true,
      },
    }),
    prisma.admin.create({
      data: {
        email: 'laura@starlish.com',
        name: 'Laura',
        password: teacherPassword,
        role: 'teacher',
        isActive: true,
      },
    }),
    prisma.admin.create({
      data: {
        email: 'dwilestari@starlish.com',
        name: 'Dwi Lestari',
        password: teacherPassword,
        role: 'teacher',
        isActive: true,
      },
    }),
    prisma.admin.create({
      data: {
        email: 'nathania@starlish.com',
        name: 'Nathania Anggi Darmawan',
        password: teacherPassword,
        role: 'teacher',
        isActive: true,
      },
    }),
    prisma.admin.create({
      data: {
        email: 'eunike@starlish.com',
        name: 'Eunike',
        password: teacherPassword,
        role: 'teacher',
        isActive: true,
      },
    }),
    prisma.admin.create({
      data: {
        email: 'rika@starlish.com',
        name: 'Rika Puspita',
        password: teacherPassword,
        role: 'teacher',
        isActive: true,
      },
    }),
    prisma.admin.create({
      data: {
        email: 'neni@starlish.com',
        name: 'Neni Prasetyani',
        password: teacherPassword,
        role: 'teacher',
        isActive: true,
      },
    }),
    // 3 Reserve Admins (for future teachers)
    prisma.admin.create({
      data: {
        email: 'admin1@starlish.com',
        name: 'Admin 1',
        password: teacherPassword,
        role: 'teacher',
        isActive: true,
      },
    }),
    prisma.admin.create({
      data: {
        email: 'admin2@starlish.com',
        name: 'Admin 2',
        password: teacherPassword,
        role: 'teacher',
        isActive: true,
      },
    }),
    prisma.admin.create({
      data: {
        email: 'admin3@starlish.com',
        name: 'Admin 3',
        password: teacherPassword,
        role: 'teacher',
        isActive: true,
      },
    }),
  ])
  console.log(`✅ Created ${admins.length} admin accounts`)

  // Create 12 Classes (Kelas 1-12 only)
  const classNames = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6', 
                      'Kelas 7', 'Kelas 8', 'Kelas 9', 'Kelas 10', 'Kelas 11', 'Kelas 12']

  const classes = await Promise.all(
    classNames.map((name) =>
      prisma.class.create({
        data: { name },
      })
    )
  )
  console.log(`✅ Created ${classes.length} classes (Kelas 1-12)`)

  // Create 5 Sessions per Class (Sesi 1-5)
  const sessionTimes = [
    { name: 'Sesi 1', time: '08:00 - 09:30' },
    { name: 'Sesi 2', time: '09:45 - 11:15' },
    { name: 'Sesi 3', time: '13:00 - 14:30' },
    { name: 'Sesi 4', time: '14:45 - 16:15' },
    { name: 'Sesi 5', time: '16:30 - 18:00' },
  ]

  let sessionCount = 0
  for (const cls of classes) {
    await Promise.all(
      sessionTimes.map((session) =>
        prisma.session.create({
          data: {
            name: session.name,
            time: session.time,
            classId: cls.id,
          },
        })
      )
    )
    sessionCount += 5
  }
  console.log(`✅ Created ${sessionCount} sessions`)

  // NO initial students - teachers will add them via dashboard
  console.log(`✅ No initial students - teachers will add via dashboard`)

  // NO finance data - starts at zero, admin will input via dashboard
  console.log(`✅ Finance data starts at Rp 0 - admin will input via dashboard`)

  console.log('🎉 Seed completed!')
  console.log('\n📋 Login Credentials:')
  console.log('Super Admin: charlien@starlish.com / starlish@218')
  console.log('Teachers: nadia@starlish.com, fadiya@starlish.com, laura@starlish.com, etc.')
  console.log('Password Teacher: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
