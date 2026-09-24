---
id: ESP-02
status: rascunho
atualizado: 2026-09-24
---

# Ciência e progresso

## RF-006 Quem marca

Abaixo do card há uma marcação por cada **outro** programador **ativo**, para indicar que tomou ciência. As marcações aparecem em **ordem alfabética do nome do programador**.

O dono do card não marca ciência no próprio card. Não existe marcação do autor sobre o próprio papel.

**Admin** não tem card e não entra nas marcações nem no denominador da ciência.

**Programador desativado** não entra no time de agora: não marca ciência, não aparece no mural e não entra no denominador do card atual (regra derivada de ESP-05).

**Exemplo normativo:** 6 programadores ativos no time (somente programadores, sem contar admin) produzem 5 marcações esperadas no card de um deles.

O caso de um único programador ativo não tem regra própria. Não ocorrerá: os dois donos da empresa programam. Não desenhar comportamento para denominador zero.

## RF-007 Interação

No card de outra pessoa, só a marcação do programador logado pode ser alterada. As demais são somente visualização.

No próprio card, o autor não tem marcação acionável; vê a dos outros.

O programador logado **pode desmarcar** a própria ciência. Admin não marca nem desmarca.

**Regra derivada necessária:** cada marcação identifica qual programador ela representa. Sem isso o controle não cumpre o requisito.

## RF-008 Barra de progresso

Na parte de cima do card há uma barra de progresso da visualização/ciência.

**Fórmula normativa:** percentual de preenchimento = (marcações feitas) / (quantidade que deve marcar) × 100, com x = quantos visualizaram (marcaram ciência) e y = total que deve marcar.

**Texto interno da barra:** x/y em texto pequeno dentro da barra (ver RV-008).

**Exemplo normativo e inegociável enquanto esta spec estiver de pé:** 6 programadores no time, 2 marcações → preenchimento 40% e texto interno **2/5**.

O total de referência do preenchimento é 100.

## RF-009 Insígnia

Quando x = y (todos os que devem marcar tiverem marcado), surge uma insígnia na parte superior direita do card.

## Denominador: atual versus guardada

**Card atual (tarefa na parede):** o denominador y usa o time **de agora** — programadores **ativos**, **sem** o autor e **sem** admin.

**Tarefa guardada (saiu da parede):** congela as marcações e o denominador do momento em que deixou de ser atual.

**Motivo (produto):** o número de programadores pode mudar, e isso não influencia as tarefas que já existem como guardadas, só as novas e o card que está na parede agora. Desativar alguém depois não reescreve tarefa que já saiu da parede.

## Retorno da tarefa anterior ao mural (RF-018)

Quando o programador retorna a tarefa guardada mais recente após excluir a atual:

- ela volta a ser tarefa atual;
- o denominador passa a ser o time de agora (programadores ativos, sem autor e sem admin);
- permanecem marcadas as ciências dos programadores que ainda estão ativos;
- programador ativo que não tinha marcação aparece desmarcado, com opção de marcar;
- programador desativado não entra.

## Critérios de aceite

- **Dado** um card de outro programador e o time com 6 programadores ativos (sem admin no denominador), **quando** o programador logado marca a própria ciência e já existia 1 outra marcação, **então** a barra reflete preenchimento 40% e texto interno **2/5**.
- **Dado** um card de outro programador, **quando** o programador logado tenta alterar a marcação de outro, **então** não consegue (somente a própria é acionável).
- **Dado** um card de outro programador com ciência marcada pelo logado, **quando** o logado desmarca a própria ciência, **então** x e y e o preenchimento da barra atualizam de acordo.
- **Dado** o próprio card, **quando** o autor visualiza as marcações, **então** não há controle para marcar ciência sobre o próprio papel.
- **Dado** admin autenticado, **quando** visualiza cards no mural, **então** não há marcação de ciência acionável para o admin.
- **Dado** 6 programadores no time e 5 marcações de ciência no card (todas as esperadas), **quando** a última marcação é feita, **então** a barra mostra x/y com x = y, preenchimento 100% e a insígnia aparece no canto superior direito.
- **Dado** marcações de ciência de vários programadores no mesmo card, **quando** o card é exibido, **então** as marcações aparecem em ordem alfabética do nome do programador.
- **Dado** programador desativado, **quando** a visão principal é aberta, **então** ele não aparece no mural e não entra no denominador de cards atuais.

## Ainda não especificado

Não há questão em aberto neste arquivo.
