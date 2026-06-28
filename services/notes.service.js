import prisma from "../config/prisma.js";

//listNotesByUserId returns {notes, pagination:{..}} the notes of the given user and also return the pagination info and also if search queyr sis used then returns the searched result
export const listNotesByUserId = async ({ user_id, page, limit, search }) => {
  const whereClause = {
    userId: user_id,
    isArchived: false,
    ...(search && {
      OR: [
        {
          title: { contains: search },
        },
        {
          contentText: { contains: search },
        },
      ],
    }),
  };

  const isPaginated = typeof page == "number" && typeof limit == "number";

  if (!isPaginated) {
    const notes = await prisma.note.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    return { notes, pagination: null };
  }

  const skip = (page - 1) * limit;

  const [notes, totalNotes] = await Promise.all([
    //run all the inside queries parallely
    prisma.note.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    }),
    prisma.note.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalNotes / limit);

  return {
    notes,
    pagination: {
      page,
      limit,
      totalNotes,
      totalPages,
    },
  };
};

//createNote returns the note newly created and you have to pass the tags that you want to attach to the note
export const createNote = async ({
  user_id,
  contentText,
  contentHTML,
  title,
  tags = [],
}) => {
  return prisma.$transaction(async (tx) => {
    const note = await tx.note.create({
      data: {
        userId: user_id,
        contentHTML,
        contentText,
        title,
      },
    });

    const normalizedTags = tags
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    if (normalizedTags.length === 0) {
      return note; // there are no tags hence return early
    }

    const existingTags = await tx.tag.findMany({
      where: {
        userId: user_id,
        name: { in: normalizedTags },
      },
    });

    const existingTagNames = new Set(existingTags.map((t) => t.name));
    const newTagsToCreate = normalizedTags.filter(
      (tag) => !existingTagNames.has(tag),
    );

    const newTags = await Promise.all(
      newTagsToCreate.map((tag) =>
        tx.tag.create({
          data: {
            userId: user_id,
            name: tag,
          },
        }),
      ),
    );

    const allTags = [...existingTags, ...newTags];

    if (allTags.length > 0) {
      await tx.noteTag.createMany({
        data: allTags.map((tagObj) => ({
          noteId: note.id,
          tagId: tagObj.id,
        })),
      });
    }

    return note;
  });
};

export const listTagNames = async (user_id) => {
  return await prisma.tag.findMany({
    where: {
      userId: user_id,
    },
  });
};

// export const listAllNotes = async(user_id) => {
//   return await prisma.note.findMany({
//     where:{userId:user_id}
//   });
// }
