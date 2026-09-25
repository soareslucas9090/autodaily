import { useEffect, useRef, useState } from "react";
import { api, type Caneta, type Card, type Categoria, type Eu, type Mural, type Papel } from "./api";

type Tela = "mural" | "historico" | "relatorios" | "membros" | "categorias";

function aplicarTema(tema: "claro" | "escuro") {
  document.documentElement.dataset.tema = tema;
  localStorage.setItem("tema", tema);
}

function aplicarCaneta(caneta: Caneta) {
  document.documentElement.dataset.caneta = caneta;
}

export default function App() {
  const [eu, setEu] = useState<Eu | null | undefined>(undefined);
  const [tela, setTela] = useState<Tela>("mural");
  const [mural, setMural] = useState<Mural | null>(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    aplicarTema(localStorage.getItem("tema") === "escuro" ? "escuro" : "claro");
    api.eu().then((pessoa) => {
      setEu(pessoa);
      aplicarCaneta(pessoa.caneta);
    }).catch(() => setEu(null));
  }, []);

  useEffect(() => {
    if (!eu) return;
    api.mural().then(setMural).catch((erro: Error) => setAviso(erro.message));
  }, [eu]);

  if (eu === undefined) return <main className="entrar"><p>Abrindo a parede…</p></main>;
  if (!eu) return <Entrar aoEntrar={(pessoa) => { setEu(pessoa); aplicarCaneta(pessoa.caneta); }} />;

  return (
    <div className="casca">
      <header className="barra">
        <strong className="marca">AutoDaily</strong>
        <nav className="nav">
          <button type="button" aria-current={tela === "mural" ? "page" : undefined} onClick={() => setTela("mural")}>Mural</button>
          <button type="button" aria-current={tela === "historico" ? "page" : undefined} onClick={() => setTela("historico")}>Histórico</button>
          <button type="button" aria-current={tela === "relatorios" ? "page" : undefined} onClick={() => setTela("relatorios")}>Relatórios</button>
          {eu.papel === "admin" && (
            <>
              <button type="button" aria-current={tela === "membros" ? "page" : undefined} onClick={() => setTela("membros")}>Membros</button>
              <button type="button" aria-current={tela === "categorias" ? "page" : undefined} onClick={() => setTela("categorias")}>Categorias</button>
            </>
          )}
        </nav>
        <button
          type="button"
          className="icone"
          aria-label={eu.caneta === "azul" ? "Caneta azul" : "Caneta preta"}
          onClick={() => {
            const proxima: Caneta = eu.caneta === "azul" ? "preta" : "azul";
            api.caneta(proxima).then((pessoa) => { setEu(pessoa); aplicarCaneta(pessoa.caneta); });
          }}
        >
          {eu.caneta === "azul" ? "Caneta azul" : "Caneta preta"}
        </button>
        <button
          type="button"
          className="icone"
          onClick={() => aplicarTema(document.documentElement.dataset.tema === "escuro" ? "claro" : "escuro")}
        >
          Tema
        </button>
        <button type="button" className="icone" onClick={() => api.sair().then(() => setEu(null))}>Sair</button>
      </header>
      <main className="miolo" key={tela}>
        {aviso && <p className="aviso">{aviso}</p>}
        {tela === "mural" && mural && (
          <MuralTela mural={mural} eu={eu} aoMudar={setMural} aoAvisar={setAviso} />
        )}
        {tela === "historico" && <Historico eu={eu} />}
        {tela === "relatorios" && <Relatorios />}
        {tela === "membros" && eu.papel === "admin" && <Membros />}
        {tela === "categorias" && eu.papel === "admin" && <Categorias />}
      </main>
    </div>
  );
}

function Entrar({ aoEntrar }: { aoEntrar: (eu: Eu) => void }) {
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [aviso, setAviso] = useState("");
  return (
    <main className="entrar">
      <form
        className="folha"
        onSubmit={(evento) => {
          evento.preventDefault();
          api.entrar(username, senha).then(aoEntrar).catch((erro: Error) => setAviso(erro.message));
        }}
      >
        <h1 className="nome">Entrar</h1>
        <label className="campo">
          <span>Username</span>
          <input className="linha" placeholder="Seu username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        </label>
        <label className="campo">
          <span>Senha</span>
          <input className="linha" type="password" placeholder="Sua senha" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
        </label>
        <p className="aviso">{aviso}</p>
        <button className="acao" type="submit">Entrar</button>
      </form>
    </main>
  );
}

