import { serve } from "@hono/node-server";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { abrirBanco } from "./banco/abrir.js";
import { criarApp } from "./http/app.js";

const caminho = resolve(process.env.AUTODAILY_BANCO ?? "dados/autodaily.sqlite");
mkdirSync(dirname(caminho), { recursive: true });
const banco = abrirBanco(caminho);
const app = criarApp(banco);
const porta = Number(process.env.PORT ?? 3001);
serve({ fetch: app.fetch, port: porta }, () => {
  console.log(`AutoDaily em http://localhost:${porta}`);
});
