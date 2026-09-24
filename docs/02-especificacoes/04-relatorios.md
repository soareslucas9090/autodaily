---
id: ESP-04
status: rascunho
atualizado: 2026-09-24
---

# Relatórios

Qualquer usuário **autenticado** emite relatório (admin e programador).

Relatórios usam recorte de data no fuso **America/Sao_Paulo**. A tarefa entra no recorte pela **data em que foi publicada** (criação), não pelo tempo em que ficou na parede. Tarefa **excluída** não conta: não existe mais no produto.

Cada **publicação** conta como uma tarefa, mesmo repetindo o mesmo id do Trello.

## RF-013 Relatório simples

O modo **simples** mostra **quantidades quebradas**, não um único número total isolado.

**Quebras obrigatórias** (dentro do filtro de data):

- por programador
- por dia

## RF-014 Relatório completo

O modo **completo** foi definido a partir da **análise dos dados que o sistema já tem** (não de pedido solto de métrica). Além do que o simples mostra, inclui:

- quantidade quebrada por **id do Trello**
- por id do Trello: quantas tarefas usam aquele id e quantos programadores distintos publicaram com ele
- a categoria de cada tarefa **apenas exibida**, sem quebra nem contagem por categoria
- **duração** de cada tarefa do recorte
- **tempo médio** dessas durações
- **ciência** das tarefas do recorte: nas guardadas, o x/y congelado; nas que estão na parede, o x/y do time de agora; quantas do recorte fecharam ciência (x = y)

Não há pódio nem ranking de pessoas.

### Duração de tarefa (regra do relatório)

A duração começa na **criação** da tarefa e termina quando ela **sai da parede**. Se ainda está no mural, o fim é o instante da consulta. Editar o card não reinicia a duração. A data de atualização não serve como fim, porque edição também atualiza. Por isso a tarefa guardada precisa lembrar o momento em que saiu da parede (regra de produto para o relatório; não é schema SQL nesta spec).

### Dados disponíveis para os relatórios

Texto da tarefa, id do Trello (várias tarefas podem repetir o mesmo id), categorias opcionais, autor, data de criação, data de atualização, se está na parede ou guardada, ciências (quem marcou), programador ativo ou desativado, fuso America/Sao_Paulo. Tarefa excluída não existe mais.

## Critérios de aceite

- **Dado** usuário autenticado (admin ou programador), **quando** abre relatórios, **então** consegue emitir modo simples e completo.
- **Dado** um período com várias publicações, **quando** emite relatório simples, **então** vê quantidades quebradas por programador e por dia no recorte.
- **Dado** tarefa excluída que existia no período, **quando** emite qualquer relatório, **então** essa tarefa não entra nas contagens.
- **Dado** o mesmo id do Trello em duas publicações distintas no recorte, **quando** emite relatório simples, **então** cada publicação conta como uma tarefa.
- **Dado** um recorte com tarefas guardadas e na parede, **quando** emite relatório completo, **então** vê quebra por id do Trello, a categoria só como informação de cada tarefa, duração por tarefa, tempo médio das durações e leitura de ciência conforme guardada versus parede, sem ranking de pessoas e sem contagem por categoria.
- **Dado** uma tarefa publicada fora do período e ainda na parede dentro dele, **quando** emite o relatório, **então** ela não entra, porque o recorte é a data de publicação.
