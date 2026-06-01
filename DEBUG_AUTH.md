# Auth Debug Guide

## Setup

1. **Redémarre le serveur:**
```bash
pnpm dev
```

2. **Ouvre DevTools:**
   - Appuie sur `F12`
   - Onglet **Console** (pour voir les logs du navigateur)
   - Onglet **Application → Cookies → localhost:3000** (pour voir les cookies)

3. **Vide les cookies:**
   - Dans Application → Cookies, clique droit → Delete All Cookies
   - Recharge la page (F5)

## Test Sign Up

1. Va à `http://localhost:3000/auth/signup`
2. Remplis le formulaire:
   - Email: `test@example.com`
   - Password: `Test1234`
   - Accepte les CGU
3. Clique **Créer mon compte**

### Logs Attendus dans la Console (F12)

Tu devrais voir:
```
[signup] start { email: 'test@example.com' }
[signup] result { data: {...}, error: null }
[signup] success, redirecting to /onboarding
```

### Logs Attendus dans le Terminal (pnpm dev)

```
[proxy] pathname: /auth/signup
[proxy] public route, allowing
[proxy] pathname: /onboarding
[proxy] hasSession: true
[proxy] allowing request
```

### Cookies Attendus (Application → Cookies)

Après signup, tu dois voir un cookie qui commence par `sb-` (ex: `sb-xxxx-auth-token`)

## Test Sign In

1. Va à `http://localhost:3000/auth/signin`
2. Remplis le formulaire:
   - Email: `test@example.com`
   - Password: `Test1234`
3. Clique **Se connecter**

### Logs Attendus dans la Console (F12)

```
[signin] start { email: 'test@example.com' }
[signin] result { data: {...}, error: null }
[signin] success, checking profile
[signin] profile { first_name: 'Guillaume', ... }
[signin] redirecting to /dashboard
```

Si pas de profile:
```
[signin] profile null
[signin] redirecting to /onboarding
```

### Logs Attendus dans le Terminal (pnpm dev)

```
[proxy] pathname: /auth/signin
[proxy] public route, allowing
[proxy] pathname: /dashboard
[proxy] hasSession: true
[proxy] allowing request
```

## Common Issues

### ❌ "Connexion..." ne finit jamais

**Cause probable:** Erreur Supabase non catchée

**Solution:**
- Regarde la console F12 pour l'erreur `[signin] error caught`
- Vérifie que l'email/password sont corrects dans Supabase Auth
- Vérifie que `.env.local` contient `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### ❌ Console affiche l'erreur mais pas de redirection

**Cause probable:** Pas de session cookie créé

**Solution:**
- Vérifie dans Application → Cookies qu'un cookie `sb-*-auth-token` existe
- Si absent: problème de configuration Supabase SSR
- Redémarre pnpm dev après avoir corrigé `.env.local`

### ❌ Aucun log [signin] dans la console

**Cause probable:** handleSubmit n'est pas appelé ou formulaire ne valide pas

**Solution:**
- Vérifie que le bouton a bien `type="submit"`
- Vérifie qu'il n'y a pas d'erreur de validation (rouge sous les champs)
- Teste directement dans la console: `document.querySelector('form').dispatchEvent(new Event('submit'))`

### ❌ Log [signin] s'affiche mais pas de redirection

**Cause probable:** router.push() ne fonctionne pas

**Solution:**
- Ajoute un console.log("router.push called") dans signin après router.push()
- Vérifie que l'import est bien `from 'next/navigation'`
- Pas `from 'next/router'` (qui n'existe plus)

## Prochaines Étapes

Une fois que signup + signin fonctionnent:

1. **Vérifie l'onboarding:**
   - Après signup, tu dois arriver sur `/onboarding`
   - Remplis le formulaire 3 étapes
   - Tu dois arriver sur `/dashboard`

2. **Vérifie le dashboard:**
   - En bas de la sidebar, tu dois voir ton email
   - Clique **Déconnexion** pour tester le logout
   - Tu dois revenir à `/auth/signin`

3. **Vérifie la persistence:**
   - Signe-toi (signin fonctionne)
   - Recharge la page (F5)
   - Tu dois rester sur `/dashboard` (session persiste)

## Questions?

Colle les logs [signin] / [proxy] ici et je diagnostique.
