---
id: CONST
status: vigente
atualizado: 2026-09-24
---

# Princípios

Princípios curtos que filtram escopo. Cada um declara o que **proíbe**.

## 1. Agora na visão principal

A visão principal mostra somente o que está acontecendo **agora**. Histórico não compete com o mural. Todo programador tem card no mural; sem tarefa, o card fica em branco. O lugar não some.

**Proíbe:** misturar tarefas arquivadas na mesma tela que o mural atual; tratar histórico como paridade visual com o “agora”; remover do mural o card de programador sem tarefa atual.

## 2. Um papel por publicação

Cada programação publicada é um papel na parede. Publicar outro desarma o anterior e guarda o papel inteiro.

**Proíbe:** descartar dados do papel anterior ao publicar um novo; manter dois papéis “atuais” para o mesmo programador.

## 3. Ciência é dos outros

Ciência é ato dos outros. O autor não marca o próprio papel.

**Proíbe:** marcação de ciência pelo dono do card; tratar ciência como auto-confirmação do autor.

## 4. Admin inclui no time

Só o admin inclui gente no time. Só o admin cadastra ou exclui categoria. Admin não é programador: não publica card e não marca ciência.

**Proíbe:** cadastro público; programador registrando outro membro; programador cadastrando ou excluindo categoria; tratar admin como mais um papel no mural.

## 5. Exclusão é do dono, e também do admin

O dono da tarefa exclui as próprias tarefas, inclusive a atual. O admin pode excluir tarefa de qualquer programador. Excluir a atual deixa o card em branco; tarefa guardada anterior só volta ao mural se o programador acionar a opção explícita de retornar a mais recente.

**Proíbe:** um programador excluir tarefa de outro; repor automaticamente no card outra tarefa só por ter excluído a atual.

## 6. Mural de redação, não dashboard tech

A interface é um mural físico de redação: jornal, papel, caneta, alfinete. Não é dashboard de produto de tecnologia.

**Proíbe:** linguagem visual de painel SaaS genérico; priorizar métricas de produto sobre a metáfora do mural.

## 7. Repetição é defeito

Repetição de código é defeito. Views, models e mixins de base existem para serem herdados.

**Proíbe:** copiar padrões transversais em cada app em vez de herdar bases comuns.

## 8. Pergunta não é regra

O que ainda é pergunta não vira regra.

**Proíbe:** fechar requisito a partir de item em `docs/06-abertos/questoes-em-aberto.md` sem spec ou ADR que promova a resposta.

## 9. Código de domínio em português

Nomes de domínio, campos, módulos e rótulos de código do AutoDaily ficam em português (por exemplo Usuario, Tarefa, Categoria, Ciencia). Vocabulário já estabelecido de programação e de framework não se traduz (View, Model, Mixin, Template, URL, QuerySet, nomes do Django, do Python, do Tailwind e do HTMX).

**Proíbe:** nome de domínio em inglês no código do produto (Task, User, Category e equivalentes).
