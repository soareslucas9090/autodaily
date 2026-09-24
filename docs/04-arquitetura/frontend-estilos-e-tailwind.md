---
id: ARQ-02
status: vigente
atualizado: 2026-09-24
---

# Frontend: estilos, estáticos e Tailwind

Este documento descreve **como o visual está implementado hoje** e **como compilar Tailwind** se o time passar a usar build local. Complementa [restricoes-tecnicas.md](restricoes-tecnicas.md) (RA-002) e [linguagem-visual.md](../03-experiencia/linguagem-visual.md).

## Estado atual do repositório

| Item | Situação |
| --- | --- |
| **HTMX** | Carregado no template base (`nucleo/templates/nucleo/base.html`). Interações do mural usam fragmentos HTML. |
| **Tailwind (build)** | **Não configurado.** Não há `package.json`, `tailwind.config` nem pasta de entrada CSS. **Não há comando de compilação** no projeto hoje. |
| **Estilos** | CSS próprio no `<style>` de `nucleo/templates/nucleo/base.html`: variáveis por tema (`data-tema="claro"` / `escuro`), tipografia Newsreader (interface) e Kalam (texto do card), cores da spec de jornal. |
| **CDN Tailwind** | Não é usado (foi removido na implementação do visual). |

**Divergência consciente:** a RA-002 pede Tailwind; a primeira versão entregou o visual com **CSS customizado** para atender [linguagem-visual.md](../03-experiencia/linguagem-visual.md) sem pipeline Node. Adotar Tailwind compilado é evolução de arquitetura, não mudança de produto, enquanto as restrições visuais (sem roxo, sem azul de UI, barra `#2f5d45`, etc.) se mantiverem.

## Arquivos estáticos no Django

Em `autodaily/settings.py`:

- `STATIC_URL = 'static/'`
- `STATIC_ROOT = BASE_DIR / 'staticfiles'` — destino do `collectstatic` em produção.

O `.gitignore` ignora `staticfiles/` e `node_modules/`.

### Desenvolvimento

Com o CSS no template, `runserver` não exige passo extra de front.

### Produção

```bash
python manage.py collectstatic --noinput
```

Sirva `STATIC_ROOT` pelo servidor web (ou WhiteNoise, se o time adicionar depois). Só fará diferença visível quando existir CSS/JS em `static/` do app (por exemplo após migrar para Tailwind compilado).

## Como compilar Tailwind (quando for adotar)

Pré-requisito: **Node.js** e npm na máquina de desenvolvimento.

### 1. Dependências na raiz do repositório

```bash
npm init -y
npm install -D tailwindcss @tailwindcss/cli
```

### 2. Entrada CSS

O repositório já inclui `assets/css/entrada.css` (entrada mínima). Para expandir, edite esse arquivo:

```css
@import "tailwindcss";
```

Opcional: `@theme` ou camada extra para tokens do jornal (parede, papel, progresso, caneta) alinhados à linguagem visual.

### 3. Saída no app Django

Gere o arquivo em um diretório servido pelo Django, por exemplo:

`nucleo/static/nucleo/estilos.css`

Em `settings.py`, se ainda não existir:

```python
STATICFILES_DIRS = [BASE_DIR / 'nucleo' / 'static']
```

### 4. Compilação (uma vez)

O CLI precisa **varrer os templates** onde haverá classes Tailwind:

```bash
npx @tailwindcss/cli -i ./assets/css/entrada.css -o ./nucleo/static/nucleo/estilos.css --minify --content "./nucleo/templates/**/*.html" "./mural/templates/**/*.html"
```

### 5. Desenvolvimento com watch

```bash
npx @tailwindcss/cli -i ./assets/css/entrada.css -o ./nucleo/static/nucleo/estilos.css --watch --content "./nucleo/templates/**/*.html" "./mural/templates/**/*.html"
```

Sugestão: scripts no `package.json`:

- `build:css` — comando com `--minify`
- `watch:css` — comando com `--watch`

### 6. Ligação no template

Em `base.html`, substituir o bloco `<style>` grande por:

```django
{% load static %}
<link rel="stylesheet" href="{% static 'nucleo/estilos.css' %}">
```

Migrar o visual aos poucos: tema claro/escuro, caneta e barra devem continuar obedecendo [linguagem-visual.md](../03-experiencia/linguagem-visual.md).

### 7. Deploy

1. `npm run build:css` (ou equivalente)
2. `python manage.py collectstatic`
3. Publicar a aplicação com `STATIC_ROOT` servido

## O que não fazer

- Não commitar `node_modules/` nem `staticfiles/`.
- Não voltar ao CDN do Tailwind em produção sem decisão explícita (build local é o caminho alinhado à RA-002).
- Não usar utilitários que violem RV-003 (roxo, azul de produto, verde neon de dashboard).

## Referências no código

- Template base e CSS atual: `nucleo/templates/nucleo/base.html`
- Barra superior (tema e caneta): `nucleo/templates/nucleo/_barra_superior.html`
- Fragmento do card: `mural/templates/mural/_card.html`
