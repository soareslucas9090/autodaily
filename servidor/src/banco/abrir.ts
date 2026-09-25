import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as esquema from "./esquema.js";
import { SQL_ESQUEMA } from "./esquema.js";

export type Banco = BetterSQLite3Database<typeof esquema>;

export function abrirBanco(caminho: string): Banco {
  const nativo = new Database(caminho);
  nativo.pragma("foreign_keys = ON");
  nativo.exec(SQL_ESQUEMA);
  return drizzle(nativo, { schema: esquema });
}
