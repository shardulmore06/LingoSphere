/*
# Allow public read access to languages table

## Why
The Languages page is public (no login required). The existing SELECT policy
on `languages` is scoped to `TO authenticated` only, so the anon-key frontend
receives zero rows when an unauthenticated visitor browses /languages.

## Change
- Add a new SELECT policy `select_languages_anon` for `TO anon, authenticated`.
- Drop the old `select_languages` policy to avoid redundancy.
- No other tables are touched. Write policies remain admin-only.
*/

DROP POLICY IF EXISTS "select_languages" ON public.languages;
DROP POLICY IF EXISTS "select_languages_anon" ON public.languages;

CREATE POLICY "select_languages_anon" ON public.languages FOR SELECT
  TO anon, authenticated USING (true);
