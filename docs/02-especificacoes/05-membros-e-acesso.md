---
id: ESP-05
status: rascunho
atualizado: 2026-09-24
---

# Membros e acesso

## RF-015 Login

O sistema tem login. Credencial: **username** e **senha**.

A senha deve ter **no mínimo 6 caracteres**. Vale letra, número ou qualquer outro caractere. Não há recuperação de senha. O admin pode **redefinir** a senha de qualquer membro e gravar uma nova.

## RF-016 Papéis mínimos

Dois papéis **disjuntos**: **admin** e **programador**. Admin **não** é programador.

Somente o admin registra novos membros (pela **tela do produto**). Somente o admin cadastra e exclui categorias (detalhe em ESP-06). Cadastro e gestão de membros **não** usam o Django admin como interface do produto.

**Primeiro admin:** nasce por `createsuperuser`. Os demais membros nascem pela tela do produto.

**Admin:** registra e edita membros; desativa e reativa membros; redefine senha; cadastra e exclui categorias; exclui qualquer tarefa (atual ou histórico) de qualquer programador. **Não** tem card no mural, **não** publica tarefa, **não** marca nem desmarca ciência.

**Programador:** publica a própria tarefa; edita o próprio card (tarefa atual); marca e desmarca a **própria** ciência nos cards dos outros; exclui as **próprias** tarefas. **Não** registra membro; **não** cadastra nem exclui categoria; **não** edita texto de card alheio; **não** exclui tarefa de outro.

**Membro no fluxo normal:** não é **excluído**; é **desativado**. O admin pode voltar a **ativar**. Não há exclusão de membro.

**Programador desativado não entra no programa.** Login recusado enquanto estiver desativado. Não vê mural, histórico nem relatório. Não entra no time de agora, não marca ciência e o card dele não aparece no mural. Desativar **não** apaga tarefas já publicadas. Tarefa guardada continua com o recorte congelado; desativar alguém depois não reescreve tarefa que já saiu da parede. Ao reativar, o login volta a valer.

**Regra derivada:** não há cadastro público. Programador não registra membro.

## RNF-001 Sessão

**Regra derivada** (de “obviamente login” mais as ações nomeadas): área do mural, histórico, ciência, relatório e cadastro de membros exige usuário autenticado.

## Critérios de aceite

- **Dado** credenciais válidas (username e senha), **quando** o usuário faz login, **então** entra no sistema.
- **Dado** usuário não autenticado, **quando** tenta acessar o mural, **então** não usa o mural sem login.
- **Dado** programador autenticado, **quando** navega pela interface do produto, **então** não vê caminho para registrar membro nem para cadastrar ou excluir categoria.
- **Dado** admin autenticado, **quando** registra um novo membro na tela do produto, **então** esse membro passa a poder entrar com username e senha.
- **Dado** senha com menos de 6 caracteres, **quando** admin tenta criar ou redefinir senha, **então** a operação não é aceita.
- **Dado** senha com 6 caracteres misturando letras e números, **quando** admin cria ou redefine, **então** a operação é aceita.
- **Dado** programador desativado, **quando** tenta entrar com username e senha, **então** não entra no programa.
- **Dado** admin autenticado, **quando** desativa um programador, **então** o programador deixa de entrar, deixa de aparecer no mural e não entra no denominador de ciência dos cards atuais; tarefas guardadas anteriores permanecem como estavam.
- **Dado** programador desativado, **quando** admin reativa, **então** o programador volta a aparecer no mural conforme regras de tarefa atual e card em branco.
- **Dado** admin autenticado no mural, **quando** observa a parede, **então** não há card do admin nem controles de ciência para o admin.
- **Dado** programador autenticado dono de card, **quando** edita a tarefa atual, **então** consegue alterar o próprio card sem publicar outro.
- **Dado** programador autenticado, **quando** tenta editar card de outro programador, **então** não consegue alterar o texto alheio.
- **Dado** admin autenticado, **quando** exclui tarefa de um programador, **então** a exclusão é permitida; **dado** programador autenticado, **quando** tenta excluir tarefa de outro, **então** não consegue.
