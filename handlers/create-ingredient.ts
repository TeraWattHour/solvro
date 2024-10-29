import type { Context } from "hono";
import type { Env } from "../types.ts";
import { z } from "https://deno.land/x/zod@v3.4.0/mod.ts";

const createIngredientSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  is_alcoholic: z.boolean(),
  image: z.string().optional(),
});

export async function createIngredient(c: Context<Env>) {
  const ingredient = createIngredientSchema.parse(await c.req.json());

  const inserted = c.var.db.queryEntries<{
    name: string;
    description: string;
    is_alcoholic: boolean;
    thumbnail_url: string;
  }>(
    "INSERT INTO ingredients (name, description, is_alcoholic, thumbnail_url) VALUES (?, ?, ?, ?) RETURNING *",
    [ingredient.name, ingredient.description, ingredient.is_alcoholic, ingredient.image]
  );

  return c.json({ data: inserted[0] }, 201);
}
