import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { abrirBanco } from "../src/banco/abrir.js";
import { Produto } from "../src/dominio/produto.js";
import { criarApp } from "../src/http/app.js";

function preparar() {
  const dir = mkdtempSync(join(tmpdir(), "autodaily-sse-"));
  const banco = abrirBanco(join(dir, "teste.sqlite"));
  const produto = new Produto(banco);
  produto.criarPrimeiroAdmin("admin", "segredo");
  const admin = produto.entrar("admin", "segredo");
  produto.criarMembro(admin.id, { username: "ana", senha: "123456", papel: "programador" });
  produto.criarMembro(admin.id, { username: "bruno", senha: "123456", papel: "programador" });
  const app = criarApp(banco);
  return { app };
}

async function login(app: ReturnType<typeof criarApp>, username: string, senha: string) {
  const resposta = await app.request("/api/sessao", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, senha }),
  });
  expect(resposta.status).toBe(200);
  const cookie = resposta.headers.get("set-cookie");
  expect(cookie).toBeTruthy();
  return cookie!;
}

async function lerCorpoAte(
  leitor: ReadableStreamDefaultReader<Uint8Array>,
  procurar: string,
  tempoMs = 3000,
): Promise<string> {
  const decoder = new TextDecoder();
  let acumulado = "";
  const limite = Date.now() + tempoMs;
  try {
    while (Date.now() < limite) {
      const { done, value } = await leitor.read();
      if (done) break;
      acumulado += decoder.decode(value, { stream: true });
      if (acumulado.includes(procurar)) return acumulado;
    }
    throw new Error(`não encontrou ${procurar} em ${tempoMs}ms`);
  } finally {
    await leitor.cancel().catch(() => {});
  }
}

describe("tempo real (SSE)", () => {
  it("conectado recebe pronto em text/event-stream", async () => {
    const { app } = preparar();
    const cookie = await login(app, "bruno", "123456");
    const resposta = await app.request("/api/eventos", { headers: { Cookie: cookie } });
    expect(resposta.status).toBe(200);
    expect(resposta.headers.get("content-type")).toMatch(/text\/event-stream/);
    const leitor = resposta.body!.getReader();
    const texto = await lerCorpoAte(leitor, "event: pronto", 3000);
    expect(texto).toContain("event: pronto");
  });

  it("publicar dispara mudou para outro ouvinte", async () => {
    const { app } = preparar();
    const cookieBruno = await login(app, "bruno", "123456");
    const cookieAna = await login(app, "ana", "123456");

    const sse = await app.request("/api/eventos", { headers: { Cookie: cookieBruno } });
    expect(sse.status).toBe(200);
    const leitor = sse.body!.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    const limitePronto = Date.now() + 3000;
    while (Date.now() < limitePronto) {
      const { done, value } = await leitor.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      if (buf.includes("event: pronto")) break;
    }
    expect(buf).toContain("event: pronto");

    const publicar = await app.request("/api/mural/publicar", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieAna },
      body: JSON.stringify({ descricao: "ao vivo" }),
    });
    expect(publicar.status).toBe(200);

    const limiteMudou = Date.now() + 3000;
    while (Date.now() < limiteMudou) {
      const { done, value } = await leitor.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      if (buf.includes("event: mudou")) break;
    }
    expect(buf).toContain("event: mudou");
    await leitor.cancel().catch(() => {});
  });

  it("sem cookie retorna 401", async () => {
    const { app } = preparar();
    const resposta = await app.request("/api/eventos");
    expect(resposta.status).toBe(401);
  });
});
