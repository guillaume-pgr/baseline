import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// Tests déterministes, hors-ligne (aucun appel API, aucune vraie DB).
// La suite « import » protège le chemin critique de l'import de prise de sang.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    // `test:import` ne cible que test/import (CI). Le smoke live (test/live) est
    // OPT-IN : skippé sauf RUN_LIVE=1, et jamais inclus dans `test:import`.
  },
})
