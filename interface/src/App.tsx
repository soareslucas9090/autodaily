import { useEffect, useRef, useState } from "react";
import pinSvg from "./assets/pushpin.svg?raw";
import { api, ouvirAvisos, type Caneta, type Card, type Categoria, type Cor, type Eu, type Mural, type Papel } from "./api";

type Tela = "mural" | "historico" | "relatorios" | "conta" | "membros" | "categorias" | "cores";

function aplicarTema(tema: "claro" | "escuro") {
  document.documentElement.dataset.tema = tema;
  localStorage.setItem("tema", tema);
}

function aplicarCaneta(caneta: Caneta) {
  document.documentElement.dataset.caneta = caneta;
}

export default function App() {
  const [eu, setEu] = useState<Eu | null | undefined>(undefined);
  const [tema, setTema] = useState<"claro" | "escuro">(localStorage.getItem("tema") === "escuro" ? "escuro" : "claro");
  const [tela, setTela] = useState<Tela>("mural");
  const [mural, setMural] = useState<Mural | null>(null);
  const [aviso, setAviso] = useState("");
  const [epoca, setEpoca] = useState(0);
  const avisoTimer = useRef(0);

  useEffect(() => {
    aplicarTema(tema);
    api.eu().then((pessoa) => {
      setEu(pessoa);
      aplicarCaneta(pessoa.caneta);
    }).catch(() => setEu(null));
  }, []);

  useEffect(() => {
    if (!eu) return;
    const parar = ouvirAvisos(() => {
      window.clearTimeout(avisoTimer.current);
      avisoTimer.current = window.setTimeout(() => {
        api
          .eu()
          .then((pessoa) => {
            setEu(pessoa);
            aplicarCaneta(pessoa.caneta);
          })
          .catch((erro: Error) => {
            if (erro.message === "nao-autenticado") setEu(null);
          });
        setEpoca((n) => n + 1);
      }, 120);
    });
    return () => {
      window.clearTimeout(avisoTimer.current);
      parar();
    };
  }, [eu?.id]);

  useEffect(() => {
    if (!eu) return;
    api.mural().then(setMural).catch((erro: Error) => {
      if (erro.message === "nao-autenticado") setEu(null);
      else setAviso(erro.message);
    });
  }, [eu?.id, epoca]);

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
          <button type="button" aria-current={tela === "conta" ? "page" : undefined} onClick={() => setTela("conta")}>Conta</button>
          {eu.papel === "admin" && (
            <>
              <button type="button" aria-current={tela === "membros" ? "page" : undefined} onClick={() => setTela("membros")}>Membros</button>
              <button type="button" aria-current={tela === "categorias" ? "page" : undefined} onClick={() => setTela("categorias")}>Categorias</button>
              <button type="button" aria-current={tela === "cores" ? "page" : undefined} onClick={() => setTela("cores")}>Cores</button>
            </>
          )}
        </nav>
        {eu.papel === "programador" && (
          <SeletorDeCor
            eu={eu}
            epoca={epoca}
            aoEscolher={(pessoa) => {
              setEu(pessoa);
              api.mural().then(setMural).catch((erro: Error) => setAviso(erro.message));
            }}
            aoFalhar={(erro) => setAviso(erro.message)}
          />
        )}
        <button
          type="button"
          className="icone caneta"
          aria-label={eu.caneta === "azul" ? "Caneta azul" : "Caneta preta"}
          onClick={() => {
            const proxima: Caneta = eu.caneta === "azul" ? "preta" : "azul";
            api.caneta(proxima).then((pessoa) => { setEu(pessoa); aplicarCaneta(pessoa.caneta); });
          }}
        >
          <IconeCaneta />
        </button>
        <button
          type="button"
          className="icone"
          aria-label={tema === "escuro" ? "Tema escuro" : "Tema claro"}
          onClick={() => {
            const proximo = tema === "escuro" ? "claro" : "escuro";
            setTema(proximo);
            aplicarTema(proximo);
          }}
        >
          <IconeTema escuro={tema === "escuro"} />
        </button>
        <button type="button" className="icone" onClick={() => api.sair().then(() => setEu(null))}>Sair</button>
      </header>
      <main className="miolo" key={tela}>
        {aviso && <p className="aviso">{aviso}</p>}
        {tela === "mural" && mural && (
          <MuralTela mural={mural} eu={eu} aoMudar={setMural} aoAvisar={setAviso} />
        )}
        {tela === "historico" && <Historico eu={eu} epoca={epoca} />}
        {tela === "relatorios" && <Relatorios epoca={epoca} />}
        {tela === "conta" && <Conta eu={eu} aoAvisar={setAviso} />}
        {tela === "membros" && eu.papel === "admin" && <Membros epoca={epoca} />}
        {tela === "categorias" && eu.papel === "admin" && <Categorias epoca={epoca} />}
        {tela === "cores" && eu.papel === "admin" && <Cores epoca={epoca} />}
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
  const minhaCiencia = tarefa?.ciencias.find((ciencia) => ciencia.acionavel);
  const [aviso, setAviso] = useState("");
  const [escolhendo, setEscolhendo] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [rascunho, setRascunho] = useState("");
  const [idTrelloNovo, setIdTrelloNovo] = useState("");

  function falha(erro: Error) {
    setAviso(erro.message);
    aoAvisar("");
  }

  function alternarCiencia() {
    if (!tarefa || !minhaCiencia) return;
    const pedido = minhaCiencia.marcada ? api.desmarcar(tarefa.id) : api.marcar(tarefa.id);
    pedido.then(aoMudar).catch(falha);
  }

  return (
    <article
      className="folha post-it"
      style={{ ["--postit" as string]: card.programador.cor?.hex ?? "var(--papel)" }}
    >
      {tarefa && (
        <div
          className="progresso"
          aria-label={`${tarefa.x} de ${tarefa.y}`}
        >
          <span className="enchimento" style={{ width: `${tarefa.percentual}%` }} />
          <em>{tarefa.x}/{tarefa.y}</em>
          {tarefa.insignia && <i className="insignia" aria-label="Ciência completa" />}
        </div>
      )}
      <h2 className="nome">{card.programador.username}</h2>
      {tarefa ? (
        <>
          {minhaCiencia && (
            <button
              type="button"
              className="pinar"
              aria-pressed={minhaCiencia.marcada}
              aria-label={minhaCiencia.marcada ? "Desmarcar ciência" : "Marcar ciência"}
              onClick={alternarCiencia}
            >
              <Taxinha hex={minhaCiencia.cor?.hex ?? null} marcada={minhaCiencia.marcada} />
              {minhaCiencia.marcada ? "Despinar" : "Pinar"}
            </button>
          )}
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
                  aria-label={`${ciencia.marcada ? "Ciência marcada" : "Marcar ciência"} de ${ciencia.username}`}
                  disabled={!ciencia.acionavel}
                  onClick={ciencia.acionavel ? alternarCiencia : undefined}
                >
                  <Taxinha hex={ciencia.cor?.hex ?? null} marcada={ciencia.marcada} />
                  <span className="alfinete-nome">{ciencia.username.replaceAll(".", ".\u200B")}</span>
                </button>
              </li>
            ))}
          </ul>
          {tarefa.podeExcluir && (
            <button type="button" className="acao" onClick={() => api.guardar(tarefa.id).then(aoMudar).catch(falha)}>
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

function Historico({ eu, epoca }: { eu: Eu; epoca: number }) {
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [atalho, setAtalho] = useState("mes-atual");
  const [idTrello, setIdTrello] = useState("");
  const [programadorId, setProgramadorId] = useState("");
  const [ordem, setOrdem] = useState<"desc" | "asc">("desc");
  const [limite, setLimite] = useState(20);
  const [programadores, setProgramadores] = useState<{ id: string; username: string }[]>([]);
  const [itens, setItens] = useState<{ id: string; descricao: string; autor: string; autorId: string; idTrello: string | null; criadoEm: string; rotuloCategoria: string | null; x: number; y: number }[]>([]);
  const [total, setTotal] = useState(0);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    api.programadores().then(setProgramadores).catch((erro: Error) => setAviso(erro.message));
  }, [epoca]);

  useEffect(() => {
    api.periodo("mes-atual").then((p) => { setInicio(p.inicio); setFim(p.fim); });
  }, []);

  useEffect(() => {
    if (!inicio || !fim) return;
    const params = new URLSearchParams({ inicio, fim, ordem, limite: String(limite) });
    if (idTrello) params.set("idTrello", idTrello);
    if (programadorId) params.set("programadorId", programadorId);
    api.historico(params).then((r) => { setItens(r.itens); setTotal(r.total); }).catch((erro: Error) => setAviso(erro.message));
  }, [inicio, fim, idTrello, programadorId, ordem, limite, epoca]);

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
            <p className="meta">
              {new Date(item.criadoEm).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
              {" · "}{item.idTrello ?? "sem id"} · {item.rotuloCategoria ?? "sem categoria"} · {item.x}/{item.y}
            </p>
            {(eu.papel === "admin" || eu.id === item.autorId) && (
              <button type="button" className="acao" onClick={() => api.excluir(item.id).then(() => setItens((lista) => lista.filter((i) => i.id !== item.id)))}>
                Excluir
              </button>
            )}
          </li>
        ))}
      </ul>
      {itens.length === 0 && <p className="meta">Nenhum papel guardado nesse recorte.</p>}
      {itens.length < total && (
        <button type="button" className="acao" onClick={() => setLimite((n) => n + 20)}>
          Mostrar mais
        </button>
      )}
      <p className="aviso">{aviso}</p>
    </section>
  );
}