function MuralTela({
  mural,
  eu,
  aoMudar,
  aoAvisar,
}: {
  mural: Mural;
  eu: Eu;
  aoMudar: (mural: Mural) => void;
  aoAvisar: (texto: string) => void;
}) {
  return (
    <section className="mural" aria-label="Mural">
      {mural.cards.map((card) => (
        <CardFolha key={card.programador.id} card={card} eu={eu} aoMudar={aoMudar} aoAvisar={aoAvisar} />
      ))}
    </section>
  );
}

function CardFolha({
  card,
  eu,
  aoMudar,
  aoAvisar,
}: {
  card: Card;
  eu: Eu;
  aoMudar: (mural: Mural) => void;
  aoAvisar: (texto: string) => void;
}) {
  const tarefa = card.tarefa;
  const [aviso, setAviso] = useState("");
  const [escolhendo, setEscolhendo] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [rascunho, setRascunho] = useState("");
  const [idTrelloNovo, setIdTrelloNovo] = useState("");

  function falha(erro: Error) {
    setAviso(erro.message);
    aoAvisar("");
  }

  return (
    <article className="folha">
      {tarefa && (
        <div className="progresso" aria-label={`${tarefa.x} de ${tarefa.y}`}>
          <span className="enchimento" style={{ width: `${tarefa.percentual}%` }} />
          <em>{tarefa.x}/{tarefa.y}</em>
          {tarefa.insignia && <i className="insignia" aria-label="Ciência completa" />}
        </div>
      )}
      <h2 className="nome">{card.programador.username}</h2>
      {tarefa ? (
        <>
          {tarefa.podeEditar ? (
            <button type="button" className="rotulo" onClick={() => {
              setEscolhendo((v) => !v);
              api.categorias().then(setCategorias).catch(falha);
            }}>
              {tarefa.rotuloCategoria ?? "Sem categoria"}
            </button>
          ) : (
            tarefa.rotuloCategoria && <p className="rotulo">{tarefa.rotuloCategoria}</p>
          )}
          {escolhendo && tarefa.podeEditar && (
            <div className="categorias-escolha">
              {categorias.map((cat) => (
                <label key={cat.id}>
                  <input
                    type="checkbox"
                    checked={tarefa.categorias.some((c) => c.id === cat.id)}
                    onChange={() => {
                      const ids = tarefa.categorias.some((c) => c.id === cat.id)
                        ? tarefa.categorias.filter((c) => c.id !== cat.id).map((c) => c.id)
                        : [...tarefa.categorias.map((c) => c.id), cat.id];
                      api.editar({ categoriaIds: ids }).then(aoMudar).catch(falha);
                    }}
                  />
                  {cat.nome}
                </label>
              ))}
            </div>
          )}
          <TextoVivo
            valor={tarefa.descricao}
            pode={tarefa.podeEditar}
            placeholder="Descreva o que está fazendo agora"
            aoGravar={(descricao) => api.editar({ descricao }).then(aoMudar).catch(falha)}
          />
          <TextoVivo
            valor={tarefa.idTrello ?? ""}
            pode={tarefa.podeEditar}
            placeholder="Id do Trello (opcional)"
            aoGravar={(idTrello) => api.editar({ idTrello }).then(aoMudar).catch(falha)}
          />
          <ul className="ciencias">
            {tarefa.ciencias.map((ciencia) => (
              <li key={ciencia.usuarioId}>
                <button
                  type="button"
                  className="alfinete"
                  aria-pressed={ciencia.marcada}
                  disabled={!ciencia.acionavel}
                  onClick={() => {
                    const pedido = ciencia.marcada ? api.desmarcar(tarefa.id) : api.marcar(tarefa.id);
                    pedido.then(aoMudar).catch(falha);
                  }}
                >
                  <i />
                  {ciencia.username}
                </button>
              </li>
            ))}
          </ul>
          {tarefa.podeExcluir && (
            <button type="button" className="acao" onClick={() => api.excluir(tarefa.id).then(aoMudar).catch(falha)}>
              Tirar da parede
            </button>
          )}
        </>
      ) : eu.id === card.programador.id ? (
          <>
            <p className="meta">O lugar está vazio. Escreva o que está fazendo agora.</p>
            <div
              className={`escrita ${rascunho.trim() ? "" : "sem-texto"}`}
              contentEditable
              role="textbox"
              aria-label="O que você está fazendo agora"
              data-placeholder="Descreva o que está fazendo agora"
              onInput={(e) => setRascunho(e.currentTarget.textContent ?? "")}
            />
            <div
              className={`escrita ${idTrelloNovo.trim() ? "" : "sem-texto"}`}
              contentEditable
              role="textbox"
              aria-label="Id do Trello"
              data-placeholder="Id do Trello (opcional)"
              onInput={(e) => setIdTrelloNovo(e.currentTarget.textContent ?? "")}
            />
            <button
              type="button"
              className="acao"
              onClick={() => api.publicar({ descricao: rascunho, idTrello: idTrelloNovo }).then((novo) => {
                setRascunho("");
                setIdTrelloNovo("");
                aoMudar(novo);
              }).catch(falha)}
            >
              Colar na parede
            </button>
            {card.podeRetornar && (
              <button type="button" className="acao" onClick={() => api.retornar().then(aoMudar).catch(falha)}>
                Trazer o papel anterior
              </button>
            )}
          </>
        ) : (
          <p className="meta">Sem tarefa agora.</p>
        )}
      <p className="aviso">{aviso}</p>
    </article>
  );
}

