import prisma from "../config/prisma.js";

//listNotesByUserId returns {notes, pagination:{..}} the notes of the given user and also return the pagination info and also if search queyr sis used then returns the searched result
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

  const [notes, totalNotes] = await Promise.all([ //run all the inside queries parallely
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

//createNote returns the note newly created and you have to pass the tags that you want to attach to the note 
export const createNote = (user_id, contentText, contentHTML, title, tags=[]) => {
    return prisma.$transaction(async(tx) => {

      const note = tx.note.create({
        data:{
          userId:user_id,
          contentHTML,
          contentText,
          title
        }
      });

      if(tags.length==0){
        return note; //there are no tags hence return early
      }

      //find already existing tags out of the given one
      const existingTags = await tx.tag.findMany({
        where:{
          userId:user_id,
          name: {in : tags}
        }
      });

      const existingTagNames = new Set(existingTags.map((t) => {t.name}));

      //filter out those tag names from the tags array that do not exists for that user
      tags.filter((tag)=> {
        !existingTagNames.has(tag);
      });

      //parallely creating all the new tags that is not there in the tag table
      const newTags = await Promise.all(
        tags.map((tag)=>{
          tx.tag.create({
            data:{
              userId:user_id,
              name: tag

            }
          });
        })
      );

      //create an array of all the tag objects
      const allTags = [...existingTags, ...newTags];

      //attach the newly created note with the tag 
      
      await tx.noteTag.createMany({
        data : allTags.map((tagObj) => ({
          noteId: note.id,
          tagId: tagObj.id
        }))

      });

      return note;
    });
    //transaction is over and the result of the transaction is a note object that is returned to the controller 
};

