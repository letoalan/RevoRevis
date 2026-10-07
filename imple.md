# Plan d'implémentation — site 4 pages (Vite + GitHub Pages), niveau Première générale
## Stack
Vite vanilla JS (ou multi-page), HTML/CSS, Mermaid (schémas heuristiques), pas de backend.
## Arborescence
```
revolution/
 index.html  p1.html  p2.html  p3.html  p4.html
 vite.config.js  package.json
 src/main.js  src/style.css  src/audio.js
 public/assets/mp3/p1.mp3 p2.mp3 p3.mp3 p4.mp3
 public/assets/img/ (images locales, crédits dans credits.json)
 .github/workflows/deploy.yml
```
## vite.config.js (compatible GitHub Pages)
```js
import { defineConfig } from 'vite';
import { resolve } from 'path';
export default defineConfig({
  base: '/NOM-DU-DEPOT/',
  build: { rollupOptions: { input: {
    main: resolve(__dirname,'index.html'),
    p1: resolve(__dirname,'p1.html'), p2: resolve(__dirname,'p2.html'),
    p3: resolve(__dirname,'p3.html'), p4: resolve(__dirname,'p4.html') } } }
});
```
Note : le dossier demandé « asset/mp3 » — je recommande `public/assets/mp3/` (servi tel quel par Vite) ; référencer via `import.meta.env.BASE_URL + 'assets/mp3/p1.mp3'`.
## Déploiement
GitHub Actions : actions/checkout, setup-node, `npm ci`, `npm run build`, upload-pages-artifact (dist), deploy-pages ; Settings > Pages > Source : GitHub Actions.
## Modèle de page (x4)
1. En-tête : titre, frise de dates, lecteur audio `<audio controls preload="none" src=...>` avec transcription repliable.
2. Question guide + 3 idées clés (carte mentale).
3. Schéma heuristique Mermaid (causes → événements → conséquences).
4. Tableau synthétique (date / événement / acteurs / portée).
5. Tableau comparatif.
6. Galerie d'images (Commons / Carnavalet, avec légende et licence) + document court à commenter.
7. Quiz de 5 questions (JSON, correction locale) et lexique.
## Contenu par page
- P1 (1789-91) : schéma « Ancien Régime en crise → Assemblée nationale → monarchie constitutionnelle » ; tableau comparatif Ancien Régime / Constitution de 1791 (souveraineté, pouvoirs, droit de vote, religion).
- P2 (1791-92) : schéma Varennes → guerre → 10 août ; tableau Feuillants / Girondins / Jacobins / sans-culottes.
- P3 (1793-94 + Directoire) : schéma « périls (guerre, Vendée, crise) → Terreur » ; tableau institutions de la Terreur ; tableau Convention montagnarde / thermidorienne / Directoire ; carte Grande Nation.
- P4 (1799-1815) : schéma Brumaire → masses de granit ; tableau comparatif Consulat / Empire ; carte Europe 1812.
## Images suggérées (à valider licence)
Jeu de paume (David), prise de la Bastille, Varennes, prise des Tuileries, Mort de Marat, Intérieur d'un comité révolutionnaire (Commons), Sacre (David), Austerlitz (Gérard). Stocker en local (WebP, <200 Ko) plutôt qu'en hotlink.
## Accessibilité et pédagogie
Texte alternatif, contraste, polices ≥16 px, vocabulaire de niveau Première, transcription audio, navigation clavier, mobile first.
## Feuille de route
1. Initialiser Vite + 4 pages. 2. Gabarit commun + lecteur audio. 3. Contenu textes/tableaux. 4. Schémas Mermaid. 5. Images + credits.json. 6. Podcasts (placer mp3). 7. Tests mobile/accessibilité. 8. Déploiement Pages.
