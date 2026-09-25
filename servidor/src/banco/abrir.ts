import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as esquema from "./esquema.js";
import { SQL_ESQUEMA } from "./esquema.js";

export type Banco = BetterSQLite3Database<typeof esquema>;

export function abrirBanco(caminho: string): Banco {
  const nativo = new Database(caminho);
  nativo.pragma("foreign_keys = ON");
  nativo.exec(SQL_ESQUEMA);
  const colunas = nativo.prepare("PRAGMA table_info(usuario)").all() as { name: string }[];
  if (!colunas.some((coluna) => coluna.name === "cor_id")) {
    nativo.exec("ALTER TABLE usuario ADD COLUMN cor_id TEXT");
  }
  return drizzle(nativo, { schema: esquema });
}
