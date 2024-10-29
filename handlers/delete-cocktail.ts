import type { Context } from "hono";
import type { Env } from "../types.ts";

export function deleteCocktail(c: Context<Env>) {
  const id = c.req.param("id");
  c.var.db.query("DELETE FROM cocktails WHERE id = ?", [id]);
  return c.newResponse(null, 204);
}
