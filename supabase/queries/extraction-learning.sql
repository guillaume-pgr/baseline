-- =========================================
-- REQUÊTES ADMIN — boucle d'apprentissage de l'extraction (sous-étape F)
-- =========================================
-- À exécuter dans le SQL editor Supabase (service role → contourne la RLS).
-- Objectif : repérer ce qu'il faut ajouter au référentiel
-- (src/lib/health/blood-markers-reference.ts).

-- 1) Marqueurs les plus souvent NON RECONNUS (à ajouter au référentiel / comme alias)
select
  lower(trim(elem)) as raw_name,
  count(*) as occurrences
from extraction_logs,
     lateral jsonb_array_elements_text(coalesce(unmatched_markers, '[]'::jsonb)) as elem
group by 1
order by occurrences desc
limit 50;

-- 2) Corrections de NOM les plus fréquentes (raw_name → canonical choisi par l'utilisateur)
--    → candidats d'alias à ajouter à l'entrée canonique correspondante.
select raw_name, corrected_canonical, count(*) as n
from extraction_corrections
where corrected_canonical is not null
  and lower(trim(raw_name)) <> lower(trim(corrected_canonical))
group by raw_name, corrected_canonical
order by n desc
limit 50;

-- 3) Corrections d'UNITÉ les plus fréquentes (raw_unit → corrected_unit)
--    → candidats à ajouter à la table d'alias d'unités (UNIT_ALIASES) ou unitAliases.
select raw_unit, corrected_unit, count(*) as n
from extraction_corrections
where corrected_unit is not null
  and coalesce(lower(trim(raw_unit)), '') <> coalesce(lower(trim(corrected_unit)), '')
group by raw_unit, corrected_unit
order by n desc
limit 50;

-- 4) Qualité globale des imports dans le temps (confiance moyenne, % à faible confiance)
select
  date_trunc('day', created_at) as jour,
  count(*) as imports,
  round(avg(global_confidence)::numeric, 2) as confiance_moyenne,
  sum(low_confidence_count) as marqueurs_faible_confiance,
  sum(markers_count) as marqueurs_total
from extraction_logs
group by 1
order by 1 desc
limit 30;

-- 5) Laboratoires les plus problématiques (confiance moyenne la plus basse)
select
  coalesce(lab_name, '(inconnu)') as laboratoire,
  count(*) as imports,
  round(avg(global_confidence)::numeric, 2) as confiance_moyenne
from extraction_logs
group by 1
having count(*) >= 2
order by confiance_moyenne asc
limit 30;