function TextoVivo({
  valor,
  pode,
  aoGravar,
  placeholder,
}: {
  valor: string;
  pode: boolean;
  aoGravar: (texto: string) => Promise<unknown>;
  placeholder: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const focado = useRef(false);
  const timer = useRef<number>(0);
  const [semTexto, setSemTexto] = useState(() => !valor.trim());

  useEffect(() => {
    if (!focado.current && ref.current && ref.current.textContent !== valor) {
      ref.current.textContent = valor;
    }
    if (!focado.current) setSemTexto(!valor.trim());
  }, [valor]);

  return (
    <div
      ref={ref}
      className={`escrita ${semTexto ? "sem-texto" : ""}`}
      role="textbox"
      aria-label={placeholder}
      data-placeholder={placeholder}
      contentEditable={pode}
      suppressContentEditableWarning
      onFocus={() => { focado.current = true; }}
      onBlur={() => {
        focado.current = false;
        const texto = ref.current?.textContent ?? "";
        setSemTexto(!texto.trim());
        if (!pode || !ref.current) return;
        if (texto !== valor) aoGravar(texto);
      }}
      onInput={() => {
        const texto = ref.current?.textContent ?? "";
        setSemTexto(!texto.trim());
        if (!pode) return;
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => {
          const atual = ref.current?.textContent ?? "";
          if (atual !== valor) aoGravar(atual);
        }, 450);
      }}
    />
  );
}

