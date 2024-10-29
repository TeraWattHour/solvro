import type { Context } from "hono";
import type { Env } from "../types.ts";
import { z } from "npm:zod";

const editCocktailSchema = z.object({
  name: z.string().optional(),
  category_id: z.number().int().min(1).optional(),
  recipe: z.array(z.string()).min(1).optional(),
});

export async function editCocktail(c: Context<Env>) {
  let cocktail;

  try {
    cocktail = editCocktailSchema.parse(await c.req.json());
  } catch (e: unknown) {
    return c.json({ error: (e as Error).message }, 400);
  }

  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) return c.json({ error: "param `id` must be an integer" }, 400);

  const { name, category_id, recipe } = cocktail;
  const current = c.var.db.queryEntries<{
    id: number;
    name: string;
    recipe: string;
    category_id: number;
  }>("SELECT * FROM cocktails WHERE id = ?", [id]);
  if (current.length === 0) return c.notFound();

  const existing = current[0];

  c.var.db.queryEntries(
    "UPDATE cocktails SET name = ?, recipe = ?, category_id = ? WHERE id = ? RETURNING id",
    [
      name || existing.name,
      JSON.stringify(recipe) || existing.recipe,
      category_id || existing.category_id,
      id,
    ]
  );

  return c.newResponse(null, 200);
}
