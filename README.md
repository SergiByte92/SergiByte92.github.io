# Sergi Garcia Portfolio

Static portfolio prepared for Vercel and aligned with a backend-first GitHub strategy.

ES: Portfolio estatico enfocado en mostrar perfil backend real (.NET + Data + arquitectura limpia).

EN: Static portfolio focused on a real backend profile (.NET + Data + clean architecture).

## Live Scope
- Home with direct value proposition
- Four main project cards
- Stack visualization (bars + Mermaid + JSON contract)
- Engineering-focused "About"
- Contact section

## Run Local
```bash
python -m http.server 5500
```
Then open `http://localhost:5500`.

## Deploy (Vercel)
1. Keep `index.html`, `styles.css`, `app.js` at root.
2. Import repository in Vercel.
3. Framework preset: `Other`.
4. Build command: empty.
5. Output directory: root.

## Repo Structure
```txt
/
|-- index.html
|-- cv.html
|-- styles.css
|-- app.js
|-- data/
|   |-- stack-metrics.json
|-- docs/
|   |-- github-migration-plan.md
|   |-- repo-structure-standard.md
|   |-- stack-graph.md
|   |-- iterations-roadmap.md
|   |-- templates/
|       |-- README_MAIN_TEMPLATE.md
|-- screens/
|   |-- .gitkeep
|-- .editorconfig
|-- .gitignore
|-- LICENSE
```

## Migration Assets Included
- GitHub migration playbook: [docs/github-migration-plan.md](docs/github-migration-plan.md)
- Repo naming and structure policy: [docs/repo-structure-standard.md](docs/repo-structure-standard.md)
- README template for main repositories: [docs/templates/README_MAIN_TEMPLATE.md](docs/templates/README_MAIN_TEMPLATE.md)
- Stack graph payload and Mermaid snippet: [docs/stack-graph.md](docs/stack-graph.md)
- Iteration plan: [docs/iterations-roadmap.md](docs/iterations-roadmap.md)

## Author
Sergi Garcia - Barcelona  
GitHub: https://github.com/SergiByte92
