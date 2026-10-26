# Documentação AutoDaily

Este arquivo é o **índice canônico** da documentação do repositório. Qualquer trabalho no repositório começa por aqui.

SDD aqui é Specification-Driven Development: a especificação descreve o comportamento antes do código. Código futuro só implementa spec fechada. Se código e spec divergirem, a spec manda até ser revista.

## Fase atual

- **Especificação (SDD):** **fechada** em **2026-09-25** para a implementação TypeScript (React, Hono, Drizzle).
- **Implementação:** a árvore **Django/HTMX** ainda presente no repositório **não** é o alvo e **não** deve ser estendida. A próxima implementação segue a spec vigente.

## Como usar

1. Ler este índice.
2. Ler [`docs/00-constituicao/principios.md`](00-constituicao/principios.md).
3. Ler o documento do assunto.
4. Consultar [`docs/06-abertos/questoes-em-aberto.md`](06-abertos/questoes-em-aberto.md) antes de tratar um ponto como decidido.
5. Spec nova entra em `docs/02-especificacoes/`, é ligada neste índice e nasce como **rascunho**.
6. Decisão fechada que muda rumo entra no **registro** deste índice e nas specs apontadas; **não** criar pasta de ADR nesta rodada.
7. Não implementar a partir de questão em aberto.

## Tabela de documentos

| Caminho | Papel | Status |
| --- | --- | --- |
| [`docs/00-constituicao/principios.md`](00-constituicao/principios.md) | Princípios que filtram escopo | vigente |
| [`docs/01-visao/visao-do-produto.md`](01-visao/visao-do-produto.md) | Para que o sistema existe | fechada |
| [`docs/02-especificacoes/01-mural-e-tarefa-atual.md`](02-especificacoes/01-mural-e-tarefa-atual.md) | Mural e tarefa atual | fechada |
| [`docs/02-especificacoes/02-ciencia-e-progresso.md`](02-especificacoes/02-ciencia-e-progresso.md) | Ciência e progresso | fechada |
| [`docs/02-especificacoes/03-historico.md`](02-especificacoes/03-historico.md) | Histórico | fechada |
| [`docs/02-especificacoes/04-relatorios.md`](02-especificacoes/04-relatorios.md) | Relatórios | fechada |
| [`docs/02-especificacoes/05-membros-e-acesso.md`](02-especificacoes/05-membros-e-acesso.md) | Membros e acesso | fechada |
| [`docs/02-especificacoes/06-categorias.md`](02-especificacoes/06-categorias.md) | Categorias | fechada |
| [`docs/02-especificacoes/07-cores.md`](02-especificacoes/07-cores.md) | Cores do post-it | fechada |
| [`docs/02-especificacoes/08-tempo-real.md`](02-especificacoes/08-tempo-real.md) | Tempo real nas telas abertas | fechada |
| [`docs/03-experiencia/linguagem-visual.md`](03-experiencia/linguagem-visual.md) | Linguagem visual | fechada |
| [`docs/04-arquitetura/restricoes-tecnicas.md`](04-arquitetura/restricoes-tecnicas.md) | Restrições técnicas | fechada |
| [`docs/04-arquitetura/frontend-react-e-impeccable.md`](04-arquitetura/frontend-react-e-impeccable.md) | Frontend React e skill Impeccable | vigente |
| [`docs/04-arquitetura/orquestracao-da-implementacao.md`](04-arquitetura/orquestracao-da-implementacao.md) | Orquestração Grok / Composer | vigente |
| [`docs/04-arquitetura/frontend-estilos-e-tailwind.md`](04-arquitetura/frontend-estilos-e-tailwind.md) | Revogado; ver frontend React | revogado |
| [`docs/05-dominio/glossario-e-modelo.md`](05-dominio/glossario-e-modelo.md) | Glossário e modelo conceitual | fechada |
| [`docs/06-abertos/questoes-em-aberto.md`](06-abertos/questoes-em-aberto.md) | Questões em aberto | vigente |
| [`docs/07-skill-impeccable/README.md`](07-skill-impeccable/README.md) | Catálogo da skill Impeccable | vigente |
| `docs/README.md` | Índice canônico | vigente |

