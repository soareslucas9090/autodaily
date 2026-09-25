---
id: ESP-01
status: fechada
atualizado: 2026-09-25
---

# Mural e tarefa atual

**Contexto:** visão principal do produto.

## RF-001 Visão principal só com o atual

**Regra literal:** a visualização principal mostra somente a tarefa atual. Tarefas anteriores não aparecem nela.

**Critério de aceite:** Dado um programador com tarefa atual e tarefas arquivadas, quando abre a visão principal, então vê a atual e não vê as arquivadas.

## RF-002 Uma tarefa atual por programador

No máximo uma tarefa atual por programador. Corrigir a atual no lugar — texto, id do Trello ou categorias — não cria segunda atual nem arquiva. Só publicar outra tarefa substitui e arquiva a que estava na parede.

## RF-003 Publicar substitui e arquiva

**Regra literal:** ao registrar uma nova tarefa, a anterior é guardada com todas as informações dela.

**Regra derivada:** “todas as informações” inclui descrição, id do Trello, categorias, autor e o estado de ciência já marcado. Não apaga o passado para abrir espaço.

**Critério de aceite:** Dado um papel atual com marcações de ciência, quando o autor publica outro, então o novo fica atual, o antigo sai do mural e o antigo continua recuperável no histórico com os dados que tinha.

## RF-004 Conteúdo do card

Na publicação, só o **texto** (descrição) do card é obrigatório. Id do Trello e categorias são opcionais. Descrição vazia não passa.

O card exibe:

- nome do programador
- descrição escrita por ele
- id da tarefa no Trello (quando informado)
- categoria na face, quando houver categorias vinculadas

Se houver categorias, a face mostra a **primeira em ordem alfabética**. Se houver mais de uma, o rótulo continua no feitio “Nome e mais...”. Não exige listar as demais na face. Sem categoria, o card não mostra rótulo de categoria.

## RF-005 Mural é coletivo

**Regra derivada:** a metáfora é a parede do time, então a visão principal reúne os cards dos programadores, não um card isolado sem os outros.

## RF-017 Edição no lugar

**Regra:** o programador dono do card pode editar descrição, id do Trello ou categorias da tarefa atual sem arquivar a atual nem criar outra tarefa atual.

**Visualização padrão:** leitura. Os campos **não** ficam abertos.

**Gesto:** o dono clica na região que quer editar (texto da descrição, id do Trello, rótulo de categoria). Só então aparece o cursor naquele texto.

**Ao digitar:** as letras saem na **mesma fonte, tamanho e cor** do card em repouso. Proibido caixa de texto clássica (retângulo branco, borda de input, chrome de formulário que desto do papel). Categoria, se precisar de escolha, aparece como parte do papel, não como dropdown branco clássico.

**Salvamento ao vivo:** o que está escrito é o que fica gravado, sem botão salvar e sem passo de confirmação. A gravação não pisca nem troca o visual para “modo formulário”. Se a gravação falhar, o texto digitado **não** some em silêncio: há aviso contido, no mesmo tom do mural.

**Quem não é dono:** vê só leitura e não abre cursor no card alheio.

**Descrição vazia:** inválida. Não gravar vazio como se fosse publicação válida; se o texto ficar vazio, a gravação dessa alteração **não** é aceita e o aviso é contido.

**Critério de aceite:** Dado o programador dono com tarefa atual na parede, **quando** edita descrição, id do Trello ou categorias pelo gesto acima, **então** continua existindo uma única tarefa atual para ele, o card reflete a alteração persistida, nenhuma tarefa nova é arquivada por causa da edição, e o card permanece em modo leitura fora das regiões em edição.

**Critério de aceite:** Dado programador dono, **quando** tenta deixar a descrição vazia na edição, **então** a alteração não é aceita e há aviso contido.

**Critério de aceite:** Dado programador que não é dono, **quando** interage com card alheio, **então** não obtém cursor de edição nem altera o conteúdo.

## RF-018 Tirar da parede

**Regra:** o dono pode tirar a tarefa atual da parede. O admin também pode tirar a tarefa atual de qualquer programador. **Tirar da parede guarda** o papel: ele sai do mural, congela ciência e denominador, e continua no histórico, sujeito aos filtros de id do Trello, programador e período (data de publicação). Não é exclusão definitiva.

Após tirar a atual, o card fica **em branco**, mesmo que existam outras tarefas guardadas. Se existir tarefa guardada, o card em branco oferece opção de **retornar** a mais recente. A tarefa que acabou de sair da parede é a mais recente guardada, então o retorno a traz de volta.

A **exclusão definitiva** (some do histórico e dos relatórios, não volta) continua no histórico, para o dono e para o admin (RF-012 e ESP-05). Excluir a tarefa que ainda está na parede também deixa o card em branco, com a mesma opção de retorno se restar tarefa guardada. A tarefa excluída não volta.

Ao retornar a anterior (ver ESP-02 para ciência e denominador):

- ela volta a ser a tarefa atual na parede;
- o denominador passa a ser o time de agora (programadores ativos, sem o autor e sem admin);
- permanecem marcadas as ciências dos programadores que ainda estão ativos;
- programador ativo que não tinha marcação aparece desmarcado, com opção de marcar;
- programador desativado não entra no time de agora nem nas marcações.

**Critério de aceite:** Dado programador com tarefa atual, **quando** o dono tira essa tarefa da parede, **então** o card fica em branco, a tarefa permanece no histórico no recorte da data de publicação e **não** é reexibida sozinha no mural.

**Critério de aceite:** Dado programador com tarefa atual e pelo menos uma tarefa guardada, **quando** o dono tira a atual da parede e aciona a opção de retornar a anterior, **então** o card passa a mostrar a tarefa guardada mais recente como tarefa atual.

**Critério de aceite:** Dado programador com tarefa atual e sem outra tarefa guardada, **quando** o dono tira a atual da parede, **então** o card fica em branco e a opção de retorno traz de volta essa mesma tarefa, que acabou de ser guardada.

**Critério de aceite:** Dado admin autenticado, **quando** tira da parede a tarefa atual de um programador, **então** o card desse programador segue as mesmas regras de card em branco e opção de retorno.

## RF-019 Card vazio

**Regra:** programador sem tarefa permanece no mural com card em branco. O lugar no mural não some.

**Critério de aceite:** Dado programador sem nenhuma tarefa (atual ou que volte a ser exibida), **quando** a visão principal é aberta, **então** o card dele aparece vazio no mural coletivo.

## Critérios de aceite adicionais (publicar)

- **Dado** um programador autenticado na visão principal, **quando** publica uma tarefa só com descrição (sem id do Trello e sem categoria), **então** o card dele na parede exibe nome e descrição, sem rótulo de categoria.
- **Dado** um programador autenticado, **quando** tenta publicar com descrição vazia, **então** a publicação não é aceita.
- **Dado** um programador com tarefa atual, **quando** publica outra tarefa, **então** o card na parede passa a mostrar a nova e a anterior deixa de aparecer no mural.

## Ainda não especificado

Não há questão em aberto neste arquivo.
