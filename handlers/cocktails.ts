import type { Context } from "hono";
import { z, ZodError } from "npm:zod";

import type { Env } from "../types.ts";

const getCocktailSchema = z.object({
  name: z.string().optional(),

  is_alcoholic: z
    .string()
    .transform((s) => Boolean(parseInt(s)))
    .optional(),
  category_id: z.number().int().min(1).optional(),

  has_ingredients: z.array(z.number().int().min(1)).optional(),
  no_ingredients: z.array(z.number().int().min(1)).optional(),

  limit: z.number({ coerce: true }).int().min(1).max(25).default(10),
  page: z.number({ coerce: true }).int().min(1).default(1),
});

export function cocktails(c: Context<Env>) {
  const q = c.req.query();
  let filters;

  try {
    filters = getCocktailSchema.parse({
      ...q,
      has_ingredients: q.has_ingredients?.split(",").map(Number),
      no_ingredients: q.no_ingredients?.split(",").map(Number),
    });
  } catch (e) {
    return c.json({ error: (e as ZodError).errors }, 400);
  }

  const predicates = ["1=1"];
  const values = [];
  if (filters.name) {
    predicates.push(`c.name like '%' || ? || '%'`);
    values.push(filters.name);
  }

  if (filters.has_ingredients && filters.has_ingredients.length > 0) {
    predicates.push(`i.id IN (${filters.has_ingredients.join(", ")})`);
  }

  if (filters.no_ingredients && filters.no_ingredients.length > 0) {
    predicates.push(`i.id NOT IN (${filters.no_ingredients.join(", ")})`);
  }

  const query = `select c.*, max(is_alcoholic) as is_alcoholic from cocktails c
  left join cocktail_ingredients ci on ci.cocktail_id = c.id
  left join ingredients i on i.id = ci.ingredient_id
  where ${predicates.join(" AND ")}
  group by c.id
  having (? is null or max(is_alcoholic) = ?) 
  LIMIT ? 
  OFFSET ?`;

  return c.json({
    data: c.var.db
      .queryEntries<{ id: number; name: string; recipe: string; category_id: number }>(query, [
        ...values,
        filters.is_alcoholic,
        filters.is_alcoholic,
        filters.limit,
        (filters.page - 1) * filters.limit,
      ])
      .map((row) => ({ ...row, recipe: JSON.parse(row.recipe) })),
    page: filters.page,
  });
}
