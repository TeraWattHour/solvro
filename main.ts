import { Hono, type Context } from "hono";
import { serveStatic } from "hono/deno";
import { swaggerUI } from "npm:@hono/swagger-ui";

import { DB } from "https://deno.land/x/sqlite/mod.ts";

import { parseFlags } from "./flags.ts";
import type { Env } from "./types.ts";
import { injectDB } from "./middleware/inject-db.ts";

import { cocktail } from "./handlers/cocktail.ts";
import { cocktails } from "./handlers/cocktails.ts";
import { deleteCocktail } from "./handlers/delete-cocktail.ts";
import { deleteIngredient } from "./handlers/delete-ingredient.ts";
import { createCocktail } from "./handlers/create-cocktail.ts";
import { editCocktail } from "./handlers/edit-cocktail.ts";
import { attachIngredient, detachIngredient } from "./handlers/attach-ingredient.ts";
import { createIngredient } from "./handlers/create-ingredient.ts";
import { editIngredient } from "./handlers/edit-ingredient.ts";

const flags = parseFlags();
const db = new DB(flags.database);

const app = new Hono<Env>();
app.use(injectDB(db));

app.use("/doc", serveStatic({ path: "./assets/doc.yaml" }));
app.get("/ui", swaggerUI({ url: "/doc" }));

app.get("/cocktails", cocktails);
app.post("/cocktails", createCocktail);
app.put("/cocktails/:id", editCocktail);
app.get("/cocktails/:id", cocktail);
app.delete("/cocktails/:id", deleteCocktail);

app.put("/ingredients/attach/:cocktail_id/:ingredient_id/:amount/:unit", attachIngredient);
app.delete("/ingredients/detach/:cocktail_id/:ingredient_id", detachIngredient);

app.post("/ingredients", createIngredient);
app.put("/ingredients/:id", editIngredient);
app.delete("/ingredients/:id", deleteIngredient);

Deno.serve({ port: flags.port }, app.fetch);
