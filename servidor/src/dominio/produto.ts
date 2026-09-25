import { and, asc, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { Banco } from "../banco/abrir.js";
import { categoria, ciencia, tarefa, tarefaCategoria, usuario } from "../banco/esquema.js";
import { ErroDeRegra } from "./erros.js";
import { conferirSenha, exigirSenhaValida, gerarHash } from "./senha.js";
import { diaNoFuso, fimDoDia, inicioDoDia } from "./tempo.js";

export type Papel = "admin" | "programador";
export type Caneta = "azul" | "preta";

type UsuarioLinha = typeof usuario.$inferSelect;
type TarefaLinha = typeof tarefa.$inferSelect;

function agoraIso(agora: Date): string {
  return agora.toISOString();
}

function limparTexto(valor: string | null | undefined): string | null {
  const texto = (valor ?? "").trim();
  return texto.length === 0 ? null : texto;
}

export function rotuloCategoria(nomes: string[]): string | null {
  const ordenados = [...nomes].sort((a, b) => a.localeCompare(b, "pt-BR"));
  if (ordenados.length === 0) return null;
  if (ordenados.length === 1) return ordenados[0];
  return `${ordenados[0]} e mais...`;
}

export class Produto {
  constructor(
    private readonly banco: Banco,
    private readonly relogio: () => Date = () => new Date(),
  ) {}

  private instante(): Date {
    return this.relogio();
  }

  private buscarUsuario(id: string): UsuarioLinha {
    const linha = this.banco.select().from(usuario).where(eq(usuario.id, id)).get();
    if (!linha) throw new ErroDeRegra("nao-encontrado", "Usuário não encontrado.");
    return linha;
  }

  private exigirAdmin(atorId: string): UsuarioLinha {
    const ator = this.buscarUsuario(atorId);
    if (ator.papel !== "admin") throw new ErroDeRegra("nao-autorizado", "Só o admin faz isso.");
    return ator;
  }

  private programadoresAtivos(): UsuarioLinha[] {
    return this.banco
      .select()
      .from(usuario)
      .where(and(eq(usuario.papel, "programador"), eq(usuario.ativo, 1)))
      .all()
      .sort((a, b) => a.username.localeCompare(b.username, "pt-BR"));
  }

  private denominadorDe(autorId: string): UsuarioLinha[] {
    return this.programadoresAtivos().filter((pessoa) => pessoa.id !== autorId);
  }

  private cienciasDa(tarefaId: string) {
    return this.banco.select().from(ciencia).where(eq(ciencia.tarefaId, tarefaId)).all();
  }

  private categoriasDa(tarefaId: string) {
    const vinculos = this.banco
      .select()
      .from(tarefaCategoria)
      .where(eq(tarefaCategoria.tarefaId, tarefaId))
      .all();
    if (vinculos.length === 0) return [];
    const ids = vinculos.map((v) => v.categoriaId);
    return this.banco.select().from(categoria).where(inArray(categoria.id, ids)).all();
  }

  private progresso(tarefaLinha: TarefaLinha) {
    const marcas = this.cienciasDa(tarefaLinha.id);
    if (tarefaLinha.naParede === 1) {
      const esperados = this.denominadorDe(tarefaLinha.autorId);
      const ids = new Set(esperados.map((p) => p.id));
      const x = marcas.filter((m) => ids.has(m.usuarioId)).length;
      const y = esperados.length;
      return { x, y, percentual: y === 0 ? 0 : Math.round((x / y) * 100) };
    }
    const x = marcas.length;
    const y = tarefaLinha.denominadorCongelado ?? 0;
    return { x, y, percentual: y === 0 ? 0 : Math.round((x / y) * 100) };
  }

  criarPrimeiroAdmin(username: string, senha: string): void {
    const jaExiste = this.banco.select().from(usuario).where(eq(usuario.papel, "admin")).get();
    if (jaExiste) throw new ErroDeRegra("admin-ja-existe", "O primeiro admin já existe.");
    exigirSenhaValida(senha);
    const nome = limparTexto(username);
    if (!nome) throw new ErroDeRegra("username-vazio", "O username é obrigatório.");
    const instante = agoraIso(this.instante());
    this.banco.insert(usuario).values({
      id: randomUUID(),
      username: nome,
      senhaHash: gerarHash(senha),
      papel: "admin",
      ativo: 1,
      caneta: "azul",
      criadoEm: instante,
      atualizadoEm: instante,
    }).run();
  }

  entrar(username: string, senha: string): UsuarioLinha {
    const linha = this.banco.select().from(usuario).where(eq(usuario.username, username.trim())).get();
    if (!linha || !conferirSenha(senha, linha.senhaHash) || linha.ativo !== 1) {
      throw new ErroDeRegra("credencial-invalida", "Não foi possível entrar.");
    }
    return linha;
  }

  criarMembro(atorId: string, dados: { username: string; senha: string; papel: Papel }): UsuarioLinha {
    this.exigirAdmin(atorId);
    exigirSenhaValida(dados.senha);
    const nome = limparTexto(dados.username);
    if (!nome) throw new ErroDeRegra("username-vazio", "O username é obrigatório.");
    if (dados.papel !== "admin" && dados.papel !== "programador") {
      throw new ErroDeRegra("papel-invalido", "Papel inválido.");
    }
    const instante = agoraIso(this.instante());
    const id = randomUUID();
    this.banco.insert(usuario).values({
      id,
      username: nome,
      senhaHash: gerarHash(dados.senha),
      papel: dados.papel,
      ativo: 1,
      caneta: "azul",
      criadoEm: instante,
      atualizadoEm: instante,
    }).run();
    return this.buscarUsuario(id);
  }

  editarMembro(
    atorId: string,
    membroId: string,
    dados: { username?: string; senha?: string; ativo?: boolean; papel?: Papel },
  ): UsuarioLinha {
    this.exigirAdmin(atorId);
    const membro = this.buscarUsuario(membroId);
    const instante = agoraIso(this.instante());
    const username = dados.username === undefined ? membro.username : limparTexto(dados.username);
    if (!username) throw new ErroDeRegra("username-vazio", "O username é obrigatório.");
    let senhaHash = membro.senhaHash;
    if (dados.senha !== undefined) {
      exigirSenhaValida(dados.senha);
      senhaHash = gerarHash(dados.senha);
    }
    this.banco
      .update(usuario)
      .set({
        username,
        senhaHash,
        ativo: dados.ativo === undefined ? membro.ativo : dados.ativo ? 1 : 0,
        papel: dados.papel ?? membro.papel,
        atualizadoEm: instante,
      })
      .where(eq(usuario.id, membroId))
      .run();
    return this.buscarUsuario(membroId);
  }

  listarMembros(atorId: string): UsuarioLinha[] {
    this.exigirAdmin(atorId);
    return this.banco.select().from(usuario).all().sort((a, b) => a.username.localeCompare(b.username, "pt-BR"));
  }

  definirCaneta(usuarioId: string, caneta: Caneta): void {
    if (caneta !== "azul" && caneta !== "preta") throw new ErroDeRegra("caneta-invalida", "Caneta inválida.");
    this.banco
      .update(usuario)
      .set({ caneta, atualizadoEm: agoraIso(this.instante()) })
      .where(eq(usuario.id, usuarioId))
      .run();
  }

  criarCategoria(atorId: string, nome: string) {
    this.exigirAdmin(atorId);
    const limpo = limparTexto(nome);
    if (!limpo) throw new ErroDeRegra("nome-vazio", "O nome da categoria é obrigatório.");
    const instante = agoraIso(this.instante());
    const id = randomUUID();
    this.banco.insert(categoria).values({ id, nome: limpo, criadoEm: instante, atualizadoEm: instante }).run();
    return this.banco.select().from(categoria).where(eq(categoria.id, id)).get()!;
  }

  excluirCategoria(atorId: string, categoriaId: string): void {
    this.exigirAdmin(atorId);
    this.banco.delete(tarefaCategoria).where(eq(tarefaCategoria.categoriaId, categoriaId)).run();
    this.banco.delete(categoria).where(eq(categoria.id, categoriaId)).run();
  }

  listarCategorias() {
    return this.banco.select().from(categoria).all().sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }

  private tarefaAtual(autorId: string): TarefaLinha | undefined {
    return this.banco
      .select()
      .from(tarefa)
      .where(and(eq(tarefa.autorId, autorId), eq(tarefa.naParede, 1)))
      .get();
  }

  private guardarAtual(autorId: string, instante: string): void {
    const atual = this.tarefaAtual(autorId);
    if (!atual) return;
    const y = this.denominadorDe(autorId).length;
    this.banco
      .update(tarefa)
      .set({
        naParede: 0,
        saiuDaParedeEm: instante,
        denominadorCongelado: y,
        atualizadoEm: instante,
      })
      .where(eq(tarefa.id, atual.id))
      .run();
  }

  private vincularCategorias(tarefaId: string, categoriaIds: string[]): void {
    this.banco.delete(tarefaCategoria).where(eq(tarefaCategoria.tarefaId, tarefaId)).run();
    for (const categoriaId of categoriaIds) {
      const existe = this.banco.select().from(categoria).where(eq(categoria.id, categoriaId)).get();
      if (!existe) throw new ErroDeRegra("categoria-inexistente", "Categoria não encontrada.");
      this.banco.insert(tarefaCategoria).values({ tarefaId, categoriaId }).run();
    }
  }

  publicar(
    autorId: string,
    dados: { descricao: string; idTrello?: string | null; categoriaIds?: string[] },
  ): TarefaLinha {
    const autor = this.buscarUsuario(autorId);
    if (autor.papel !== "programador" || autor.ativo !== 1) {
      throw new ErroDeRegra("nao-autorizado", "Só programador ativo publica.");
    }
    const descricao = limparTexto(dados.descricao);
    if (!descricao) throw new ErroDeRegra("descricao-vazia", "A descrição é obrigatória.");
    const instante = agoraIso(this.instante());
    this.guardarAtual(autorId, instante);
    const id = randomUUID();
    this.banco.insert(tarefa).values({
      id,
      autorId,
      descricao,
      idTrello: limparTexto(dados.idTrello),
      naParede: 1,
      saiuDaParedeEm: null,
      denominadorCongelado: null,
      criadoEm: instante,
      atualizadoEm: instante,
    }).run();
    this.vincularCategorias(id, dados.categoriaIds ?? []);
    return this.banco.select().from(tarefa).where(eq(tarefa.id, id)).get()!;
  }

  editarTarefaAtual(
    atorId: string,
    dados: { descricao?: string; idTrello?: string | null; categoriaIds?: string[] },
  ): TarefaLinha {
    const atual = this.tarefaAtual(atorId);
    if (!atual) throw new ErroDeRegra("sem-tarefa", "Não há tarefa atual.");
    if (atual.autorId !== atorId) throw new ErroDeRegra("nao-autorizado", "Só o dono edita.");
    const descricao = dados.descricao === undefined ? atual.descricao : limparTexto(dados.descricao);
    if (!descricao) throw new ErroDeRegra("descricao-vazia", "A descrição é obrigatória.");
    const instante = agoraIso(this.instante());
    this.banco
      .update(tarefa)
      .set({
        descricao,
        idTrello: dados.idTrello === undefined ? atual.idTrello : limparTexto(dados.idTrello),
        atualizadoEm: instante,
      })
      .where(eq(tarefa.id, atual.id))
      .run();
    if (dados.categoriaIds) this.vincularCategorias(atual.id, dados.categoriaIds);
    const aindaAtual = this.tarefaAtual(atorId);
    if (!aindaAtual || aindaAtual.id !== atual.id) {
      throw new ErroDeRegra("arquivou", "Edição não pode arquivar.");
    }
    return aindaAtual;
  }

  excluirTarefa(atorId: string, tarefaId: string): void {
    const ator = this.buscarUsuario(atorId);
    const alvo = this.banco.select().from(tarefa).where(eq(tarefa.id, tarefaId)).get();
    if (!alvo) throw new ErroDeRegra("nao-encontrado", "Tarefa não encontrada.");
    const pode = ator.papel === "admin" || alvo.autorId === atorId;
    if (!pode) throw new ErroDeRegra("nao-autorizado", "Sem permissão para excluir.");
    this.banco.delete(ciencia).where(eq(ciencia.tarefaId, tarefaId)).run();
    this.banco.delete(tarefaCategoria).where(eq(tarefaCategoria.tarefaId, tarefaId)).run();
    this.banco.delete(tarefa).where(eq(tarefa.id, tarefaId)).run();
  }

  retornarAnterior(autorId: string): TarefaLinha {
    const autor = this.buscarUsuario(autorId);
    if (autor.papel !== "programador") throw new ErroDeRegra("nao-autorizado", "Só o programador retorna.");
    if (this.tarefaAtual(autorId)) throw new ErroDeRegra("ja-tem-atual", "Já existe tarefa atual.");
    const guardadas = this.banco
      .select()
      .from(tarefa)
      .where(and(eq(tarefa.autorId, autorId), eq(tarefa.naParede, 0)))
      .all()
      .sort((a, b) => (b.saiuDaParedeEm ?? "").localeCompare(a.saiuDaParedeEm ?? ""));
    const anterior = guardadas[0];
    if (!anterior) throw new ErroDeRegra("sem-anterior", "Não há tarefa para retornar.");
    const ativos = new Set(this.programadoresAtivos().map((p) => p.id));
    for (const marca of this.cienciasDa(anterior.id)) {
      if (!ativos.has(marca.usuarioId) || marca.usuarioId === autorId) {
        this.banco.delete(ciencia).where(eq(ciencia.id, marca.id)).run();
      }
    }
    const instante = agoraIso(this.instante());
    this.banco
      .update(tarefa)
      .set({
        naParede: 1,
        saiuDaParedeEm: null,
        denominadorCongelado: null,
        atualizadoEm: instante,
      })
      .where(eq(tarefa.id, anterior.id))
      .run();
    return this.banco.select().from(tarefa).where(eq(tarefa.id, anterior.id)).get()!;
  }

  marcarCiencia(atorId: string, tarefaId: string): void {
    const ator = this.buscarUsuario(atorId);
    const alvo = this.banco.select().from(tarefa).where(eq(tarefa.id, tarefaId)).get();
    if (!alvo || alvo.naParede !== 1) throw new ErroDeRegra("nao-encontrado", "Tarefa atual não encontrada.");
    if (ator.papel !== "programador" || ator.ativo !== 1 || ator.id === alvo.autorId) {
      throw new ErroDeRegra("nao-autorizado", "Essa ciência não pode ser marcada.");
    }
    const ja = this.banco
      .select()
      .from(ciencia)
      .where(and(eq(ciencia.tarefaId, tarefaId), eq(ciencia.usuarioId, atorId)))
      .get();
    if (ja) return;
    this.banco.insert(ciencia).values({
      id: randomUUID(),
      tarefaId,
      usuarioId: atorId,
      criadoEm: agoraIso(this.instante()),
    }).run();
  }

  desmarcarCiencia(atorId: string, tarefaId: string): void {
    this.banco
      .delete(ciencia)
      .where(and(eq(ciencia.tarefaId, tarefaId), eq(ciencia.usuarioId, atorId)))
      .run();
  }

  mural(atorId: string) {
    const ator = this.buscarUsuario(atorId);
    const cards = this.programadoresAtivos().map((programador) => {
      const atual = this.tarefaAtual(programador.id);
      const guardada = this.banco
        .select()
        .from(tarefa)
        .where(and(eq(tarefa.autorId, programador.id), eq(tarefa.naParede, 0)))
        .get();
      return {
        programador: { id: programador.id, username: programador.username },
        podeRetornar: !atual && Boolean(guardada) && ator.id === programador.id,
        tarefa: atual ? this.detalheCard(atual, ator) : null,
      };
    });
    return { cards, eu: this.publico(ator) };
  }

  private detalheCard(linha: TarefaLinha, ator: UsuarioLinha) {
    const nomes = this.categoriasDa(linha.id).map((c) => c.nome);
    const categorias = this.categoriasDa(linha.id)
      .map((c) => ({ id: c.id, nome: c.nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    const { x, y, percentual } = this.progresso(linha);
    const marcas = new Set(this.cienciasDa(linha.id).map((m) => m.usuarioId));
    const ciencias = this.denominadorDe(linha.autorId).map((pessoa) => ({
      usuarioId: pessoa.id,
      username: pessoa.username,
      marcada: marcas.has(pessoa.id),
      acionavel: ator.papel === "programador" && ator.id === pessoa.id && ator.id !== linha.autorId,
    }));
    return {
      id: linha.id,
      descricao: linha.descricao,
      idTrello: linha.idTrello,
      categorias,
      rotuloCategoria: rotuloCategoria(nomes),
      ciencias,
      x,
      y,
      percentual,
      insignia: y > 0 && x === y,
      podeEditar: ator.id === linha.autorId,
      podeExcluir: ator.papel === "admin" || ator.id === linha.autorId,
    };
  }

  private publico(linha: UsuarioLinha) {
    return {
      id: linha.id,
      username: linha.username,
      papel: linha.papel as Papel,
      caneta: linha.caneta as Caneta,
    };
  }

  usuarioPublico(id: string) {
    return this.publico(this.buscarUsuario(id));
  }

  historico(consulta: {
    idTrello?: string | null;
    programadorId?: string | null;
    inicio: string;
    fim: string;
    ordem?: "asc" | "desc";
    limite?: number;
    pagina?: number;
  }) {
    const inicio = inicioDoDia(consulta.inicio).toISOString();
    const fim = fimDoDia(consulta.fim).toISOString();
    const filtros = [gte(tarefa.criadoEm, inicio), lte(tarefa.criadoEm, fim), eq(tarefa.naParede, 0)];
    if (consulta.programadorId) filtros.push(eq(tarefa.autorId, consulta.programadorId));
    const idTrello = limparTexto(consulta.idTrello);
    if (idTrello) filtros.push(eq(tarefa.idTrello, idTrello));
    const ordem = consulta.ordem === "asc" ? asc(tarefa.criadoEm) : desc(tarefa.criadoEm);
    const todas = this.banco.select().from(tarefa).where(and(...filtros)).orderBy(ordem).all();
    const limite = consulta.limite && consulta.limite > 0 ? consulta.limite : 20;
    const pagina = consulta.pagina && consulta.pagina > 0 ? consulta.pagina : 1;
    const inicioIndice = (pagina - 1) * limite;
    const fatia = todas.slice(inicioIndice, inicioIndice + limite);
    return {
      total: todas.length,
      limite,
      pagina,
      itens: fatia.map((linha) => {
        const autor = this.buscarUsuario(linha.autorId);
        const nomes = this.categoriasDa(linha.id).map((c) => c.nome);
        const progresso = this.progresso(linha);
        return {
          id: linha.id,
          descricao: linha.descricao,
          idTrello: linha.idTrello,
          autorId: autor.id,
          autor: autor.username,
          criadoEm: linha.criadoEm,
          rotuloCategoria: rotuloCategoria(nomes),
          ...progresso,
        };
      }),
    };
  }

  listarProgramadores() {
    return this.banco
      .select()
      .from(usuario)
      .where(eq(usuario.papel, "programador"))
      .all()
      .sort((a, b) => a.username.localeCompare(b.username, "pt-BR"))
      .map((p) => ({ id: p.id, username: p.username, ativo: p.ativo === 1 }));
  }

  relatorio(inicioData: string, fimData: string, modo: "simples" | "completo", instanteConsulta = this.instante()) {
    const inicio = inicioDoDia(inicioData).toISOString();
    const fim = fimDoDia(fimData).toISOString();
    const tarefas = this.banco
      .select()
      .from(tarefa)
      .where(and(gte(tarefa.criadoEm, inicio), lte(tarefa.criadoEm, fim)))
      .all();
    const porProgramador = new Map<string, number>();
    const porDia = new Map<string, number>();
    for (const linha of tarefas) {
      const autor = this.buscarUsuario(linha.autorId);
      porProgramador.set(autor.username, (porProgramador.get(autor.username) ?? 0) + 1);
      const dia = diaNoFuso(linha.criadoEm);
      porDia.set(dia, (porDia.get(dia) ?? 0) + 1);
    }
    const simples = {
      porProgramador: [...porProgramador.entries()]
        .map(([username, quantidade]) => ({ username, quantidade }))
        .sort((a, b) => a.username.localeCompare(b.username, "pt-BR")),
      porDia: [...porDia.entries()]
        .map(([dia, quantidade]) => ({ dia, quantidade }))
        .sort((a, b) => a.dia.localeCompare(b.dia)),
    };
    if (modo === "simples") return { modo, ...simples };
    const porId = new Map<string, { quantidade: number; programadores: Set<string> }>();
    const detalhes = tarefas.map((linha) => {
      const autor = this.buscarUsuario(linha.autorId);
      const fimDuracao = linha.naParede === 1 ? instanteConsulta : new Date(linha.saiuDaParedeEm ?? linha.criadoEm);
      const duracaoMs = Math.max(0, fimDuracao.getTime() - new Date(linha.criadoEm).getTime());
      const progresso = this.progresso(linha);
      if (linha.idTrello) {
        const grupo = porId.get(linha.idTrello) ?? { quantidade: 0, programadores: new Set<string>() };
        grupo.quantidade += 1;
        grupo.programadores.add(autor.id);
        porId.set(linha.idTrello, grupo);
      }
      return {
        id: linha.id,
        descricao: linha.descricao,
        autor: autor.username,
        idTrello: linha.idTrello,
        categorias: this.categoriasDa(linha.id).map((c) => c.nome).sort((a, b) => a.localeCompare(b, "pt-BR")),
        duracaoMs,
        naParede: linha.naParede === 1,
        ...progresso,
        cienciaFechada: progresso.y > 0 && progresso.x === progresso.y,
      };
    });
    const media = detalhes.length === 0 ? 0 : detalhes.reduce((s, t) => s + t.duracaoMs, 0) / detalhes.length;
    return {
      modo,
      ...simples,
      porIdTrello: [...porId.entries()]
        .map(([idTrello, grupo]) => ({
          idTrello,
          quantidade: grupo.quantidade,
          programadoresDistintos: grupo.programadores.size,
        }))
        .sort((a, b) => a.idTrello.localeCompare(b.idTrello)),
      tarefas: detalhes,
      tempoMedioMs: media,
      quantasFecharamCiencia: detalhes.filter((t) => t.cienciaFechada).length,
    };
  }
}
