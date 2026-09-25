import { ErroDeRegra } from "./erros.js";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function gerarHash(senha: string): string {
  const sal = randomBytes(16).toString("hex");
  const hash = scryptSync(senha, sal, 32).toString("hex");
  return `${sal}:${hash}`;
}

export function conferirSenha(senha: string, armazenada: string): boolean {
  const [sal, hash] = armazenada.split(":");
  if (!sal || !hash) return false;
  const calculado = scryptSync(senha, sal, 32);
  const esperado = Buffer.from(hash, "hex");
  if (calculado.length !== esperado.length) return false;
  return timingSafeEqual(calculado, esperado);
}

export function exigirSenhaValida(senha: string): void {
  if (senha.length < 6) {
    throw new ErroDeRegra("senha-curta", "A senha precisa de no mínimo 6 caracteres.");
  }
}
