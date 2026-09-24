# AutoDaily

O AutoDaily mostra somente a **tarefa atual** de cada programador, como um papel colado na parede. Cada programador publica uma descrição breve daquilo em que está trabalhando agora. Ao publicar outra tarefa, a anterior é guardada no histórico.

Os demais programadores marcam que **tomaram ciência** da tarefa de cada colega; uma barra no card indica o progresso dessa ciência. Há **histórico** consultável, **relatório simples** e **relatório completo**. Apenas o **admin** cadastra membros e categorias; o admin não possui card no mural. Programador **desativado** não entra no sistema.

A especificação detalhada (SDD) está em [docs/README.md](docs/README.md).

## Desenvolvimento

Projeto Django. Na raiz do repositório:

```bash
python manage.py migrate
python manage.py runserver
```

O primeiro administrador nasce com `python manage.py createsuperuser`. Os outros membros são cadastrados na tela do produto.

### Estilos e Tailwind

O visual atual usa **CSS no template base**, não um build Tailwind no repositório. HTMX está em uso. Para compilar Tailwind no futuro, `STATIC_ROOT` e o passo a passo estão em [docs/04-arquitetura/frontend-estilos-e-tailwind.md](docs/04-arquitetura/frontend-estilos-e-tailwind.md).

Em produção, após haver arquivos em `static/`:

```bash
python manage.py collectstatic
```
