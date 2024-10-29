import type { Context } from "hono";
import type { Env } from "../types.ts";
import { z } from "npm:zod";

const editIngredientSchema = z
  .object({
    name: z.string(),
    description: z.string(),
    is_alcoholic: z.boolean(),
    image: z.string(),
  })
  .partial();

export async function editIngredient(c: Context<Env>) {
  let ingredient;

  try {
    ingredient = editIngredientSchema.parse(await c.req.json());
  } catch (e: unknown) {
    return c.json({ error: (e as Error).message }, 400);
  }

  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) return c.json({ error: "param `id` must be an integer" }, 400);

  const { name, description, is_alcoholic, image } = ingredient;
  const current = c.var.db.queryEntries<{
    id: number;
    name: string;
    description: string;
    is_alcoholic: boolean;
    thumbnail_url: string;
  }>("SELECT * FROM ingredients WHERE id = ?", [id]);
  if (current.length === 0) return c.notFound();

  const existing = current[0];

  c.var.db.queryEntries(
    "UPDATE ingredients SET name = ?, description = ?, is_alcoholic = ?, thumbnail_url = ? WHERE id = ? RETURNING id",
    [
      name || existing.name,
      description || existing.description,
      is_alcoholic || existing.is_alcoholic,
      image || existing.thumbnail_url,
      id,
    ]
  );

  return c.newResponse(null, 200);
}
