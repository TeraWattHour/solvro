import type { Context } from "hono";
import { SqliteError } from "https://deno.land/x/sqlite/mod.ts";
import type { Env } from "../types.ts";

export function attachIngredient(c: Context<Env>) {
  const { cocktail_id, ingredient_id, amount, unit } = c.req.param();

  try {
    c.var.db.query(
      `INSERT INTO cocktail_ingredients (cocktail_id, ingredient_id, amount, unit) VALUES (?, ?, ?, ?) 
      on conflict(cocktail_id, ingredient_id) 
      do update set amount = excluded.amount, unit = excluded.unit`,
      [cocktail_id, ingredient_id, amount, unit]
    );
  } catch (e) {
    if ((e as SqliteError).code === 19) {
      return c.json({ error: "No such cocktail/ingredient" }, 400);
    }
    throw e;
  }

  return c.newResponse(null, 201);
}

export function detachIngredient(c: Context<Env>) {
  const { cocktail_id, ingredient_id } = c.req.param();

  c.var.db.query("DELETE FROM cocktail_ingredients WHERE cocktail_id = ? AND ingredient_id = ?", [
    cocktail_id,
    ingredient_id,
  ]);

  return c.newResponse(null, 204);
}
