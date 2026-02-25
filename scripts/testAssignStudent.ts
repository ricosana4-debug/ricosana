import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main(){
  // Find a class (Kelas 1)
  const cls = await prisma.class.findFirst({ where: { name: 'Kelas 1' } })
  if(!cls){
    console.error('Kelas 1 not found')
    process.exit(1)
  }

  const admin = await prisma.admin.findFirst({ where: { assignedClass: cls.name } })

  const studentId = `TST${Date.now().toString().slice(-5)}`
  const name = `Test Student ${Date.now().toString().slice(-4)}`

  const student = await prisma.student.create({
    data: {
      studentId,
      name,
      classId: cls.id,
      sessionId: null,
      status: 'active',
      adminId: admin?.id || null,
    },
    include: {
      advisor: true,
      class: true,
    }
  })

  console.log('Created student:')
  console.log({ id: student.id, studentId: student.studentId, name: student.name, class: student.class.name, advisor: student.advisor?.name || null })
}

main()
  .catch(e=>{ console.error(e); process.exit(1) })
  .finally(async ()=>{ await prisma.$disconnect() })
