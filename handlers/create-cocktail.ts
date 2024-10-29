import type { Context } from "hono";
import type { Env } from "../types.ts";
import { z } from "https://deno.land/x/zod@v3.4.0/mod.ts";

const createCocktailSchema = z.object({
  name: z.string(),
  category_id: z.number().int().min(1),
  recipe: z.array(z.string()).min(1),
});

export async function createCocktail(c: Context<Env>) {
  let cocktail;

  try {
    cocktail = createCocktailSchema.parse(await c.req.json());
  } catch (e: unknown) {
    return c.json({ error: (e as Error).message }, 400);
  }

  const { name, category_id, recipe } = cocktail;

  const [inserted] = c.var.db.queryEntries(
    "INSERT INTO cocktails (name, recipe, category_id) VALUES (?, ?, ?) RETURNING id",
    [name, JSON.stringify(recipe), category_id]
  );

  return c.json({ data: inserted.id });
}