function Relatorios({ epoca }: { epoca: number }) {
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
  }, [inicio, fim, modo, epoca]);

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

function Conta({ eu, aoAvisar }: { eu: Eu; aoAvisar: (texto: string) => void }) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [aviso, setAviso] = useState("");
  const [ok, setOk] = useState("");

  return (
    <section className="folha painel">
      <h1 className="nome">Conta</h1>
      <p className="rotulo">Conectado como {eu.username}</p>
      <form
        className="filtros"
        onSubmit={(evento) => {
          evento.preventDefault();
          setOk("");
          if (senhaNova !== confirmacao) {
            setAviso("A confirmação não bate com a nova senha.");
            aoAvisar("");
            return;
          }
          api
            .alterarSenha(senhaAtual, senhaNova)
            .then(() => {
              setSenhaAtual("");
              setSenhaNova("");
              setConfirmacao("");
              setAviso("");
              setOk("Senha alterada.");
              aoAvisar("");
            })
            .catch((erro: Error) => {
              setOk("");
              setAviso(erro.message);
              aoAvisar("");
            });
        }}
      >
        <label className="campo">
          <span>Senha atual</span>
          <input
            className="linha"
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <label className="campo">
          <span>Nova senha</span>
          <input
            className="linha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={senhaNova}
            onChange={(e) => setSenhaNova(e.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
          />
        </label>
        <label className="campo">
          <span>Confirmar nova senha</span>
          <input
            className="linha"
            type="password"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
          />
        </label>
        <button className="acao" type="submit">Alterar senha</button>
      </form>
      {ok && <p className="rotulo">{ok}</p>}
      <p className="aviso">{aviso}</p>
    </section>
  );
}

type Membro = { id: string; username: string; papel: Papel; ativo: boolean };

function rotuloPapel(papel: Papel) {
  return papel === "admin" ? "Admin" : "Programador";
}

function Membros({ epoca }: { epoca: number }) {
  const [lista, setLista] = useState<Membro[] | null>(null);
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [papel, setPapel] = useState<Papel>("programador");
  const [aviso, setAviso] = useState("");
  const [ok, setOk] = useState("");
  const [redefinirId, setRedefinirId] = useState<string | null>(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [ocupado, setOcupado] = useState<null | "cadastro" | "senha" | "ativo">(null);
  const campoNovaSenha = useRef<HTMLInputElement>(null);

  function carregar() {
    return api.membros().then(setLista).catch((erro: Error) => {
      setAviso(erro.message);
      setLista((atual) => atual ?? []);
    });
  }
  useEffect(() => { carregar(); }, [epoca]);

  useEffect(() => {
    if (redefinirId) campoNovaSenha.current?.focus();
  }, [redefinirId]);

  function falhou(erro: Error) {
    setOk("");
    setAviso(erro.message);
    setOcupado(null);
  }

  return (
    <section className="folha painel elenco" aria-busy={Boolean(ocupado)}>
      <h1 className="nome">Membros</h1>
      <div className="status-elenco" aria-live="polite">
        {ok ? <p className="rotulo">{ok}</p> : null}
        {aviso ? <p className="aviso">{aviso}</p> : null}
      </div>

      <form
        className="cadastro"
        onSubmit={(evento) => {
          evento.preventDefault();
          setAviso("");
          setOk("");
          setOcupado("cadastro");
          api.criarMembro({ username, senha, papel }).then(() => {
            setUsername("");
            setSenha("");
            setPapel("programador");
            setOcupado(null);
            setOk("Membro registrado.");
            carregar();
          }).catch(falhou);
        }}
      >
        <h2 className="secao">Registrar</h2>
        <div className="grade-cadastro">
          <label className="campo">
            <span>Nome de usuário</span>
            <input
              className="linha"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              required
            />
          </label>
          <label className="campo">
            <span>Senha</span>
            <input
              className="linha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
            />
          </label>
          <label className="campo campo-papel">
            <span>Papel</span>
            <select
              className="linha escolha"
              value={papel}
              onChange={(e) => setPapel(e.target.value as Papel)}
            >
              <option value="programador">Programador</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <div className="acoes-cadastro">
            <button className="botao" type="submit" disabled={Boolean(ocupado)}>
              {ocupado === "cadastro" ? "Registrando…" : "Registrar"}
            </button>
          </div>
        </div>
      </form>

      <div className="time">
        <h2 className="secao">Time</h2>
        {lista === null ? (
          <p className="rotulo">Abrindo o time…</p>
        ) : lista.length === 0 ? (
          <p className="rotulo">Ninguém no time ainda.</p>
        ) : (
          <ul className="elenco-time">
            {lista.map((membro) => {
              const redefinindo = redefinirId === membro.id;
              return (
                <li key={membro.id} className={membro.ativo ? "membro" : "membro membro-parado"}>
                  <div className="membro-topo">
                    <h3 className="identidade">{membro.username}</h3>
                    <div className="acoes-membro">
                      <button
                        type="button"
                        className="botao"
                        disabled={Boolean(ocupado)}
                        onClick={() => {
                          const ativo = !membro.ativo;
                          setAviso("");
                          setOk("");
                          setOcupado("ativo");
                          api.editarMembro(membro.id, { ativo }).then(() => {
                            setOcupado(null);
                            setOk(ativo ? `${membro.username} reativado.` : `${membro.username} desativado.`);
                            carregar();
                          }).catch(falhou);
                        }}
                      >
                        {membro.ativo ? "Desativar" : "Reativar"}
                      </button>
                      <button
                        type="button"
                        className="botao"
                        disabled={Boolean(ocupado)}
                        aria-expanded={redefinindo}
                        aria-controls={redefinindo ? `redefinir-${membro.id}` : undefined}
                        onClick={() => {
                          if (redefinindo) {
                            setRedefinirId(null);
                            setNovaSenha("");
                            return;
                          }
                          setAviso("");
                          setRedefinirId(membro.id);
                          setNovaSenha("");
                        }}
                      >
                        {redefinindo ? "Cancelar" : "Redefinir senha"}
                      </button>
                    </div>
                  </div>
                  <dl className="ficha">
                    <div>
                      <dt>Papel</dt>
                      <dd>{rotuloPapel(membro.papel)}</dd>
                    </div>
                    <div>
                      <dt>Situação</dt>
                      <dd>{membro.ativo ? "Ativo" : "Desativado"}</dd>
                    </div>
                  </dl>
                  {redefinindo && (
                    <form
                      id={`redefinir-${membro.id}`}
                      className="redefinir"
                      onSubmit={(evento) => {
                        evento.preventDefault();
                        if (novaSenha.length < 6) {
                          setOk("");
                          setAviso("A nova senha precisa ter no mínimo 6 caracteres.");
                          return;
                        }
                        setAviso("");
                        setOk("");
                        setOcupado("senha");
                        api.editarMembro(membro.id, { senha: novaSenha }).then(() => {
                          setNovaSenha("");
                          setRedefinirId(null);
                          setOcupado(null);
                          setOk(`Senha de ${membro.username} redefinida.`);
                          carregar();
                        }).catch(falhou);
                      }}
                    >
                      <label className="campo">
                        <span>Nova senha de {membro.username}</span>
                        <input
                          ref={campoNovaSenha}
                          className="linha"
                          type="password"
                          value={novaSenha}
                          onChange={(e) => setNovaSenha(e.target.value)}
                          autoComplete="new-password"
                          required
                          minLength={6}
                          placeholder="Mínimo 6 caracteres"
                        />
                      </label>
                      <button className="botao" type="submit" disabled={Boolean(ocupado)}>
                        {ocupado === "senha" ? "Gravando…" : "Gravar senha"}
                      </button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

function Categorias({ epoca }: { epoca: number }) {
  const [lista, setLista] = useState<Categoria[]>([]);
  const [nome, setNome] = useState("");
  const [aviso, setAviso] = useState("");
  function carregar() {
    api.categorias().then(setLista).catch((erro: Error) => setAviso(erro.message));
  }
  useEffect(carregar, [epoca]);
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

function IconeCaneta() {
  return (
    <svg className="icone-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.06-8.06.92.92L5.92 19.58zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
      />
    </svg>
  );
}

function IconeTema({ escuro }: { escuro: boolean }) {
  if (escuro) {
    return (
      <svg className="icone-svg" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z" />
      </svg>
    );
  }
  return (
    <svg className="icone-svg" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" />
      </g>
    </svg>
  );
}

function Taxinha({ hex, marcada }: { hex: string | null; marcada: boolean }) {
  return (
    <span
      className={`taxinha ${marcada ? "taxinha-presa" : ""}`}
      style={{ color: hex ?? "currentColor" }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: pinSvg }}
    />
  );
}

function SeletorDeCor({
  eu,
  epoca,
  aoEscolher,
  aoFalhar,
}: {
  eu: Eu;
  epoca: number;
  aoEscolher: (eu: Eu) => void;
  aoFalhar: (erro: Error) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [cores, setCores] = useState<(Cor & { ocupadaPor: string | null })[]>([]);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    api.cores().then(setCores).catch(aoFalhar);
    function fechar(evento: MouseEvent) {
      if (!caixa.current?.contains(evento.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, [aberto, epoca, aoFalhar]);

  const livres = cores.filter((item) => !item.ocupadaPor || item.ocupadaPor === eu.username);

  return (
    <div className="seletor-cor" ref={caixa}>
      <button
        type="button"
        className="icone"
        aria-label={eu.cor ? `Cor do card: ${eu.cor.nome}` : "Escolher cor do card"}
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
      >
        <i className="minicard" style={{ ["--postit" as string]: eu.cor?.hex ?? "var(--papel)" }} />
      </button>
      {aberto && (
        <div className="popup-cor" role="dialog" aria-label="Cores disponíveis">
          {livres.length === 0 && <p className="meta">Nenhuma cor livre</p>}
          {livres.map((item) => (
            <button
              key={item.id}
              type="button"
              className="opcao-cor"
              aria-pressed={eu.cor?.id === item.id}
              onClick={() => {
                api.escolherCor(item.id).then((pessoa) => {
                  aoEscolher(pessoa);
                  setAberto(false);
                }).catch(aoFalhar);
              }}
            >
              <i className="minicard" style={{ ["--postit" as string]: item.hex }} />
              {item.nome}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Cores({ epoca }: { epoca: number }) {
  const [lista, setLista] = useState<(Cor & { ocupadaPor: string | null })[]>([]);
  const [nome, setNome] = useState("");
  const [hex, setHex] = useState("#5c7c99");
  const [aviso, setAviso] = useState("");
  function carregar() {
    api.cores().then(setLista).catch((erro: Error) => setAviso(erro.message));
  }
  useEffect(carregar, [epoca]);
  return (
    <section className="folha painel">
      <h1 className="nome">Cores</h1>
      <form className="filtros" onSubmit={(e) => {
        e.preventDefault();
        api.criarCor(nome, hex).then(() => { setNome(""); carregar(); }).catch((erro: Error) => setAviso(erro.message));
      }}>
        <input className="linha" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da cor" />
        <input className="linha campo-cor" type="color" value={hex} aria-label="Hex da cor" onChange={(e) => setHex(e.target.value)} />
        <button className="acao" type="submit">Cadastrar</button>
      </form>
      <ul>
        {lista.map((item) => (
          <li key={item.id}>
            <i className="amostra-fixa" style={{ background: item.hex }} />
            {item.nome}
            {item.ocupadaPor ? ` · ${item.ocupadaPor}` : ""}
            <button type="button" className="acao" onClick={() => api.excluirCor(item.id).then(setLista)}>Excluir</button>
          </li>
        ))}
      </ul>
      <p className="aviso">{aviso}</p>
    </section>
  );
}
