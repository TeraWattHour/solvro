export function parseQuery(query: Record<string, string>, fields: string[]) {
  const filters = Object.entries(query).reduce((acc, [key, value]) => {
    if (key.startsWith("_")) {
      const field = key.slice("_".length);
      acc[field] = value;
    }
    return acc;
  }, {} as Record<string, string>);

  if (Object.keys(filters).some((key) => !fields.includes(key))) {
    const invalidFields = Object.keys(filters).filter((key) => !fields.includes(key));
    throw new Error(`Invalid filter field(s): ${invalidFields.join(", ")}`);
  }

  const limit = parseInt(query.limit || "10", 10);
  const page = parseInt(query.page || "1", 10);

  return { filters, limit, page };
}

// WARN: Use only with validated column names – injection risk!
export function filterToCondition(filters: Record<string, string>) {
  return [
    "((" +
      Object.keys(filters)
        .reduce((acc, key) => {
          acc.push(`"${key}" = ?`);
          return acc;
        }, [] as string[])
        .join(" AND ") +
      ") OR 1 = 1)",
    Object.values(filters),
  ];
}
