---
id: ARQ-03
status: vigente
atualizado: 2026-09-25
---

# Orquestração da implementação

Regra de quem implementa e como delega trabalho de código. Não substitui as specs de produto.

## Implementação principal

Quem implementa é o **Grok 4.7** no modo **extra high**, com janela de contexto de **500 mil tokens**.

O Grok 4.7 **não** entrega a implementação inteira ao **Composer 2.5**.

## Papel do Composer 2.5

O Composer 2.5 só entra quando o Grok pede para **iterar em arquivos e código** (leitura e edição em volume).

## Interface

Na implementação de interface, o Grok invoca `/impeccable` conforme o mapa em [frontend-react-e-impeccable.md](frontend-react-e-impeccable.md) e o catálogo em [`docs/07-skill-impeccable/README.md`](../07-skill-impeccable/README.md).
