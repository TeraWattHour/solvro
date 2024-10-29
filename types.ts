import { DB } from "https://deno.land/x/sqlite/mod.ts";

export type Env = {
  Variables: {
    db: DB;
  };
};

export type FullCocktail = {
  id: number;
  name: string;
  recipe: string[];
  is_alcoholic: boolean;
  category: {
    id: number;
    name: string;
    description: string;
  };
  ingredients: {
    id: number;
    name: string;
    description: string;
    is_alcoholic: boolean | string;
    thumbnail_url: string;
    quantity: number | string;
    unit: string;
  }[];
};
