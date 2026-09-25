import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usuario = sqliteTable("usuario", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  senhaHash: text("senha_hash").notNull(),
  papel: text("papel").notNull(),
  ativo: integer("ativo").notNull().default(1),
  caneta: text("caneta").notNull().default("azul"),
  criadoEm: text("criado_em").notNull(),
  atualizadoEm: text("atualizado_em").notNull(),
});

export const sessao = sqliteTable("sessao", {
  id: text("id").primaryKey(),
  usuarioId: text("usuario_id")
    .notNull()
    .references(() => usuario.id),
  expiraEm: text("expira_em").notNull(),
});

export const tarefa = sqliteTable("tarefa", {
  id: text("id").primaryKey(),
  autorId: text("autor_id")
    .notNull()
    .references(() => usuario.id),
  descricao: text("descricao").notNull(),
  idTrello: text("id_trello"),
  naParede: integer("na_parede").notNull().default(0),
  saiuDaParedeEm: text("saiu_da_parede_em"),
  denominadorCongelado: integer("denominador_congelado"),
  criadoEm: text("criado_em").notNull(),
  atualizadoEm: text("atualizado_em").notNull(),
});

export const categoria = sqliteTable("categoria", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull().unique(),
  criadoEm: text("criado_em").notNull(),
  atualizadoEm: text("atualizado_em").notNull(),
});

export const tarefaCategoria = sqliteTable(
  "tarefa_categoria",
  {
    tarefaId: text("tarefa_id")
      .notNull()
      .references(() => tarefa.id),
    categoriaId: text("categoria_id")
      .notNull()
      .references(() => categoria.id),
  },
  (tabela) => [primaryKey({ columns: [tabela.tarefaId, tabela.categoriaId] })],
);

export const ciencia = sqliteTable("ciencia", {
  id: text("id").primaryKey(),
  tarefaId: text("tarefa_id")
    .notNull()
    .references(() => tarefa.id),
  usuarioId: text("usuario_id")
    .notNull()
    .references(() => usuario.id),
  criadoEm: text("criado_em").notNull(),
});

export const SQL_ESQUEMA = `
CREATE TABLE IF NOT EXISTS usuario (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  papel TEXT NOT NULL,
  ativo INTEGER NOT NULL DEFAULT 1,
  caneta TEXT NOT NULL DEFAULT 'azul',
  criado_em TEXT NOT NULL,
  atualizado_em TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessao (
  id TEXT PRIMARY KEY,
  usuario_id TEXT NOT NULL REFERENCES usuario(id),
  expira_em TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS tarefa (
  id TEXT PRIMARY KEY,
  autor_id TEXT NOT NULL REFERENCES usuario(id),
  descricao TEXT NOT NULL,
  id_trello TEXT,
  na_parede INTEGER NOT NULL DEFAULT 0,
  saiu_da_parede_em TEXT,
  denominador_congelado INTEGER,
  criado_em TEXT NOT NULL,
  atualizado_em TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS categoria (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  criado_em TEXT NOT NULL,
  atualizado_em TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS tarefa_categoria (
  tarefa_id TEXT NOT NULL REFERENCES tarefa(id),
  categoria_id TEXT NOT NULL REFERENCES categoria(id),
  PRIMARY KEY (tarefa_id, categoria_id)
);
CREATE TABLE IF NOT EXISTS ciencia (
  id TEXT PRIMARY KEY,
  tarefa_id TEXT NOT NULL REFERENCES tarefa(id),
  usuario_id TEXT NOT NULL REFERENCES usuario(id),
  criado_em TEXT NOT NULL
);
`;
