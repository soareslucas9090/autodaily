---
id: ESP-08
status: fechada
atualizado: 2026-10-26
---

# Tempo real

**Contexto:** o mural é coletivo (RF-005). Quem está com o produto aberto vê o time agora, sem recarregar a página.

## RF-026 Aviso ao time

Quando um membro autenticado grava algo que os outros veem, **todas** as sessões autenticadas abertas passam a mostrar o estado novo **sem recarga completa da página**.

Superfícies que acompanham o aviso:

- mural (cards, ciência, cor, card em branco, retorno)
- histórico, no recorte e na ordenação já escolhidos
- relatórios, no período e no modo já escolhidos
- membros
- categorias
- cores

A sessão de quem gravou também permanece coerente nas outras telas e abas, não só na região que ela acabou de acionar.

**Não viaja no aviso:** preferência de tema (só no navegador). Senha. Texto que a pessoa ainda está digitando no próprio campo em foco (RF-017): o cursor no campo não é atropelado pelo que chegou dos outros; ao sair do campo, vale a gravação ao vivo já fechada.

Sessão encerrada ou membro desativado: a interface deixa de usar o produto sem exigir recarga manual para “descobrir” que não entra mais.

## Critérios de aceite

- **Dado** dois programadores autenticados com o mural aberto em sessões distintas, **quando** um publica, edita a atual, marca ou desmarca ciência, tira da parede ou retorna a anterior, **então** o outro vê o card correspondente atualizado sem recarregar a página.
- **Dado** o histórico aberto num recorte, **quando** alguém tira da parede ou exclui um papel daquele recorte, **então** a lista reflete a mudança sem recarregar.
- **Dado** relatórios, membros, categorias ou cores abertos, **quando** outro membro autenticado altera o que aquela tela mostra, **então** a tela acompanha sem recarregar.
- **Dado** o dono com o cursor na descrição da própria tarefa atual, **quando** chega aviso dos outros, **então** o texto em digitação não some nem é substituído enquanto o campo permanece focado.

## Ainda não especificado

Não há questão em aberto neste arquivo.
