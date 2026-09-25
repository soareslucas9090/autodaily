import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { abrirBanco } from "./banco/abrir.js";
import { ErroDeRegra } from "./dominio/erros.js";
import { Produto } from "./dominio/produto.js";

const username = process.argv[2];
const senha = process.argv[3];
if (!username || !senha) {
  console.error("Uso: npm run criar-admin -- <username> <senha>");
  process.exit(1);
}

const caminho = resolve(process.env.AUTODAILY_BANCO ?? "dados/autodaily.sqlite");
mkdirSync(dirname(caminho), { recursive: true });
const produto = new Produto(abrirBanco(caminho));

try {
  produto.criarPrimeiroAdmin(username, senha);
  console.log(`Admin ${username} criado.`);
} catch (erro) {
  if (erro instanceof ErroDeRegra) {
    console.error(erro.message);
    process.exit(1);
  }
  throw erro;
}
