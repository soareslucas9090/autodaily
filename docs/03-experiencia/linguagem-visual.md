---
id: EXP-01
status: rascunho
atualizado: 2026-09-24
---

# Linguagem visual

Isto é **restrição de produto**, não moodboard. Implementação futura que violar estas regras está errada mesmo que “funcione”.

## Metáfora

Parede de uma redação / daily físico. Cards são papéis ou post-its colados. Publicar é descolar um papel e colar outro. Ciência é alfinete físico no papel, não um checkbox de formulário genérico. A função continua sendo marcação individual (ver ESP-02); a apresentação é o pino.

## Tom

Moderno, contido, sem exagero. Clássico de editorial dos anos 90 misturado ao objeto físico. Não é paródia, não é skeuomorfismo carregado.

## RV-001 Responsivo

Utilizável em tela estreita, tablet e desktop. Mural empilha quando não cabe lado a lado. Alvo de toque confortável na marcação de ciência. Não fixar breakpoint numérico nesta rodada.

## RV-002 Temas

Existem **dois** visuais de jornal: tema claro e tema escuro. Ambos lembram jornal. O escuro é mais confortável aos olhos, **não** é preto; as cores do escuro ainda remetem a jornal.

**Padrão do sistema:** tema **claro**.

Quando o usuário troca o esquema de cor, a preferência fica **somente no navegador** (armazenamento local). Não grava no servidor. Outro navegador ou outro computador começa no tema claro.

A preferência de caneta azul ou preta continua **por usuário** no servidor; não usa o mesmo mecanismo de localStorage do tema.

**QA-023** foi respondida por esta regra (dois temas jornal; escuro confortável e não preto). **QA-022** fechada: padrão claro; persistência de tema só no navegador.

## RV-003 Proibições de cor e de estilo (requisito)

Proibido na cromia de interface:

- roxo, violeta, magenta e gradiente roxo
- o azul clássico de área de tecnologia (azul de link SaaS, azul Tailwind padrão, azul de botão primário de dashboard)
- verde limão, verde neon, verde “sucesso” claro de dashboard
- glassmorphism, glow, neon, malha de gradiente, visual genérico de painel SaaS

**Exceção única de azul:** a tinta da escrita de dentro do card, que é azul de caneta esferográfica, não azul de UI. Esse azul não colore botão, link, fundo nem barra.

## RV-004 Papel e parede

A regra de cromia e metáfora é a de **RV-002**: jornal nos dois temas; escuro confortável, não preto, ainda com leitura de jornal. Não há proposta pendente de “parede cinza-carvão com card marfim” como decisão separada.

## RV-005 Tipografia de interface

Lembra jornal antigo. Serifas moderadas. Tem de ser confortável de ler.

**Proibido:** serifa de contraste extremo (Didot/Bodoni) em texto corrido, blackletter, script na cromia da interface (menus, filtros, relatórios).

Famílias concretas são **proposta**, não decisão: Newsreader ou Source Serif 4.

## RV-006 Tipografia do card

A descrição dentro do card parece escrita à mão e continua bem clara.

**Proibido:** caligrafia ilegível, “letra de médico”, script conectado denso.

**Proposta** de família, não fechada: Kalam ou Patrick Hand.

## RV-007 Tinta da descrição

Padrão: azul de caneta esferográfica. Alternativa: caneta preta.

Preferência **por usuário**. Na barra superior, controle com ícone de caneta **ao lado** do ícone que troca claro/escuro.

**QA-024** fechada por esta regra.

## RV-008 Barra

Verde acima do card, na barra de progresso. Não pode ser agressivo. Preferir um verde mais escuro, que case com a paleta sóbria. Não usar o verde como cor de marca do sistema inteiro; ele é a barra.

Além do verde sóbrio, o **miolo** da barra mostra **x/y** em texto pequeno (x = marcações, y = total que deve marcar; ver ESP-02).

## RV-009 Insígnia

Canto superior direito quando a ciência está completa (x = y). Sóbria. Sem medalha de jogo, sem confete, sem brilho. Forma além de cor, para não depender só da cor. **QA-025** fechada: não há símbolo adicional além deste sinal sóbrio no canto superior direito quando x = y; não inventar ilustração extra.

## RV-010 Movimento

Se houver movimento de trocar o papel, é curto e pequeno.

**Proibido:** bounce, parallax, confete.

## RV-011 Contenção do objeto físico

Alfinete, papel e tipografia carregam a metáfora.

**Proibido:** clipart, pino 3D, textura de papel barulhenta, borda rasgada em tudo, sombra empilhada, emoji no lugar do alfinete.

## Paleta proposta

**PROPOSTA ilustrativa**, não token fechado. Deve obedecer jornal nos dois temas, escuro confortável e não preto. Valores ilustrativos:

| Uso | Direção | Exemplo |
| --- | --- | --- |
| Parede escura | Cinza quente muito escuro (jornal à noite, não preto) | `#1c1b19` |
| Papel | Marfim | `#e6e0d4` |
| Tinta de interface no escuro | Cinza claro quente | (sem hex fechado nesta rodada) |
| Caneta azul | Azul de esferográfica, fora da família de azul de botão tech | `#1e3a5f` |
| Caneta preta | Quase preto | — |
| Progresso | Verde escuro sóbrio | `#2f5d45` |

O tema claro usa parede em cinza-papel claro e o mesmo verde e a mesma caneta, sem inverter para paleta SaaS.
