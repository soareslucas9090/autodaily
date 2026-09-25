import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { Banco } from "../banco/abrir.js";
import { sessao, usuario } from "../banco/esquema.js";
import { ErroDeRegra } from "../dominio/erros.js";
import { Produto, type Caneta, type Papel } from "../dominio/produto.js";
import { atalhoParaPeriodo } from "../dominio/tempo.js";

const COOKIE = "sessao";

type Variaveis = { usuarioId: string; produto: Produto };

export function criarApp(banco: Banco, relogio: () => Date = () => new Date()) {
  const produto = new Produto(banco, relogio);
  const app = new Hono<{ Variables: Variaveis }>();
  app.use("/api/*", cors({ origin: "http://localhost:5173", credentials: true }));

  app.use("/api/*", async (c, next) => {
    c.set("produto", produto);
    const id = getCookie(c, COOKIE);
    if (id) {
      const linha = banco.select().from(sessao).where(eq(sessao.id, id)).get();
      if (linha && linha.expiraEm > new Date().toISOString()) {
        const pessoa = banco.select().from(usuario).where(eq(usuario.id, linha.usuarioId)).get();
        if (pessoa && pessoa.ativo === 1) c.set("usuarioId", pessoa.id);
      }
    }
    const publica = c.req.path === "/api/sessao" && c.req.method === "POST";
    if (!publica && !c.get("usuarioId")) return c.json({ erro: "nao-autenticado" }, 401);
    await next();
  });

  app.onError((erro, c) => {
    if (erro instanceof ErroDeRegra) {
      const status = erro.codigo === "nao-autorizado" ? 403 : erro.codigo === "nao-encontrado" ? 404 : 400;
      return c.json({ erro: erro.codigo, mensagem: erro.message }, status);
    }
    console.error(erro);
    return c.json({ erro: "interno" }, 500);
  });

  app.post("/api/sessao", async (c) => {
    const corpo = await c.req.json<{ username: string; senha: string }>();
    const pessoa = produto.entrar(corpo.username, corpo.senha);
    const id = randomUUID();
    const expira = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();
    banco.insert(sessao).values({ id, usuarioId: pessoa.id, expiraEm: expira }).run();
    setCookie(c, COOKIE, id, { httpOnly: true, sameSite: "Lax", path: "/" });
    return c.json(produto.usuarioPublico(pessoa.id));
  });

  app.delete("/api/sessao", (c) => {
    const id = getCookie(c, COOKIE);
    if (id) banco.delete(sessao).where(eq(sessao.id, id)).run();
    deleteCookie(c, COOKIE, { path: "/" });
    return c.json({ ok: true });
  });

  app.get("/api/sessao", (c) => c.json(produto.usuarioPublico(c.get("usuarioId"))));

  app.patch("/api/eu/caneta", async (c) => {
    const corpo = await c.req.json<{ caneta: Caneta }>();
    produto.definirCaneta(c.get("usuarioId"), corpo.caneta);
    return c.json(produto.usuarioPublico(c.get("usuarioId")));
  });

  app.get("/api/cores", (c) => c.json(produto.listarCores()));

  app.post("/api/cores", async (c) => {
    const corpo = await c.req.json<{ nome: string; hex: string }>();
    return c.json(produto.criarCor(c.get("usuarioId"), corpo), 201);
  });

  app.delete("/api/cores/:id", (c) => {
    produto.excluirCor(c.get("usuarioId"), c.req.param("id"));
    return c.json(produto.listarCores());
  });

  app.patch("/api/eu/cor", async (c) => {
    const corpo = await c.req.json<{ corId: string }>();
    return c.json(produto.escolherCor(c.get("usuarioId"), corpo.corId));
  });

  app.get("/api/mural", (c) => c.json(produto.mural(c.get("usuarioId"))));

  app.post("/api/mural/publicar", async (c) => {
    const corpo = await c.req.json<{ descricao: string; idTrello?: string | null; categoriaIds?: string[] }>();
    produto.publicar(c.get("usuarioId"), corpo);
    return c.json(produto.mural(c.get("usuarioId")));
  });

  app.patch("/api/tarefa-atual", async (c) => {
    const corpo = await c.req.json<{ descricao?: string; idTrello?: string | null; categoriaIds?: string[] }>();
    produto.editarTarefaAtual(c.get("usuarioId"), corpo);
    return c.json(produto.mural(c.get("usuarioId")));
  });

  app.delete("/api/tarefas/:id", (c) => {
    produto.excluirTarefa(c.get("usuarioId"), c.req.param("id"));
    return c.json(produto.mural(c.get("usuarioId")));
  });

  app.post("/api/retornar-anterior", (c) => {
    produto.retornarAnterior(c.get("usuarioId"));
    return c.json(produto.mural(c.get("usuarioId")));
  });

  app.post("/api/tarefas/:id/ciencia", (c) => {
    produto.marcarCiencia(c.get("usuarioId"), c.req.param("id"));
    return c.json(produto.mural(c.get("usuarioId")));
  });

  app.delete("/api/tarefas/:id/ciencia", (c) => {
    produto.desmarcarCiencia(c.get("usuarioId"), c.req.param("id"));
    return c.json(produto.mural(c.get("usuarioId")));
  });

  app.get("/api/periodos/:atalho", (c) => {
    const periodo = atalhoParaPeriodo(c.req.param("atalho"), relogio());
    if (!periodo) return c.json({ erro: "atalho-invalido" }, 400);
    return c.json(periodo);
  });

  app.get("/api/historico", (c) => {
    return c.json(
      produto.historico({
        idTrello: c.req.query("idTrello"),
        programadorId: c.req.query("programadorId"),
        inicio: c.req.query("inicio") ?? "",
        fim: c.req.query("fim") ?? "",
        ordem: c.req.query("ordem") === "asc" ? "asc" : "desc",
        limite: Number(c.req.query("limite") ?? 20),
        pagina: Number(c.req.query("pagina") ?? 1),
      }),
    );
  });

  app.get("/api/programadores", (c) => c.json(produto.listarProgramadores()));

  app.get("/api/relatorios", (c) => {
    const modo = c.req.query("modo") === "completo" ? "completo" : "simples";
    return c.json(produto.relatorio(c.req.query("inicio") ?? "", c.req.query("fim") ?? "", modo));
  });

  app.get("/api/categorias", (c) => c.json(produto.listarCategorias()));

  app.post("/api/categorias", async (c) => {
    const corpo = await c.req.json<{ nome: string }>();
    return c.json(produto.criarCategoria(c.get("usuarioId"), corpo.nome), 201);
  });

  app.delete("/api/categorias/:id", (c) => {
    produto.excluirCategoria(c.get("usuarioId"), c.req.param("id"));
    return c.json(produto.listarCategorias());
  });

  app.get("/api/membros", (c) => {
    return c.json(
      produto.listarMembros(c.get("usuarioId")).map((m) => ({
        id: m.id,
        username: m.username,
        papel: m.papel as Papel,
        ativo: m.ativo === 1,
      })),
    );
  });

  app.post("/api/membros", async (c) => {
    const corpo = await c.req.json<{ username: string; senha: string; papel: Papel }>();
    const criado = produto.criarMembro(c.get("usuarioId"), corpo);
    return c.json({ id: criado.id, username: criado.username, papel: criado.papel, ativo: true }, 201);
  });

  app.patch("/api/membros/:id", async (c) => {
    const corpo = await c.req.json<{ username?: string; senha?: string; ativo?: boolean; papel?: Papel }>();
    const editado = produto.editarMembro(c.get("usuarioId"), c.req.param("id"), corpo);
    return c.json({
      id: editado.id,
      username: editado.username,
      papel: editado.papel,
      ativo: editado.ativo === 1,
    });
  });

  return app;
}
