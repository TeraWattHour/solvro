create table if not exists categories (
  id integer primary key autoincrement,
  name text not null,
  description text
);

create table if not exists cocktails (
  id integer primary key autoincrement,
  name text not null,
  recipe json not null default '[]',
  category_id integer not null references categories(id) on delete cascade on update cascade,
  assets json not null default '{}'
);

create table if not exists ingredients (
  id integer primary key autoincrement,
  name text not null,
  description text,
  thumbnail_url text,
  is_alcoholic boolean not null default true
);

create table if not exists cocktail_ingredients (
  id integer primary key autoincrement,
  cocktail_id integer not null references cocktails(id) on delete cascade on update cascade,
  ingredient_id integer not null references ingredients(id) on delete cascade on update cascade,
  amount text not null,
  unit text not null,

  unique(cocktail_id, ingredient_id)
);