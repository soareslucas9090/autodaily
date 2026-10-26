export type Papel = "admin" | "programador";
export type Caneta = "azul" | "preta";

export type Cor = { id: string; nome: string; hex: string };

export type Eu = { id: string; username: string; papel: Papel; caneta: Caneta; cor: Cor | null };

export type Ciencia = {
  usuarioId: string;
  username: string;
  marcada: boolean;
  acionavel: boolean;
  cor: Cor | null;
};

export type TarefaCard = {
  id: string;
  descricao: string;
  idTrello: string | null;
  categorias: { id: string; nome: string }[];
  rotuloCategoria: string | null;
  ciencias: Ciencia[];
  x: number;
  y: number;
  percentual: number;
  insignia: boolean;
  podeEditar: boolean;
  podeExcluir: boolean;
};

export type Card = {
  programador: { id: string; username: string; cor: Cor | null };
  podeRetornar: boolean;
  tarefa: TarefaCard | null;
};

export type Mural = { cards: Card[]; eu: Eu };

export type Categoria = { id: string; nome: string };

async function pedir<T>(caminho: string, init?: RequestInit): Promise<T> {
  const resposta = await fetch(caminho, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (resposta.status === 401) {
    const erro = new Error("nao-autenticado");
    throw erro;
  }
  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(corpo.mensagem ?? "Não foi possível concluir.");
  return corpo as T;
}

export const api = {
  eu: () => pedir<Eu>("/api/sessao"),
  entrar: (username: string, senha: string) =>
    pedir<Eu>("/api/sessao", { method: "POST", body: JSON.stringify({ username, senha }) }),
  sair: () => pedir<{ ok: boolean }>("/api/sessao", { method: "DELETE" }),
  caneta: (caneta: Caneta) =>
    pedir<Eu>("/api/eu/caneta", { method: "PATCH", body: JSON.stringify({ caneta }) }),
  alterarSenha: (senhaAtual: string, senhaNova: string) =>
    pedir<{ ok: boolean }>("/api/eu/senha", {
      method: "PATCH",
      body: JSON.stringify({ senhaAtual, senhaNova }),
    }),
  mural: () => pedir<Mural>("/api/mural"),
  publicar: (corpo: { descricao: string; idTrello?: string | null; categoriaIds?: string[] }) =>
    pedir<Mural>("/api/mural/publicar", { method: "POST", body: JSON.stringify(corpo) }),
  editar: (corpo: { descricao?: string; idTrello?: string | null; categoriaIds?: string[] }) =>
    pedir<Mural>("/api/tarefa-atual", { method: "PATCH", body: JSON.stringify(corpo) }),
  guardar: (id: string) => pedir<Mural>(`/api/tarefas/${id}/guardar`, { method: "POST" }),
  excluir: (id: string) => pedir<{ ok: boolean } | Mural>(`/api/tarefas/${id}`, { method: "DELETE" }),
  retornar: () => pedir<Mural>("/api/retornar-anterior", { method: "POST" }),
  marcar: (id: string) => pedir<Mural>(`/api/tarefas/${id}/ciencia`, { method: "POST" }),
  desmarcar: (id: string) => pedir<Mural>(`/api/tarefas/${id}/ciencia`, { method: "DELETE" }),
  periodo: (atalho: string) => pedir<{ inicio: string; fim: string }>(`/api/periodos/${atalho}`),
  historico: (params: URLSearchParams) => pedir<{
    total: number;
    limite: number;
    pagina: number;
    itens: { id: string; descricao: string; idTrello: string | null; autorId: string; autor: string; criadoEm: string; rotuloCategoria: string | null; x: number; y: number }[];
  }>(`/api/historico?${params}`),
  programadores: () => pedir<{ id: string; username: string; ativo: boolean }[]>("/api/programadores"),
  relatorio: (params: URLSearchParams) => pedir<Record<string, unknown>>(`/api/relatorios?${params}`),
  categorias: () => pedir<Categoria[]>("/api/categorias"),
  criarCategoria: (nome: string) => pedir<Categoria>("/api/categorias", { method: "POST", body: JSON.stringify({ nome }) }),
  excluirCategoria: (id: string) => pedir<Categoria[]>(`/api/categorias/${id}`, { method: "DELETE" }),
  cores: () => pedir<(Cor & { ocupadaPor: string | null })[]>("/api/cores"),
  criarCor: (nome: string, hex: string) =>
    pedir<Cor>("/api/cores", { method: "POST", body: JSON.stringify({ nome, hex }) }),
  excluirCor: (id: string) => pedir<(Cor & { ocupadaPor: string | null })[]>(`/api/cores/${id}`, { method: "DELETE" }),
  escolherCor: (corId: string) => pedir<Eu>("/api/eu/cor", { method: "PATCH", body: JSON.stringify({ corId }) }),
  membros: () => pedir<{ id: string; username: string; papel: Papel; ativo: boolean }[]>("/api/membros"),
  criarMembro: (corpo: { username: string; senha: string; papel: Papel }) =>
    pedir("/api/membros", { method: "POST", body: JSON.stringify(corpo) }),
  editarMembro: (id: string, corpo: { username?: string; senha?: string; ativo?: boolean; papel?: Papel }) =>
    pedir(`/api/membros/${id}`, { method: "PATCH", body: JSON.stringify(corpo) }),
};

export function ouvirAvisos(aoMudar: () => void): () => void {
  const fonte = new EventSource("/api/eventos");
  fonte.addEventListener("mudou", aoMudar);
  return () => fonte.close();
}