## Convenções de ID

| Prefixo | Significado |
| --- | --- |
| RF | Requisito funcional |
| RNF | Requisito não funcional |
| RV | Requisito visual |
| RA | Restrição de arquitetura |
| QA | Questão em aberto |

**Status de spec:** `rascunho` | `em revisão` | `fechada`

**Idioma da documentação:** pt-BR

A spec descreve comportamento observável. Nome de classe e arquivo só aparece na seção de arquitetura, como restrição pedida, não como código.

## Registro

- **2026-09-24** — abertura. Primeira leva: mural da tarefa atual, ciência e progresso, histórico, relatórios, membros e acesso, linguagem visual, restrições técnicas. Nada implementado.
- **2026-09-24** — segunda leva: papéis do admin, edição no lugar, desmarcar ciência, card em branco, retorno da última tarefa ao excluir a atual, categorias, x/y na barra, caneta por usuário, jornal nos dois temas, fuso America/Sao_Paulo. Implementação continua bloqueada. A regra de “mostrar a última tarefa” ao excluir a atual foi substituída na terceira leva.
- **2026-09-24** — revisão para o plano: senha com no mínimo 6 caracteres; histórico com seletor de atalho que preenche as datas e rótulo Personalizado quando o intervalo é digitado; relatório pela data de publicação; categoria no completo só exibida; time real com os dois donos programando; programador desativado não entra no programa. Implementação continua bloqueada.
- **2026-09-24** — terceira leva: filtros fechados do histórico (id do Trello, programador, data, intervalo com atalhos; padrão mês atual), ordenação separada (padrão mais recente primeiro), paginação (20 por página, expansível), exclusão definitiva de tarefa, relatórios simples e completo, membros (createsuperuser, desativar sem excluir, senha, gestão na tela do produto), tema claro como padrão com preferência só no navegador, model Usuario próprio, SQLite agora e PostgreSQL depois, código de domínio em português, correção da exclusão da tarefa atual (card em branco; anterior só por ação explícita). Implementação continua bloqueada.
- **2026-09-24** — início da implementação pelo plano em passos.
- **2026-09-24** — documentação de frontend: CSS no template base, `STATIC_ROOT`, e guia para compilar Tailwind quando adotar build local ([frontend-estilos-e-tailwind.md](04-arquitetura/frontend-estilos-e-tailwind.md)).
- **2026-09-25** — nova leva: TypeScript e React; servidor Hono; Drizzle; SQLite em arquivo local e PostgreSQL depois; papel cinza neutro com fibra, sem amarelo de editorial; transições suaves em tudo; edição só ao clicar no texto, mesma fonte, gravação ao vivo; frontend pela skill Impeccable; implementação pelo Grok 4.7 extra high (contexto 500 mil tokens), com Composer 2.5 só para iterar arquivos e código. A implementação Django fica rejeitada.
- **2026-09-25** — specs de comportamento promovidas a fechada, sem mudança de regra, para a implementação TypeScript.
- **2026-09-25** — cores de post-it: catálogo do admin, escolha exclusiva do programador, taxinha da cor de quem marcou, barra 30% mais clara e 30% mais escura que o card, ícone de caneta e sol/lua, canto inferior direito dobrado.
- **2026-09-25** — tirar da parede guarda o papel no histórico; exclusão definitiva continua só no histórico. “Mostrar mais” amplia a página sem sair dos filtros já escolhidos.
- **2026-10-26** — tempo real: mural, histórico, relatórios, membros, categorias e cores acompanham o que o time gravou, sem recarga completa da página. Edição no lugar não perde o texto em foco.
- **2026-10-26** — no card alheio, Pinar/Despinar logo abaixo do nome de quem publicou, além da taxinha no próprio nome da lista.
- **2026-10-26** — taxinhas da ciência em pelo menos duas por linha no card, com o nome ainda visível.
