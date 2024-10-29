import type { Context } from "hono";
import type { Env } from "../types.ts";

export function deleteIngredient(c: Context<Env>) {
  const id = c.req.param("id");
  c.var.db.query("DELETE FROM ingredients WHERE id = ?", [id]);
  return c.newResponse(null, 204);
}
