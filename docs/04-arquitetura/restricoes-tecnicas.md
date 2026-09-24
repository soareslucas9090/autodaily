---
id: ARQ-01
status: rascunho
atualizado: 2026-09-24
---

# Restrições técnicas

Isto registra restrições pedidas para quando a implementação for liberada. Não há código aqui. Não criar apps agora.

**Fato observado:** o repositório tem o projeto Django `autodaily` (Django 5.2.x), apps `nucleo` e `mural`, templates do produto e testes automatizados. Detalhes de front e estáticos: [frontend-estilos-e-tailwind.md](frontend-estilos-e-tailwind.md).

## RA-001 Servidor

Django. Interface no próprio Django. Sem frontend separado.

## RA-002 Interface

Tailwind e HTMX. Views de classe (class-based views). Proibido padrão de views função para as telas do produto, salvo se uma ADR futura abrir exceção.

**Implementação atual:** HTMX em uso. O visual está em CSS no template base; **Tailwind compilado ainda não está no repositório**. Ver [frontend-estilos-e-tailwind.md](frontend-estilos-e-tailwind.md) para estado do código e passos de `npm` / CLI.

## RA-003 Bases reutilizáveis

O projeto terá um lugar único de bases, herdadas pelo resto, para evitar repetição:

- **Models básicos** (o pedido usa o nome *basic models*): classes abstratas de model para os models de domínio herdarem. Por enquanto, somente **data de criação** e **data de atualização** como campos transversais. Nada mais de campo transversal nesta rodada (**QA-026** fechada).
- **Views básicas:** classes para reuso, em especial views que recarregam só um fragmento de HTML e views de ação.
- **Mixins básicos (BasicMixins):** autenticação, papel (admin versus programador), dono do recurso, resposta parcial HTMX. A lista exata de mixins nasce na implementação a partir destes papéis, não agora.

## RA-004 HTMX nas interações do mural

Marcar ciência e publicar tarefa atualizam a região afetada. Não desenhar a interação como recarga completa obrigatória. Detalhe de endpoint fica para a fase de implementação.

## RA-005 Autenticação e Usuario

Username e senha. O produto tem **model de usuário próprio**; nome conceitual **Usuario** (português). Não usa o User padrão do Django como model de domínio. Deve ser compatível com `createsuperuser` para o nascimento do **primeiro** admin.

## RA-006 Django admin versus tela do produto

O pacote admin veio do `startproject`. Cadastro e gestão de membros são **tela do produto**, não o Django admin. O `createsuperuser` é só o nascimento do primeiro admin.

## RA-007 Fuso

**America/Sao_Paulo** em todo recorte de data do produto (histórico, atalhos de período, relatórios quando aplicável). Não é configuração por usuário. O UTC herdado do `startproject` **não** vale como regra do AutoDaily.

## RA-008 Banco de dados

**SQLite** é o banco **atual**. **PostgreSQL** é o destino futuro. Os dois devem conviver com o **mesmo modelo**. Não usar recurso exclusivo de um deles.

## RA-009 Idioma do código

O código do produto é escrito em **português**, com exceção do vocabulário já estabelecido de programação e de framework (View, Model, Mixin, Template, URL, QuerySet, nomes do Django, do Python, do Tailwind e do HTMX). Nomes de domínio, campos, módulos e rótulos de código do AutoDaily ficam em português (Usuario, Tarefa, Categoria, Ciencia). Documentação continua em pt-BR.

## Pendências de arquitetura (front)

- Pipeline **Tailwind** local documentado, mas **não integrado** ao código — ver [frontend-estilos-e-tailwind.md](frontend-estilos-e-tailwind.md).
- PostgreSQL em produção (SQLite no desenvolvimento atual) — RA-008.
