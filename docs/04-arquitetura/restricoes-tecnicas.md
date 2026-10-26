---
id: ARQ-01
status: fechada
atualizado: 2026-10-26
---

# Restrições técnicas

Restrições para a implementação alvo. Não há código neste documento.

**Fato observado:** o repositório ainda contém a implementação Django rejeitada (apps, templates, testes). Essa árvore **não** é o alvo. Não estendê-la. A próxima implementação segue esta spec e os documentos de frontend e orquestração apontados abaixo.

## RA-001 Stack e servidor

Todo o produto novo é **TypeScript**.

A interface é **React**. O servidor é **Hono** em TypeScript, no mesmo repositório; a interface React conversa com essa API. Hono foi escolhido porque o banco fica explícito (arquivo local agora, PostgreSQL depois) e a interface React fica livre para a skill Impeccable, sem acoplar o visual a um framework de página full-stack.

Proibido como alvo: Django como servidor do produto, SPA separada desconectada do repositório, e qualquer stack revogada neste índice em 2026-09-25.

## RA-002 Interface

A interface do produto é **React**, implementada conforme [frontend-react-e-impeccable.md](frontend-react-e-impeccable.md) e [linguagem-visual.md](../03-experiencia/linguagem-visual.md).

Revogados como alvo: Tailwind como restrição obrigatória, HTMX, templates Django para telas do produto, class-based views Django, e o guia [frontend-estilos-e-tailwind.md](frontend-estilos-e-tailwind.md) (documento revogado; caminho mantido só para links antigos).

## RA-003 Bases reutilizáveis

Um lugar único de bases reutilizáveis. Repetição do mesmo padrão em cada tela é defeito.

- **Dados transversais:** somente **data de criação** e **data de atualização** como campos comuns herdados ou compartilhados (**QA-026** fechada). Nada mais de campo transversal nesta rodada.
- **Acesso:** autenticação, papel (admin versus programador) e dono do recurso concentrados em bases reutilizáveis, não copiados tela a tela.
- **Interface:** componentes React reutilizados; não duplicar o mesmo padrão visual ou de interação em cada superfície.

## RA-004 Atualização parcial na interface

Marcar ciência e publicar tarefa atualizam a região afetada. Proibido desenhar essas ações como recarga completa obrigatória da página.

## RA-010 Tempo real entre sessões

Quem está autenticado recebe aviso do servidor quando o estado compartilhado muda. A interface busca de novo a superfície que está mostrando. Proibido exigir recarga completa da página para ver o que outro membro acabou de gravar.

O aviso é **SSE** na API Hono, autenticado pela mesma sessão. Não é WebSocket nesta rodada. Não é recarga periódica cega da página inteira.

## RA-005 Autenticação e Usuario

Credencial: **username** e **senha**. **Usuario** é conta própria do produto (nome conceitual em português), com papel admin ou programador. Não é usuário genérico de framework.

O **primeiro** admin nasce por **comando de linha do próprio produto**. Os demais membros nascem pela tela do produto. Não há painel de administração de framework nem `createsuperuser` como alvo.

## RA-006 Gestão de membros

Cadastro, edição, desativação, reativação e redefinição de senha são **tela do produto**, não painel de framework. O comando de linha do produto serve apenas ao nascimento do primeiro admin.

## RA-007 Fuso

**America/Sao_Paulo** em todo recorte de data do produto (histórico, atalhos de período, relatórios quando aplicável). Não é configuração por usuário.

## RA-008 Persistência

**Drizzle** como camada de persistência. Banco **atual:** SQLite em arquivo local. Banco **futuro:** PostgreSQL. O **mesmo schema** serve aos dois. Proibido recurso exclusivo de um deles.

Dados de tarefa, usuário, ciência e categoria **não** ficam somente no navegador. Preferência de **tema** continua somente no navegador.

## RA-009 Idioma do código

Código de domínio em **português** (Usuario, Tarefa, Categoria, Ciencia). Vocabulário já estabelecido de programação **não** se traduz: componente React, tipo, rota, schema Drizzle, nomes de TypeScript, React, Hono e Drizzle. Documentação continua em pt-BR.

## Documentos relacionados

- Frontend React e Impeccable: [frontend-react-e-impeccable.md](frontend-react-e-impeccable.md) (ARQ-02).
- Orquestração da implementação: [orquestracao-da-implementacao.md](orquestracao-da-implementacao.md) (ARQ-03).
- Linguagem visual: [linguagem-visual.md](../03-experiencia/linguagem-visual.md).
