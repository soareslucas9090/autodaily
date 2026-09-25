# AutoDaily

O AutoDaily mostra somente a **tarefa atual** de cada programador, como um papel colado na parede. Cada programador publica uma descrição breve daquilo em que está trabalhando agora. Ao publicar outra tarefa, a anterior é guardada no histórico.

Os demais programadores marcam que **tomaram ciência** da tarefa de cada colega; uma barra no card indica o progresso dessa ciência. Há **histórico** consultável, **relatório simples** e **relatório completo**. Apenas o **admin** cadastra membros e categorias; o admin não possui card no mural. Programador **desativado** não entra no sistema.

A especificação detalhada (SDD) está em [docs/README.md](docs/README.md).

## Desenvolvimento

A **spec vigente** está em [docs/README.md](docs/README.md). A árvore **Django** ainda presente no repositório é a implementação **rejeitada** e **não** é o caminho de desenvolvimento.

O alvo é **TypeScript**, interface **React** em `interface/`, servidor **Hono** e persistência **Drizzle** com **SQLite** em `servidor/dados/autodaily.sqlite`.

```bash
cd servidor
npm install
npm run criar-admin -- <username> <senha>
npm run dev
```

```bash
cd interface
npm install
npm run dev
```

A interface sobe em `http://localhost:5173` e fala com a API em `http://localhost:3001`. O primeiro admin nasce só por esse comando; os demais membros, pela tela do produto.
