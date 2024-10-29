import { parseArgs } from "jsr:@std/cli/parse-args";

export function parseFlags() {
  const flags = parseArgs(Deno.args, {
    string: ["database", "port"],
  });

  if (!flags.database) {
    throw new Error("Missing required flag --database");
  }

  const port = parseInt(flags.port || "8080");
  if (isNaN(port)) throw new Error("Invalid port number");

  return {
    database: flags.database,
    port,
  };
}
