import { z } from "zod";

export const username = z
  .string()
  .min(3)
  .max(31)
  .regex(/^[a-z0-9_-]+$/);

export const password = z
  .string()
  .min(6)
  .max(255)
  .regex(/^[ -~]+$/); // printable ASCII
