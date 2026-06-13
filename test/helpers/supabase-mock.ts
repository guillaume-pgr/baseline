/**
 * Mock Supabase déterministe et hors-ligne pour la suite « import ».
 * Construit un client chaînable (from().select().eq().limit() / .insert().select().single())
 * qui ne touche AUCUNE vraie base : il enregistre les inserts + filtres et
 * renvoie des résultats fournis par `onQuery`. Permet d'asserter l'id d'écriture
 * (cohérence auth.uid / RLS) sans réseau.
 */

export interface QueryCtx {
  table: string
  op: 'select' | 'insert'
  filters: Record<string, unknown>
  single: boolean
  rows?: unknown
}

export interface SupabaseMockOptions {
  user?: { id: string; email?: string } | null
  onQuery: (ctx: QueryCtx) => { data: unknown; error: unknown }
}

export function makeSupabaseMock(opts: SupabaseMockOptions) {
  const inserts: { table: string; rows: unknown }[] = []
  const queries: QueryCtx[] = []

  function builder(table: string) {
    const ctx: QueryCtx = { table, op: 'select', filters: {}, single: false }
    const settle = () => {
      const snapshot: QueryCtx = { ...ctx, filters: { ...ctx.filters } }
      queries.push(snapshot)
      return opts.onQuery(snapshot)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const b: any = {
      select: () => b,
      eq: (c: string, v: unknown) => { ctx.filters[c] = v; return b },
      order: () => b,
      limit: () => b,
      single: () => { ctx.single = true; return Promise.resolve(settle()) },
      maybeSingle: () => { ctx.single = true; return Promise.resolve(settle()) },
      insert: (rows: unknown) => { ctx.op = 'insert'; ctx.rows = rows; inserts.push({ table, rows }); return b },
      // Rend le builder « thenable » : un await direct (sans .single()) résout ici.
      then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
        Promise.resolve(settle()).then(resolve, reject),
    }
    return b
  }

  const client = {
    auth: {
      getUser: async () => ({ data: { user: opts.user ?? null }, error: null }),
    },
    from: (table: string) => builder(table),
  }

  return { client, inserts, queries }
}
