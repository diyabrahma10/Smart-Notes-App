import prisma from "../config/prisma.js";

export const seedDummyData = async () => {
  // 1️⃣ Create user
  const user = await prisma.user.findFirst({
    where:{
        username:"diyu"
    }

  });

  // 2️⃣ Create tags
  const tags = await prisma.tag.createMany({
    data: [
      { name: "work", userId: user.id },
      { name: "personal", userId: user.id },
      { name: "ideas", userId: user.id },
    ],
  });

  // Fetch tags (createMany doesn’t return records)
  const allTags = await prisma.tag.findMany({
    where: { userId: user.id },
  });

  const tagMap = {};
  allTags.forEach(tag => {
    tagMap[tag.name] = tag.id;
  });

  // 3️⃣ Create notes
  const note1 = await prisma.note.create({
    data: {
      userId: user.id,
      title: "Work Meeting Notes",
      contentHTML: "<p>Discuss project timeline and milestones.</p>",
      contentText: "Discuss project timeline and milestones.",
    },
  });

  const note2 = await prisma.note.create({
    data: {
      userId: user.id,
      title: "Personal Goals",
      contentHTML: "<p>Start running, read more books.</p>",
      contentText: "Start running, read more books.",
    },
  });

  const note3 = await prisma.note.create({
    data: {
      userId: user.id,
      title: "Startup Ideas",
      contentHTML: "<p>AI-powered note summarizer.</p>",
      contentText: "AI-powered note summarizer.",
    },
  });

  // 4️⃣ Attach tags to notes
  await prisma.noteTag.createMany({
    data: [
      { noteId: note1.id, tagId: tagMap.work },
      { noteId: note2.id, tagId: tagMap.personal },
      { noteId: note3.id, tagId: tagMap.ideas },
      { noteId: note3.id, tagId: tagMap.work },
    ],
  });

  console.log("✅ Dummy data inserted successfully");
};

// Run directly if executed as script
if (process.argv[1].includes("seed.js")) {
  seedDummyData()
    .catch(err => {
      console.error(err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
