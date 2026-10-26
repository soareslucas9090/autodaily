export class QuadroDeAvisos {
  private ouvintes = new Set<(evento: string, dados: string) => void>();
  assinar(ouvinte: (evento: string, dados: string) => void) {
    this.ouvintes.add(ouvinte);
    return () => {
      this.ouvintes.delete(ouvinte);
    };
  }
  avisar() {
    for (const ouvinte of [...this.ouvintes]) ouvinte("mudou", "{}");
  }
}
