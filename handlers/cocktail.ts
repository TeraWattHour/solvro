import type { Context } from "hono";
import type { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";

import type { Env, FullCocktail } from "../types.ts";

type RawCocktail = {
  id: number;
  name: string;
  is_alcoholic: number;
  recipe: string;
  category: string;
  ingredients: string;
};

export function cocktailById(db: DB, id: number): FullCocktail | null {
  const entries = db.queryEntries<RawCocktail>(
    `select
c.id, c.name, c.recipe, max(is_alcoholic) as is_alcoholic,
json_object('id', ct.id, 'name', ct.name, 'description', ct.description) as category,
json_group_array(json_object('id', i.id, 'name', i.name, 'description', i.description, 'is_alcoholic', i.is_alcoholic, 'thumbnail_url', i.thumbnail_url, 'quantity', ci.amount, 'unit', ci.unit)) as ingredients
from cocktails c 
left join categories ct on ct.id = c.category_id
left join cocktail_ingredients ci on ci.cocktail_id = c.id
left join ingredients i on i.id = ci.ingredient_id
where c.id = ?
group by c.id
having i.id is not null`,
    [id]
  );
  if (entries.length === 0) return null;
  const cocktail = entries[0];
  return {
    id: cocktail.id,
    name: cocktail.name,
    is_alcoholic: Boolean(cocktail.is_alcoholic),
    recipe: JSON.parse(cocktail.recipe),
    ingredients: JSON.parse(cocktail.ingredients).map((i: FullCocktail["ingredients"][number]) => ({
      ...i,
      is_alcoholic: Boolean(i.is_alcoholic),
      quantity: parseFloat(i.quantity as string),
    })),
    category: JSON.parse(cocktail.category),
  };
}

export function cocktail(c: Context<Env>) {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) return c.json({ error: "param `id` must be an integer" }, 400);

  const cocktail = cocktailById(c.var.db, id);
  if (!cocktail) return c.notFound();

  return c.json({ data: cocktail });
}
