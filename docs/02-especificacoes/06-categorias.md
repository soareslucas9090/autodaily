---
id: ESP-06
status: fechada
atualizado: 2026-09-24
---

# Categorias

Categorias são **registro** administrado pelo admin. Programador associa categorias opcionais na publicação ou na edição do card; não cadastra nem exclui categoria.

## RF-020 Cadastro e exclusão de categoria

Só o **admin** cadastra categoria. Só o **admin** exclui categoria. Programador não cadastra nem exclui.

**Critério de aceite:** Dado programador autenticado, **quando** tenta cadastrar ou excluir categoria, **então** não consegue.

**Critério de aceite:** Dado admin autenticado, **quando** cadastra uma categoria, **então** ela fica disponível para vínculo em cards; **quando** exclui uma categoria, **então** a categoria deixa de existir no registro.

## RF-021 Efeito de excluir categoria

Excluir categoria **remove o vínculo** dessa categoria nos cards. O card pode ficar com uma categoria restante ou com nenhuma. Não apaga o card nem o texto da tarefa.

**Critério de aceite:** Dado card com duas categorias vinculadas, **quando** o admin exclui uma delas do registro, **então** o card perde só essa categoria e pode continuar com a outra ou sem categoria.

## RF-022 Face do card

Se houver categorias no card, a face mostra a **primeira em ordem alfabética**. Com duas ou mais categorias vinculadas, o rótulo usa sufixo **“e mais...”** (feitio “Nome e mais...”). Não exige listar as demais na face.

**Critério de aceite:** Dado card com categorias “Beta” e “Alpha”, **quando** exibido no mural, **então** a face mostra rótulo no feitio “Alpha e mais...”.

**Critério de aceite:** Dado card sem categoria vinculada, **quando** exibido no mural, **então** não há rótulo de categoria na face.
