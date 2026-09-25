---
id: ESP-07
status: fechada
atualizado: 2026-09-25
---

# Cores do post-it

A cor é do programador, não da tarefa. O card no mural usa a cor escolhida. Sem escolha, o card usa o papel cinza da linguagem visual.

## RF-023 Catálogo

Só o admin cadastra e exclui cor. Cada cor tem nome e um hex. Não há limite de quantidade. Programador não cadastra nem exclui.

**Critério de aceite:** Dado programador autenticado, **quando** tenta cadastrar ou excluir cor, **então** não consegue.

**Critério de aceite:** Dado admin autenticado, **quando** cadastra uma cor, **então** ela fica disponível para escolha.

## RF-024 Escolha exclusiva

Só programador ativo escolhe cor, e só entre as do catálogo. Uma cor não pode estar com dois programadores ativos ao mesmo tempo. Admin não escolhe cor e não tem post-it.

Desativar o programador libera a cor. Se, ao reativar, essa cor já tiver outro dono ativo, o reativado fica sem cor até escolher outra.

Excluir a cor do catálogo tira o vínculo de quem a usava. O card volta ao papel cinza até nova escolha.

**Critério de aceite:** Dado dois programadores ativos e uma cor livre, **quando** o primeiro a escolhe e o segundo tenta a mesma, **então** a segunda escolha não é aceita.

**Critério de aceite:** Dado programador desativado que ocupava uma cor, **quando** outro programador ativo a escolhe, **então** a escolha é aceita.

## RF-025 Onde a cor aparece

O fundo do card no mural é a cor do programador dono do lugar. A cabeça da taxinha de cada ciência é a cor de quem marcou. Sem cor, a cabeça fica na tinta neutra da interface. A barra de progresso deriva da cor do card (RV-008).
