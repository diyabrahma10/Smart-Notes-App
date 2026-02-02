import prisma from "../config/prisma.js";

export const listNotesByUserId = async({user_id, page, limit, search})=> {

    const whereClause = {
        userId:user_id,  
        isArchived : false,
        ...(search && {OR:[
            {
                title: {contains: search},
            },
            {
                contentText: {contains: search}
            }
        ]})
    };

    const isPaginated = (typeof page=="number" && typeof limit=="number");

    if(!isPaginated){

        const notes = await prisma.note.findMany({
            where: whereClause,
            orderBy: {updatedAt:"desc"},
            include:{
                tags:{
                    include: {tag:true}
                }
            }
        });

        return {notes, pagination:null};
    }

    const skip = (page - 1) * limit;

  const [notes, totalNotes] = await Promise.all([ //run all the inside queries arallely
    prisma.note.findMany({
      where:whereClause,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    }),
    prisma.note.count({ where:whereClause }),
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

