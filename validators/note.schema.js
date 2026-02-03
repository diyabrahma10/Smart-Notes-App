export const tagArraySchema = z
  .array(
    z.string().min(1)
  )
  .optional()
  .transform(tags => {
    if (!tags) return [];

    return [
      ...new Set(
        tags
          .map(t => t.trim().toLowerCase())
          .filter(Boolean)
      ),
    ];
  });

export const createNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required"),

  contentHTML: z.string(),
  contentText: z.string(),

  tags: tagArraySchema,
});