function Historico({ eu }: { eu: Eu }) {
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [atalho, setAtalho] = useState("mes-atual");
  const [idTrello, setIdTrello] = useState("");
  const [programadorId, setProgramadorId] = useState("");
  const [ordem, setOrdem] = useState<"desc" | "asc">("desc");
  const [limite, setLimite] = useState(20);
  const [programadores, setProgramadores] = useState<{ id: string; username: string }[]>([]);
  const [itens, setItens] = useState<{ id: string; descricao: string; autor: string; autorId: string; idTrello: string | null; criadoEm: string; rotuloCategoria: string | null; x: number; y: number }[]>([]);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    api.programadores().then(setProgramadores).catch((erro: Error) => setAviso(erro.message));
    api.periodo("mes-atual").then((p) => { setInicio(p.inicio); setFim(p.fim); });
  }, []);

  useEffect(() => {
    if (!inicio || !fim) return;
    const params = new URLSearchParams({ inicio, fim, ordem, limite: String(limite) });
    if (idTrello) params.set("idTrello", idTrello);
    if (programadorId) params.set("programadorId", programadorId);
    api.historico(params).then((r) => setItens(r.itens)).catch((erro: Error) => setAviso(erro.message));
  }, [inicio, fim, idTrello, programadorId, ordem, limite]);

  return (
    <section className="folha painel">
      <h1 className="nome">Histórico</h1>
      <div className="filtros">
        <label className="campo">Id do Trello
          <input className="linha" placeholder="Filtrar por id do Trello" value={idTrello} onChange={(e) => setIdTrello(e.target.value)} />
        </label>
        <label className="campo">Programador
          <select className="linha" value={programadorId} onChange={(e) => setProgramadorId(e.target.value)}>
            <option value="">Todos</option>
            {programadores.map((p) => <option key={p.id} value={p.id}>{p.username}</option>)}
          </select>
        </label>
        <label className="campo">Período
          <select className="linha" value={atalho} onChange={(e) => {
            const valor = e.target.value;
            setAtalho(valor);
            if (valor !== "personalizado") api.periodo(valor).then((p) => { setInicio(p.inicio); setFim(p.fim); });
          }}>
            <option value="mes-atual">Mês atual</option>
            <option value="mes-passado">Mês passado</option>
            <option value="semana-passada">Semana passada</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </label>
        <label className="campo">Início
          <input className="linha" type="date" value={inicio} onChange={(e) => { setInicio(e.target.value); setAtalho("personalizado"); }} />
        </label>
        <label className="campo">Fim
          <input className="linha" type="date" value={fim} onChange={(e) => { setFim(e.target.value); setAtalho("personalizado"); }} />
        </label>
        <label className="campo">Ordem
          <select className="linha" value={ordem} onChange={(e) => setOrdem(e.target.value as "asc" | "desc")}>
            <option value="desc">Mais recente primeiro</option>
            <option value="asc">Mais antigo primeiro</option>
          </select>
        </label>
      </div>
      <ul className="lista">
        {itens.map((item) => (
          <li key={item.id} className="folha">
            <p className="nome">{item.autor}</p>
            <p className="escrita">{item.descricao}</p>
            <p className="meta">{item.idTrello ?? "sem id"} · {item.rotuloCategoria ?? "sem categoria"} · {item.x}/{item.y}</p>
            {(eu.papel === "admin" || eu.id === item.autorId) && (
              <button type="button" className="acao" onClick={() => api.excluir(item.id).then(() => setItens((lista) => lista.filter((i) => i.id !== item.id)))}>
                Excluir
              </button>
            )}
          </li>
        ))}
      </ul>
      <button type="button" className="acao" onClick={() => setLimite((n) => n + 20)}>Mostrar mais</button>
      <p className="aviso">{aviso}</p>
    </section>
  );
}

