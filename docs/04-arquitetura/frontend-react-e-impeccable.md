---
id: ARQ-02
status: vigente
atualizado: 2026-10-26
---

# Frontend React e Impeccable

Regras da interface alvo. Complementa [restricoes-tecnicas.md](restricoes-tecnicas.md) (RA-002) e [linguagem-visual.md](../03-experiencia/linguagem-visual.md). Não há tutorial de instalação da skill aqui; o catálogo e o modo de usar cada comando estão em [`docs/07-skill-impeccable/README.md`](../07-skill-impeccable/README.md).

## Obrigação de skill

Toda implementação de interface usa a skill **Impeccable**, invocada com `/impeccable`.

Antes de escrever interface, ler o README da skill e a linguagem visual. **A linguagem visual vence a skill** quando houver conflito — em especial **cinza neutro** contra a orientação genérica da skill de “sempre tingir” (tingimento quente ou amarelo continua proibido pela spec).

A interface só se dá por pronta depois de **`audit`** e **`polish`** na superfície alterada.

## Mapa situação → comando

| Situação | Comando Impeccable |
| --- | --- |
| Forma de uma tela nova | `shape`, depois `craft` |
| Cor do papel | `colorize` |
| Tipografia | `typeset` |
| Espaço e ritmo | `layout` |
| Transições | `animate` |
| Tom alto demais | `quieter` |
| Tela sem vida, dentro do que a linguagem visual permite | `bolder` só se não virar site de jornal antigo nem SaaS |
| Estados vazios (card em branco) | `onboard` |
| Erro e texto que estoura | `harden` |
| Copy pouco clara | `clarify` |
| Tela estreita | `adapt` |
| Revisão | `critique`, `audit`, `polish` |
| Iteração visual no navegador | `live` |

## React e API

A interface React consome a API **Hono** no mesmo repositório. Interações do mural (ciência, publicar, edição ao vivo) atualizam região afetada com transição contínua, conforme linguagem visual e RA-004 — não recarga brusca da página inteira.

Sessões abertas escutam o aviso de tempo real da API (**RA-010**, **RF-026**). A tela visível (e o mural já carregado) reflete o estado novo sem recarregar o documento. Campo em foco na edição ao vivo não é substituído enquanto a pessoa digita.

## Edição do card (referência cruzada)

Comportamento de produto detalhado em ESP-01 (**RF-017**). Na interface: visualização padrão em leitura; edição só ao clicar na região; mesma fonte, tamanho e cor ao digitar; sem caixa branca de formulário; gravação ao vivo sem botão salvar. Detalhe visual complementar: **RV-012** em [linguagem-visual.md](../03-experiencia/linguagem-visual.md).
