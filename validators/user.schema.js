import { z } from "zod";

export const loginUserSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
})

export const registerUserSchema = loginUserSchema.extend({
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .max(20, "Username is too long"),

  
});
