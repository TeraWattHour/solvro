import type { Context, Next } from "hono";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import type { Env } from "../types.ts";

export function injectDB(db: DB) {
  return async (c: Context<Env>, next: Next) => {
    c.set("db", db);
    await next();
  };
}
