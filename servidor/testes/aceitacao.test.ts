import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { abrirBanco } from "../src/banco/abrir.js";
import { ErroDeRegra } from "../src/dominio/erros.js";
import { Produto } from "../src/dominio/produto.js";
import { mesAtual, mesPassado, semanaPassada } from "../src/dominio/tempo.js";

function novo() {
  const dir = mkdtempSync(join(tmpdir(), "autodaily-"));
  const banco = abrirBanco(join(dir, "teste.sqlite"));
  let instante = new Date("2026-09-15T15:00:00.000Z");
  const produto = new Produto(banco, () => instante);
  produto.criarPrimeiroAdmin("admin", "segredo");
  const admin = produto.entrar("admin", "segredo");
  const criar = (username: string) =>
    produto.criarMembro(admin.id, { username, senha: "123456", papel: "programador" });
  return {
    produto,
    admin,
    criar,
    avancar(iso: string) {
      instante = new Date(iso);
    },
  };
}

describe("aceitação", () => {
  it("recusa segundo admin pelo comando e senha curta", () => {
    const { produto } = novo();
    expect(() => produto.criarPrimeiroAdmin("outro", "123456")).toThrow(ErroDeRegra);
    expect(() => produto.criarMembro(produto.entrar("admin", "segredo").id, { username: "a", senha: "12345", papel: "programador" })).toThrow(
      ErroDeRegra,
    );
  });

  it("desativado não entra e não aparece no mural", () => {
    const { produto, admin, criar } = novo();
    const ana = criar("ana");
    criar("bruno");
    produto.editarMembro(admin.id, ana.id, { ativo: false });
    expect(() => produto.entrar("ana", "123456")).toThrow(ErroDeRegra);
    const mural = produto.mural(admin.id);
    expect(mural.cards.map((c) => c.programador.username)).toEqual(["bruno"]);
  });

  it("publicar guarda o papel anterior e edição não arquiva", () => {
    const { produto, criar } = novo();
    const ana = criar("ana");
    const cat = produto.criarCategoria(produto.entrar("admin", "segredo").id, "Alpha");
    const primeira = produto.publicar(ana.id, { descricao: "um", idTrello: "T1", categoriaIds: [cat.id] });
    produto.publicar(ana.id, { descricao: "dois" });
    const mural = produto.mural(ana.id);
    expect(mural.cards[0].tarefa?.descricao).toBe("dois");
    expect(mural.cards[0].tarefa?.id).not.toBe(primeira.id);
    produto.editarTarefaAtual(ana.id, { descricao: "dois corrigido", idTrello: "T9" });
    const deNovo = produto.mural(ana.id);
    expect(deNovo.cards[0].tarefa?.id).not.toBe(primeira.id);
    expect(deNovo.cards[0].tarefa?.descricao).toBe("dois corrigido");
    expect(() => produto.editarTarefaAtual(ana.id, { descricao: "  " })).toThrow(ErroDeRegra);
    expect(produto.mural(ana.id).cards[0].tarefa?.descricao).toBe("dois corrigido");
  });

  it("descrição vazia não publica e card sem tarefa permanece", () => {
    const { produto, criar } = novo();
    const ana = criar("ana");
    expect(() => produto.publicar(ana.id, { descricao: " " })).toThrow(ErroDeRegra);
    expect(produto.mural(ana.id).cards[0].tarefa).toBeNull();
  });

  it("face mostra Alpha e mais... e some a categoria excluída", () => {
    const { produto, admin, criar } = novo();
    const ana = criar("ana");
    const alpha = produto.criarCategoria(admin.id, "Alpha");
    const beta = produto.criarCategoria(admin.id, "Beta");
    produto.publicar(ana.id, { descricao: "texto", categoriaIds: [beta.id, alpha.id] });
    expect(produto.mural(ana.id).cards[0].tarefa?.rotuloCategoria).toBe("Alpha e mais...");
    produto.excluirCategoria(admin.id, beta.id);
    const card = produto.mural(ana.id).cards[0].tarefa;
    expect(card?.rotuloCategoria).toBe("Alpha");
    expect(card?.descricao).toBe("texto");
    expect(() => produto.criarCategoria(ana.id, "Gamma")).toThrow(ErroDeRegra);
  });

  it("ciência 2/5 é 40% e a insígnia aparece quando x = y", () => {
    const { produto, criar } = novo();
    const nomes = ["ana", "bruno", "carla", "davi", "elias", "fabio"];
    const pessoas = nomes.map(criar);
    const ana = pessoas[0];
    const publicada = produto.publicar(ana.id, { descricao: "agora" });
    produto.marcarCiencia(pessoas[1].id, publicada.id);
    let card = produto.mural(pessoas[1].id).cards.find((c) => c.programador.username === "ana")!.tarefa!;
    expect(card.x).toBe(1);
    expect(card.y).toBe(5);
    produto.marcarCiencia(pessoas[2].id, publicada.id);
    card = produto.mural(ana.id).cards[0].tarefa!;
    expect(card).toMatchObject({ x: 2, y: 5, percentual: 40, insignia: false });
    expect(card.ciencias.map((c) => c.username)).toEqual(["bruno", "carla", "davi", "elias", "fabio"]);
    expect(() => produto.marcarCiencia(ana.id, publicada.id)).toThrow(ErroDeRegra);
    expect(() => produto.marcarCiencia(produto.entrar("admin", "segredo").id, publicada.id)).toThrow(ErroDeRegra);
    for (const pessoa of pessoas.slice(1)) produto.marcarCiencia(pessoa.id, publicada.id);
    card = produto.mural(ana.id).cards[0].tarefa!;
    expect(card.x).toBe(card.y);
    expect(card.percentual).toBe(100);
    expect(card.insignia).toBe(true);
    produto.desmarcarCiencia(pessoas[1].id, publicada.id);
    card = produto.mural(ana.id).cards[0].tarefa!;
    expect(card.x).toBe(4);
  });

  it("excluir a atual deixa o card em branco e o retorno usa o time de agora", () => {
    const { produto, admin, criar } = novo();
    const ana = criar("ana");
    const bruno = criar("bruno");
    const carla = criar("carla");
    const primeira = produto.publicar(ana.id, { descricao: "antiga" });
    produto.marcarCiencia(bruno.id, primeira.id);
    produto.marcarCiencia(carla.id, primeira.id);
    produto.publicar(ana.id, { descricao: "nova" });
    produto.excluirTarefa(ana.id, produto.mural(ana.id).cards[0].tarefa!.id);
    let card = produto.mural(ana.id).cards[0];
    expect(card.tarefa).toBeNull();
    expect(card.podeRetornar).toBe(true);
    produto.editarMembro(admin.id, carla.id, { ativo: false });
    produto.retornarAnterior(ana.id);
    card = produto.mural(ana.id).cards[0];
    expect(card.tarefa?.descricao).toBe("antiga");
    expect(card.tarefa?.y).toBe(1);
    expect(card.tarefa?.ciencias.map((c) => c.username)).toEqual(["bruno"]);
    expect(card.tarefa?.ciencias[0].marcada).toBe(true);
  });

  it("programador não exclui tarefa alheia", () => {
    const { produto, criar } = novo();
    const ana = criar("ana");
    const bruno = criar("bruno");
    const publicada = produto.publicar(ana.id, { descricao: "dela" });
    expect(() => produto.excluirTarefa(bruno.id, publicada.id)).toThrow(ErroDeRegra);
  });

  it("histórico padrão, filtros e exclusão fora dos relatórios", () => {
    const { produto, admin, criar, avancar } = novo();
    const ana = criar("ana");
    const bruno = criar("bruno");
    avancar("2026-08-10T15:00:00.000Z");
    produto.publicar(ana.id, { descricao: "agosto", idTrello: "A" });
    avancar("2026-09-02T15:00:00.000Z");
    produto.publicar(ana.id, { descricao: "setembro-a", idTrello: "B" });
    avancar("2026-09-05T15:00:00.000Z");
    produto.publicar(ana.id, { descricao: "setembro-atual", idTrello: "C" });
    avancar("2026-09-20T15:00:00.000Z");
    produto.publicar(bruno.id, { descricao: "setembro-b", idTrello: "B" });
    const agora = new Date("2026-09-20T15:00:00.000Z");
    const mes = mesAtual(agora);
    const lista = produto.historico({ inicio: mes.inicio, fim: mes.fim });
    expect(lista.limite).toBe(20);
    expect(lista.itens.map((i) => i.descricao)).toEqual(["setembro-a"]);
    const soBruno = produto.historico({
      inicio: mes.inicio,
      fim: mes.fim,
      programadorId: bruno.id,
    });
    expect(soBruno.itens).toHaveLength(0);
    const porId = produto.historico({ inicio: "2026-08-01", fim: "2026-09-30", idTrello: "B" });
    expect(porId.itens.map((i) => i.descricao)).toEqual(["setembro-a"]);
    const passado = mesPassado(agora);
    const agosto = produto.historico({ inicio: passado.inicio, fim: passado.fim });
    expect(agosto.itens.map((i) => i.descricao)).toEqual(["agosto"]);
    const semana = semanaPassada(new Date("2026-09-16T15:00:00.000Z"));
    expect(semana.inicio <= "2026-09-14" && semana.fim >= "2026-09-08").toBe(true);
    const idAgosto = agosto.itens[0].id;
    produto.excluirTarefa(ana.id, idAgosto);
    const relatorio = produto.relatorio("2026-08-01", "2026-09-30", "simples");
    expect(relatorio.porProgramador.find((p) => p.username === "ana")?.quantidade).toBe(2);
    expect(produto.historico({ inicio: "2026-08-01", fim: "2026-08-31" }).itens).toHaveLength(0);
    expect(() => produto.excluirTarefa(bruno.id, produto.historico({ inicio: mes.inicio, fim: mes.fim }).itens[0].id)).toThrow(
      ErroDeRegra,
    );
    produto.excluirTarefa(admin.id, produto.historico({ inicio: mes.inicio, fim: mes.fim }).itens[0].id);
    expect(produto.historico({ inicio: mes.inicio, fim: mes.fim }).itens).toHaveLength(0);
    const depois = produto.relatorio(mes.inicio, mes.fim, "simples");
    expect(depois.porProgramador.find((p) => p.username === "ana")?.quantidade).toBe(1);
  });

  it("relatório completo usa publicação, duração e ciência congelada", () => {
    const { produto, criar, avancar } = novo();
    const ana = criar("ana");
    const bruno = criar("bruno");
    avancar("2026-09-01T12:00:00.000Z");
    const antiga = produto.publicar(ana.id, { descricao: "longa", idTrello: "Z" });
    produto.marcarCiencia(bruno.id, antiga.id);
    avancar("2026-09-01T13:00:00.000Z");
    produto.publicar(ana.id, { descricao: "nova", idTrello: "Z" });
    avancar("2026-09-10T12:00:00.000Z");
    produto.publicar(bruno.id, { descricao: "fora", idTrello: "Z" });
    const completo = produto.relatorio("2026-09-01", "2026-09-02", "completo", new Date("2026-09-02T12:00:00.000Z"));
    if (completo.modo !== "completo") throw new Error("modo");
    expect(completo.porProgramador).toEqual([{ username: "ana", quantidade: 2 }]);
    expect(completo.porIdTrello).toEqual([{ idTrello: "Z", quantidade: 2, programadoresDistintos: 1 }]);
    const guardada = completo.tarefas.find((t) => t.id === antiga.id)!;
    expect(guardada.duracaoMs).toBe(60 * 60 * 1000);
    expect(guardada.x).toBe(1);
    expect(guardada.y).toBe(1);
    const naParede = completo.tarefas.find((t) => t.descricao === "nova")!;
    expect(naParede.duracaoMs).toBe(23 * 60 * 60 * 1000);
    expect(completo.tarefas.find((t) => t.descricao === "fora")).toBeUndefined();
  });

  it("cor de post-it é exclusiva entre programadores ativos", () => {
    const { produto, admin, criar } = novo();
    const ana = criar("ana");
    const bruno = criar("bruno");
    expect(() => produto.criarCor(ana.id, { nome: "Azul", hex: "#2255aa" })).toThrow(ErroDeRegra);
    const azul = produto.criarCor(admin.id, { nome: "Azul", hex: "#2255aa" });
    produto.escolherCor(ana.id, azul.id);
    expect(() => produto.escolherCor(bruno.id, azul.id)).toThrow(ErroDeRegra);
    produto.editarMembro(admin.id, ana.id, { ativo: false });
    produto.escolherCor(bruno.id, azul.id);
    expect(produto.mural(bruno.id).cards[0].programador.cor?.hex).toBe("#2255aa");
    produto.editarMembro(admin.id, ana.id, { ativo: true });
    const anaDeNovo = produto.listarMembros(admin.id).find((m) => m.id === ana.id);
    expect(anaDeNovo?.ativo).toBe(1);
    expect(produto.entrar("ana", "123456")).toBeTruthy();
    const mural = produto.mural(ana.id);
    const cardAna = mural.cards.find((c) => c.programador.username === "ana");
    expect(cardAna?.programador.cor).toBeNull();
    produto.excluirCor(admin.id, azul.id);
    expect(produto.mural(bruno.id).cards.find((c) => c.programador.username === "bruno")?.programador.cor).toBeNull();
  });
});
