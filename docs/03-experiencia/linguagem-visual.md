---
id: EXP-01
status: fechada
atualizado: 2026-09-25
---

# Linguagem visual

Isto é **restrição de produto**, não moodboard. Implementação que violar estas regras está errada mesmo que “funcione”.

## Metáfora

Parede de redação, papel, caneta, alfinete. Cards são papéis colados. Publicar descola um papel e cola outro. Ciência é alfinete no papel, não checkbox de formulário genérico. A função continua sendo marcação individual (ver ESP-02); a apresentação é o pino.

## Tom

Material **papel de jornal**: folha acinzentada, fibra visível, leitura de objeto físico. Moderno e contido, sem exagero. **Não** é site de jornal antigo, editorial amarelado, sépia, marfim, creme, papel envelhecido, masthead, fio de coluna como decoração, nem scan amarelado.

**Proibido** o resultado da implementação rejeitada: visual de jornal antigo, editorial amarelado, sépia, marfim, creme, papel envelhecido e equivalentes (incluindo marfim `#e6e0d4` e tons quentes de “papel envelhecido”).

## RV-001 Responsivo

Utilizável em tela estreita, tablet e desktop. Mural empilha quando não cabe lado a lado. Alvo de toque confortável na marcação de ciência. Não fixar breakpoint numérico nesta rodada.

## RV-002 Temas

Dois temas: **claro** (padrão) e **escuro**. Cromia do papel e da parede: **cinza neutro**. Sem puxar para o amarelo. Sem tom quente. Sem marfim. O escuro é cinza neutro mais escuro, confortável, **não** preto puro, e também **não** marrom nem quente.

Preferência de tema fica **somente no navegador** (armazenamento local). Não grava no servidor. Outro navegador ou outro computador começa no tema claro.

A preferência de caneta azul ou preta continua **por usuário** no servidor; não usa o mesmo mecanismo de localStorage do tema.

**QA-023** fechada por esta regra (dois temas de papel cinza neutro; escuro confortável, não preto nem amarelado). **QA-022** fechada: padrão claro; persistência de tema só no navegador.

## RV-003 Proibições de cor e de estilo (requisito)

Proibido na cromia de interface:

- roxo, violeta, magenta e gradiente roxo
- o azul clássico de área de tecnologia (azul de link SaaS, azul de botão primário de dashboard)
- verde limão, verde neon, verde “sucesso” claro de dashboard
- glassmorphism, glow, neon, malha de gradiente, visual genérico de painel SaaS

**Exceção única de azul:** a tinta da escrita de dentro do card, que é azul de caneta esferográfica, não azul de UI. Esse azul não colore botão, link, fundo nem barra.

A skill Impeccable orienta a não usar cinza puro e a tingir cores. **Esta spec vence:** tingimento quente ou amarelo é proibido. **Cinza neutro** é a regra. Um fio frio é aceitável; amarelo, creme e sépia não.

## RV-004 Papel e parede

Papel e parede em **cinza neutro** nos dois temas, com leitura de folha de jornal (fibra visível, ver RV-011). Proibido marfim, sépia, creme e amarelo de editorial.

## RV-005 Tipografia de interface

Serifa moderada, confortável. **Não** é “jornal antigo” nem site editorial.

**Proibido:** Didot/Bodoni em texto corrido, blackletter, script em menus, filtros e relatórios.

Famílias concretas são **proposta**, não decisão fechada.

## RV-006 Tipografia do card

A descrição parece escrita à mão e continua bem clara.

**Proibido:** caligrafia ilegível, “letra de médico”, script conectado denso.

Família continua **proposta**, não fechada.

## RV-007 Tinta da descrição

Padrão: azul de caneta esferográfica. Alternativa: caneta preta.

Preferência **por usuário**. Na barra superior, controle com ícone de caneta **ao lado** do ícone que troca claro/escuro.

**QA-024** fechada por esta regra.

## RV-008 Barra

Verde escuro sóbrio acima do card, na barra de progresso. Não agressivo. Não usar o verde como cor de marca do sistema inteiro; ele é a barra.

O **miolo** da barra mostra **x/y** em texto pequeno (x = marcações, y = total que deve marcar; ver ESP-02).

## RV-009 Insígnia

Canto superior direito quando a ciência está completa (x = y). Sóbria. Sem medalha de jogo, sem confete, sem brilho. Forma além de cor. **QA-025** fechada: não há símbolo adicional além deste sinal quando x = y.

## RV-010 Movimento

**Nada no sistema é brusco ou instantâneo.** Troca de tema, troca de tela, abrir edição, publicar ou trocar papel, filtros, paginação, aparecer e sumir de região: transição contínua, curta o bastante para não atrasar, longa o bastante para o olho acompanhar.

**Proibido:** corte instantâneo, bounce, parallax, confete.

## RV-011 Contenção do objeto físico

Alfinete, papel e tipografia carregam a metáfora. Textura: **fibra de papel**, o bastante para a folha parecer papel.

**Proibido:** textura barulhenta, borda rasgada em tudo, clipart, pino 3D, sombra empilhada, emoji no lugar do alfinete.

## RV-012 Edição invisível

Na leitura, os campos **não** ficam abertos como formulário. Ao editar (dono, na tarefa atual), o cursor aparece **no texto** da região clicada; ao digitar, mesma fonte, tamanho e cor do card em repouso. **Proibido** retângulo branco, borda de input e chrome de formulário que destoem do papel. Quem não é dono não abre cursor no card alheio. Regras de gravação e descrição vazia: ESP-01 **RF-017**.

## Paleta (direção fechada)

Valores **ilustrativos**; substituíveis desde que permaneçam **cinza neutro** (sem amarelo, marfim ou sépia).

| Uso | Exemplo ilustrativo |
| --- | --- |
| Papel claro | `#d4d4d1` |
| Parede clara | `#b9b9b6` |
| Papel escuro | `#3a3a3a` |
| Parede escura | `#2a2a2a` |
| Tinta de interface | cinza neutro escuro no tema claro; cinza neutro claro no tema escuro |
| Caneta azul | `#1e3a5f` |
| Caneta preta | quase preto (sem preto puro no tema escuro como fundo de parede) |
| Progresso | `#2f5d45` |
