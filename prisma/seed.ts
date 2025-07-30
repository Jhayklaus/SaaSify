import { PrismaClient } from '@prisma/client'
import data from '../db.json'

const prisma = new PrismaClient()

async function main() {
  for (const user of data.users) {
    await prisma.user.create({
      data: {
        id: parseInt(user.id, 10),
        name: user.name,
        email: user.email,
        role: user.role,
        password: user.password,
      },
    })
  }

  for (const task of data.tasks) {
    await prisma.task.create({
      data: {
        id: task.id,
        title: task.title,
        assignedTo: task.assignedTo,
        status: task.status,
      },
    })
  }

  for (const note of data.notifications) {
    await prisma.notification.create({
      data: {
        id: parseInt(note.id, 10),
        userId: note.userId,
        message: note.message,
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