function Relatorios() {
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [modo, setModo] = useState<"simples" | "completo">("simples");
  const [dados, setDados] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    api.periodo("mes-atual").then((p) => { setInicio(p.inicio); setFim(p.fim); });
  }, []);

  useEffect(() => {
    if (!inicio || !fim) return;
    const params = new URLSearchParams({ inicio, fim, modo });
    api.relatorio(params).then(setDados);
  }, [inicio, fim, modo]);

  const porProgramador = (dados?.porProgramador ?? []) as { username: string; quantidade: number }[];
  const porDia = (dados?.porDia ?? []) as { dia: string; quantidade: number }[];
  const tarefas = (dados?.tarefas ?? []) as { id: string; descricao: string; autor: string; idTrello: string | null; categorias: string[]; duracaoMs: number; x: number; y: number }[];
  const porId = (dados?.porIdTrello ?? []) as { idTrello: string; quantidade: number; programadoresDistintos: number }[];

  return (
    <section className="folha painel">
      <h1 className="nome">Relatórios</h1>
      <div className="filtros">
        <label className="campo">Início<input className="linha" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} /></label>
        <label className="campo">Fim<input className="linha" type="date" value={fim} onChange={(e) => setFim(e.target.value)} /></label>
        <label className="campo">Modo
          <select className="linha" value={modo} onChange={(e) => setModo(e.target.value as "simples" | "completo")}>
            <option value="simples">Simples</option>
            <option value="completo">Completo</option>
          </select>
        </label>
      </div>
      <h2 className="nome">Por programador</h2>
      <ul>{porProgramador.map((l) => <li key={l.username}>{l.username}: {l.quantidade}</li>)}</ul>
      <h2 className="nome">Por dia</h2>
      <ul>{porDia.map((l) => <li key={l.dia}>{l.dia}: {l.quantidade}</li>)}</ul>
      {modo === "completo" && (
        <>
          <h2 className="nome">Por id do Trello</h2>
          <ul>{porId.map((l) => <li key={l.idTrello}>{l.idTrello}: {l.quantidade} tarefas, {l.programadoresDistintos} programadores</li>)}</ul>
          <p>Tempo médio: {Math.round(Number(dados?.tempoMedioMs ?? 0) / 60000)} min. Ciências fechadas: {String(dados?.quantasFecharamCiencia ?? 0)}</p>
          <table className="tabela">
            <thead><tr><th>Autor</th><th>Texto</th><th>Id</th><th>Categorias</th><th>Duração</th><th>Ciência</th></tr></thead>
            <tbody>
              {tarefas.map((t) => (
                <tr key={t.id}>
                  <td>{t.autor}</td>
                  <td>{t.descricao}</td>
                  <td>{t.idTrello ?? "—"}</td>
                  <td>{t.categorias.join(", ") || "—"}</td>
                  <td>{Math.round(t.duracaoMs / 60000)} min</td>
                  <td>{t.x}/{t.y}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}

function Membros() {
  const [lista, setLista] = useState<{ id: string; username: string; papel: Papel; ativo: boolean }[]>([]);
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [papel, setPapel] = useState<Papel>("programador");
  const [aviso, setAviso] = useState("");

  function carregar() {
    api.membros().then(setLista).catch((erro: Error) => setAviso(erro.message));
  }
  useEffect(carregar, []);

  return (
    <section className="folha painel">
      <h1 className="nome">Membros</h1>
      <form className="filtros" onSubmit={(e) => {
        e.preventDefault();
        api.criarMembro({ username, senha, papel }).then(() => { setUsername(""); setSenha(""); carregar(); }).catch((erro: Error) => setAviso(erro.message));
      }}>
        <input className="linha" placeholder="Nome de usuário" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="linha" placeholder="Senha (mínimo 6 caracteres)" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        <select className="linha" value={papel} onChange={(e) => setPapel(e.target.value as Papel)}>
          <option value="programador">Programador</option>
          <option value="admin">Admin</option>
        </select>
        <button className="acao" type="submit">Registrar</button>
      </form>
      <ul className="lista">
        {lista.map((membro) => (
          <li key={membro.id} className="linha-membro">
            <span>{membro.username}</span>
            <span>{membro.papel}</span>
            <span>{membro.ativo ? "ativo" : "desativado"}</span>
            <button type="button" className="acao" onClick={() => api.editarMembro(membro.id, { ativo: !membro.ativo }).then(carregar)}>
              {membro.ativo ? "Desativar" : "Reativar"}
            </button>
            <button type="button" className="acao" onClick={() => {
              const campo = document.getElementById(`senha-${membro.id}`) as HTMLInputElement | null;
              const nova = campo?.value ?? "";
              if (!nova) return;
              api.editarMembro(membro.id, { senha: nova }).then(() => { if (campo) campo.value = ""; carregar(); }).catch((erro: Error) => setAviso(erro.message));
            }}>Redefinir senha</button>
            <input
              id={`senha-${membro.id}`}
              className="linha"
              type="password"
              placeholder="Nova senha"
              aria-label={`Nova senha de ${membro.username}`}
            />
          </li>
        ))}
      </ul>
      <p className="aviso">{aviso}</p>
    </section>
  );
}

function Categorias() {
  const [lista, setLista] = useState<Categoria[]>([]);
  const [nome, setNome] = useState("");
  const [aviso, setAviso] = useState("");
  function carregar() {
    api.categorias().then(setLista).catch((erro: Error) => setAviso(erro.message));
  }
  useEffect(carregar, []);
  return (
    <section className="folha painel">
      <h1 className="nome">Categorias</h1>
      <form className="filtros" onSubmit={(e) => {
        e.preventDefault();
        api.criarCategoria(nome).then(() => { setNome(""); carregar(); }).catch((erro: Error) => setAviso(erro.message));
      }}>
        <input className="linha" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da categoria" />
        <button className="acao" type="submit">Cadastrar</button>
      </form>
      <ul>
        {lista.map((cat) => (
          <li key={cat.id}>
            {cat.nome}
            <button type="button" className="acao" onClick={() => api.excluirCategoria(cat.id).then(setLista)}>Excluir</button>
          </li>
        ))}
      </ul>
      <p className="aviso">{aviso}</p>
    </section>
  );
}
