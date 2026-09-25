const FUSO = "America/Sao_Paulo";

export type Partes = {
  ano: number;
  mes: number;
  dia: number;
  hora: number;
  minuto: number;
  segundo: number;
};

export function partesNoFuso(instante: Date): Partes {
  const formatador = new Intl.DateTimeFormat("en-US", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const mapa: Record<string, string> = {};
  for (const parte of formatador.formatToParts(instante)) {
    mapa[parte.type] = parte.value;
  }
  return {
    ano: Number(mapa.year),
    mes: Number(mapa.month),
    dia: Number(mapa.day),
    hora: Number(mapa.hour === "24" ? "0" : mapa.hour),
    minuto: Number(mapa.minute),
    segundo: Number(mapa.second),
  };
}

function utcDasPartes(ano: number, mes: number, dia: number, hora: number, minuto: number, segundo: number): Date {
  const chute = Date.UTC(ano, mes - 1, dia, hora, minuto, segundo);
  const visto = partesNoFuso(new Date(chute));
  const vistoUtc = Date.UTC(visto.ano, visto.mes - 1, visto.dia, visto.hora, visto.minuto, visto.segundo);
  return new Date(chute - (vistoUtc - chute));
}

export function inicioDoDia(dataIso: string): Date {
  const [ano, mes, dia] = dataIso.split("-").map(Number);
  return utcDasPartes(ano, mes, dia, 0, 0, 0);
}

export function fimDoDia(dataIso: string): Date {
  const [ano, mes, dia] = dataIso.split("-").map(Number);
  return utcDasPartes(ano, mes, dia, 23, 59, 59);
}

function dois(n: number): string {
  return String(n).padStart(2, "0");
}

function dataIso(ano: number, mes: number, dia: number): string {
  return `${ano}-${dois(mes)}-${dois(dia)}`;
}

function ultimoDia(ano: number, mes: number): number {
  return new Date(Date.UTC(ano, mes, 0)).getUTCDate();
}

export function mesAtual(agora: Date): { inicio: string; fim: string } {
  const p = partesNoFuso(agora);
  return { inicio: dataIso(p.ano, p.mes, 1), fim: dataIso(p.ano, p.mes, ultimoDia(p.ano, p.mes)) };
}

export function mesPassado(agora: Date): { inicio: string; fim: string } {
  const p = partesNoFuso(agora);
  const mes = p.mes === 1 ? 12 : p.mes - 1;
  const ano = p.mes === 1 ? p.ano - 1 : p.ano;
  return { inicio: dataIso(ano, mes, 1), fim: dataIso(ano, mes, ultimoDia(ano, mes)) };
}

export function semanaPassada(agora: Date): { inicio: string; fim: string } {
  const p = partesNoFuso(agora);
  const meioDia = utcDasPartes(p.ano, p.mes, p.dia, 12, 0, 0);
  const diaSemana = meioDia.getUTCDay();
  const distanciaSegunda = diaSemana === 0 ? 6 : diaSemana - 1;
  const segundaDesta = new Date(meioDia.getTime() - distanciaSegunda * 86400000);
  const segundaPassada = new Date(segundaDesta.getTime() - 7 * 86400000);
  const domingoPassado = new Date(segundaPassada.getTime() + 6 * 86400000);
  const a = partesNoFuso(segundaPassada);
  const b = partesNoFuso(domingoPassado);
  return { inicio: dataIso(a.ano, a.mes, a.dia), fim: dataIso(b.ano, b.mes, b.dia) };
}

export function diaNoFuso(iso: string): string {
  const p = partesNoFuso(new Date(iso));
  return dataIso(p.ano, p.mes, p.dia);
}

export function atalhoParaPeriodo(atalho: string, agora: Date): { inicio: string; fim: string } | null {
  if (atalho === "mes-atual") return mesAtual(agora);
  if (atalho === "mes-passado") return mesPassado(agora);
  if (atalho === "semana-passada") return semanaPassada(agora);
  return null;
}
