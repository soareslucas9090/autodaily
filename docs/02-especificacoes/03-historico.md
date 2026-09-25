---
id: ESP-03
status: fechada
atualizado: 2026-09-24
---

# Histórico

## RF-010 Consulta

Há um menu pelo qual usuários autenticados verificam as tarefas anteriores. **Admin** também consulta o histórico; sem isso não consegue excluir tarefa alheia conforme ESP-05.

A visão principal não é essa tela.

## RF-011 Filtros

Lista **fechada** de filtros na tela de histórico:

- id do Trello
- programador
- período, em dois campos de data (início e fim)

Não há filtro de categoria nem um filtro de data solto além desses dois campos.

O período é escolhido por um **seletor de atalho** que preenche os dois campos. Opções do seletor:

- Mês atual
- Mês passado
- Semana passada

Ao escolher um atalho, início e fim são preenchidos com esse recorte no fuso **America/Sao_Paulo**. Se o usuário alterar um dos campos de data à mão, o seletor passa a mostrar **Personalizado**. "Personalizado" não é um atalho: indica que o intervalo foi digitado. Não usar "Nenhum" nem "------", porque as datas continuam valendo.

Recortes usam o fuso **America/Sao_Paulo**. Não é preferência de usuário.

**Estado padrão ao abrir o histórico:**

- id do Trello vazio
- programador vazio (todos os programadores)
- seletor em **Mês atual**, com início e fim preenchidos com o mês atual

## RF-011b Ordenação

Ordenação é **separada** do filtro: por data, crescente ou decrescente.

**Padrão:** mais recente primeiro (decrescente).

## RF-011c Paginação

**Padrão:** 20 itens por página.

A página é **expansível**: o usuário pode ampliar a quantidade de itens por página. Não há lista fixa de tamanhos alternativos nesta spec. Ampliar (“mostrar mais”) continua aplicando os filtros já escolhidos (id do Trello, programador, período e ordem). O controle só aparece enquanto ainda houver itens do recorte além dos já listados. Recorte vazio mostra que não há papel guardado naquele filtro, sem fingir que há mais páginas.

## RF-012 Exclusão

O programador dono da tarefa pode excluir qualquer tarefa do **seu** histórico. O admin pode excluir tarefa de **qualquer** programador (atual ou guardada).

**Regra derivada:** programador não exclui tarefa alheia.

**Exclusão definitiva:** a tarefa é excluída de verdade. Some do histórico e não entra em relatório. Não é desativação. Não volta.

Exclusão da tarefa atual e efeito no mural: ver RF-018 em ESP-01.

## Critérios de aceite

- **Dado** o usuário abre a tela de histórico, **quando** a tela carrega sem alterar filtros, **então** id do Trello está vazio, programador está vazio (todos), o seletor está em Mês atual, os campos de data mostram esse mês em America/Sao_Paulo, a ordenação é por data decrescente e a página tem 20 itens.
- **Dado** o seletor em Mês atual, **quando** o usuário altera o início ou o fim à mão, **então** o seletor passa a mostrar Personalizado e a busca usa as datas digitadas.
- **Dado** tarefas arquivadas com ids de Trello distintos, **quando** aplica filtro por id do Trello, **então** vê somente as tarefas que correspondem a esse id.
- **Dado** tarefas de vários programadores, **quando** aplica filtro por um programador, **então** vê somente as tarefas desse programador no recorte.
- **Dado** tarefas em datas distintas, **quando** escolhe o atalho “Semana passada”, **então** os campos de data são preenchidos com esse recorte em **America/Sao_Paulo** e o resultado respeita essas datas.
- **Dado** tarefas em datas distintas, **quando** escolhe o atalho “Mês passado”, **então** os campos de data são preenchidos com esse mês em **America/Sao_Paulo** e o resultado respeita esse recorte.
- **Dado** uma tarefa arquivada de outro programador, **quando** o programador logado não é o dono nem admin tenta excluir, **então** não consegue.
- **Dado** uma tarefa arquivada do próprio programador, **quando** o dono exclui, **então** a tarefa deixa de aparecer no histórico e nos relatórios.
- **Dado** admin autenticado, **quando** exclui tarefa de outro programador no histórico, **então** a tarefa deixa de aparecer no histórico e nos relatórios.
