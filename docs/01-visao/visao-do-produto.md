---
id: VIS
status: fechada
atualizado: 2026-09-25
fonte: conversa inicial
---

# Visão do produto

O AutoDaily apresenta, de forma simples e direta, a tarefa em que o programador está **agora**.

## Fluxo humano (metáfora normativa)

O programador entende a tarefa, escreve uma descrição breve que une negócio e código, e publica na plataforma. Isso corresponde a tirar o papel anterior da parede e colar outro, com a escrita dele. Os outros programadores se aproximam e marcam com um alfinete que leram. A parede mostra só os papéis atuais. Os papéis retirados ficam no arquivo, consultável por um menu.

Para corrigir o papel atual, o dono **clica no trecho** que quer mudar (descrição, id do Trello ou categoria); o resto do tempo o card fica em **leitura**, como papel na parede, sem formulário aberto.

## Histórias

- Como programador, quero publicar o que estou fazendo agora, para o time ver num relance.
- Como programador, quero editar o meu card no lugar — clicando no texto que preciso corrigir — para ajustar descrição, id do Trello ou categorias sem publicar outro papel.
- Como outro programador, quero marcar que tomei ciência, para o autor saber quem leu.
- Como outro programador, quero desmarcar a minha ciência, se marquei por engano.
- Como programador, quero consultar tarefas anteriores, para achar o que já foi publicado.
- Como programador dono, quero excluir uma tarefa do meu histórico, inclusive a atual; se excluir a atual, quero o card em branco no mural e, se ainda existir tarefa guardada minha, quero uma opção para retornar a mais recente — sem repor o card sozinho.
- Como admin, quero registrar um novo membro e desativar ou reativar membro pela edição, sem excluir membro do sistema.
- Como admin, quero cadastrar e excluir categorias.
- Como admin, quero excluir tarefa de qualquer programador, sem ter card nem marcar ciência no mural.
- Como usuário autenticado (admin ou programador), quero emitir relatório simples e relatório completo sobre o recorte de datas que escolher.

## Fora de escopo (até spec dizer o contrário)

Não-objetivos explícitos nesta rodada:

- Sincronizar com a API do Trello. O id do Trello é um identificador informado na publicação, não uma integração.
- Comentários, chat, notificações, e-mail.
- Atribuir a tarefa de uma pessoa para outra. Cada um publica a própria.
- Aplicativo nativo.

A interface alvo é **React**; o servidor alvo é **Hono** em TypeScript, no mesmo repositório (ver arquitetura em `docs/04-arquitetura/`).
