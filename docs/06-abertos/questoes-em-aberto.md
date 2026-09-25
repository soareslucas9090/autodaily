---
id: QA-INDEX
status: vigente
atualizado: 2026-09-25
---

# Questões em aberto

Nada nesta lista é requisito. Uma resposta futura promove o item a regra numa spec e remove o item daqui.

## Resolvidas em 2026-09-24

- **QA-001** — Face do card: primeira categoria em ordem alfabética; "Nome e mais..." se houver mais; só admin cadastra e exclui; excluir tira vínculo do card.
- **QA-002** — Só texto obrigatório na publicação; id Trello e categorias opcionais; descrição vazia não passa.
- **QA-003** — Editar tarefa atual no lugar, sem arquivar por edição.
- **QA-004** — Dono (e admin) pode excluir a atual; na segunda leva o card mostrava a última restante automaticamente; na terceira leva o card fica em branco e a anterior só volta por ação explícita.
- **QA-005** — Programador sem tarefa mantém card em branco no mural.
- **QA-006** — Atual usa time de agora no denominador; guardada congela ciência e denominador ao sair da parede; admin e autor fora do denominador.
- **QA-007** — Ciência pode ser desmarcada pelo próprio programador.
- **QA-008** — Barra: preenchimento percentual normativo; texto interno x/y.
- **QA-009** — Marcações de ciência no card em ordem alfabética do nome do programador.
- **QA-010** — Admin não tem card e não entra na ciência.
- **QA-011** — Filtros fechados do histórico: id do Trello, programador e período (início e fim). Seletor: Mês atual, Mês passado, Semana passada. Ao personalizar as datas, o seletor mostra Personalizado.
- **QA-012** — Fuso do produto: America/Sao_Paulo em recortes de data.
- **QA-013** — Tarefa excluída some do histórico e dos relatórios; exclusão definitiva, não desativação.
- **QA-014** — Histórico: 20 itens por página por padrão, página expansível; ordenação por data, padrão mais recente primeiro.
- **QA-015** — Relatório completo pela data de publicação: quebra por id do Trello, duração, média e ciência. Categoria só é exibida, sem recorte.
- **QA-016** — Relatório simples com quantidades quebradas por programador e por dia, pela data de publicação; cada publicação conta como tarefa.
- **QA-017** — Qualquer usuário autenticado emite relatório.
- **QA-018** — Primeiro admin por **comando de linha do produto**; demais membros pela tela do produto.
- **QA-019** — Admin edita membro; desativa e reativa; sem exclusão de membro. Desativado não entra no programa.
- **QA-020** — Senha com no mínimo 6 caracteres, de qualquer tipo; sem recuperação; admin redefine senha de qualquer um.
- **QA-021** — Cadastro e gestão de membros na tela do produto; comando de linha do produto só para o primeiro admin.
- **QA-022** — Tema padrão claro; preferência de tema só no navegador; caneta continua por usuário.
- **QA-023** — Dois temas de **papel cinza neutro**; escuro confortável, **não** preto puro nem amarelado.
- **QA-024** — Caneta azul ou preta por usuário; controle na barra superior ao lado do tema.
- **QA-025** — Insígnia continua o sinal sóbrio no canto superior direito quando x = y; sem símbolo adicional.
- **QA-026** — Models básicos: somente data de criação e data de atualização.
- **QA-027** — **Usuario** conta própria do produto; não usuário genérico de framework.
- **QA-028** — **SQLite** em arquivo local agora; **PostgreSQL** depois; o **mesmo schema** serve aos dois (Drizzle).
- **QA-029** — Ao excluir a atual, o card fica em branco; a tarefa anterior só volta se o programador pedir. Ao voltar, o time é o de agora e permanecem as ciências de quem ainda está ativo.

## Resolvidas em 2026-09-25

- **QA-030** — TypeScript no produto; interface React; servidor Hono; persistência Drizzle; SQLite em arquivo local agora e PostgreSQL depois.
- **QA-031** — Papel cinza neutro com fibra de papel; proibido amarelo, marfim, sépia e visual de site de jornal antigo.
- **QA-032** — Transição suave em todo o sistema; nada brusco nem instantâneo.
- **QA-033** — Card em leitura; edição só ao clicar na região; cursor no texto; mesma fonte; sem caixa branca; gravação ao vivo sem botão salvar.
- **QA-034** — Interface inteira pela skill Impeccable; catálogo em `docs/07-skill-impeccable/README.md`; linguagem visual vence conflito com a skill.
- **QA-035** — Implementação pelo Grok 4.7 extra high com contexto de 500 mil tokens; Composer 2.5 só para iterar arquivos e código.
- **QA-036** — Cor de post-it cadastrada pelo admin e escolhida pelo programador, exclusiva entre ativos; taxinha com a cor de quem marcou; barra derivada da cor do card.

## Perguntas abertas

Não há questão em aberto nesta rodada.

A próxima especificação deve acrescentar arquivo novo em `docs/02-especificacoes/` e atualizar `docs/README.md`, ou reabrir um item daqui se a regra mudar.
