import { PlanningService } from './planning.service';
import { demoResources } from './demo';
import { MILLARS, MILLARS_CLOSED, MILLARS_OPEN, MILLARS_RUNNING, millarsArticles, millarsOrderDoc, millarsResources } from './demo-millars';

// Modelo de Mongo mínimo para `scope` (solo distinct y find por empresa)
const modelo = (docs: any[]) => ({
  distinct: async (f: string) => [...new Set(docs.map((d) => d[f]))],
  find: (q: any) => ({ lean: async () => docs.filter((d) => (q.company?.$in ? q.company.$in.includes(d.company ?? null) || (d.company === undefined && q.company.$in.includes(null)) : d.company === q.company)) }),
});

describe('Demo: Cerámicas Millars en Planifica', () => {
  it('las máquinas de la línea CAS-1 de Planta 3D y Atisba, solo de Millars', () => {
    const r = millarsResources('es');
    expect(r.map((x) => x.code)).toEqual(['PR-01', 'ES-01', 'HR-01', 'CL-01']);
    expect(r.every((x) => x.company === MILLARS.name && x.ritmia)).toBe(true);
    for (const a of millarsArticles('de')) expect(a.route.map((s) => s.resources[0])).toEqual(['PR-01', 'ES-01', 'HR-01', 'CL-01']);
  });

  it('las OF son las de Atisba y Lotea: 261182…261184 (OF-26-1182…1184), la 261184 en marcha', () => {
    expect(MILLARS_RUNNING).toBe(261184);
    expect(MILLARS_OPEN[0][0]).toBe(MILLARS_RUNNING);
    expect(MILLARS_CLOSED.map((c) => c[0])).toEqual([261182, 261183]);
    const d = millarsOrderDoc('it', 261182, 'POR-6060', 5184, 'Habitat Cerámica Distribución, S.L.', new Date(), 3, new Date(Date.now() - 8 * 3600000));
    expect(d).toMatchObject({ companyName: MILLARS.name, status: 3, quantityProcessed: 5184, workName: 'Gres porcellanato Calacatta 60×60 rettificato' });
  });

  it('cada empresa ve sus recursos: Millars los suyos; Envases Turia (y cualquier otra) los de siempre', async () => {
    const docs = [...demoResources('es'), ...millarsResources('es')];
    const s = new PlanningService(modelo(docs) as any, {} as any, {} as any, {} as any, {} as any, {} as any);
    const millars = await s.scope(MILLARS.name);
    expect([...millars.codes]).toEqual(['PR-01', 'ES-01', 'HR-01', 'CL-01']);
    const turia = await s.scope('Envases Turia, S.L.');
    expect(turia.codes.has('INY-01') && turia.codes.has('MON-01')).toBe(true);
    expect(turia.codes.has('HR-01')).toBe(false);
    expect((await s.scope(null)).codes).toEqual(turia.codes);
    expect((await s.scope('Fornival Hornos Industriales, S.L.')).codes).toEqual(turia.codes);
  });
});
