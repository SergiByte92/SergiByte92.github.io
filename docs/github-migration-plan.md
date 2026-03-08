# GitHub Migration Plan - Sergi Garcia

## Goal
Build a clean public GitHub signal:
- Few repositories
- Strong technical documentation
- Backend-first narrative

## Public Surface (Target)
Pinned repositories (ordered):
1. `meeting-point-transit`
2. `parkvault`
3. `controlcenter-mapsui`
4. `gemelo-digital-engine`
5. `sergi-garcia-portfolio`

## Migration Actions
1. Rename `curriculumPrueba` to `sergi-garcia-portfolio`.
2. Publish curated versions of the four core private projects.
3. Consolidate learning material into private `dam-learning`.
4. Move temporary experiments to private `sandbox-lab`.
5. Archive or privatize low-signal public repositories.

## Classification Matrix
| Repo / Group | Class | Action | Final Visibility |
|---|---|---|---|
| `curriculumPrueba` | Main project | Rename + cleanup links/copy | Public + pinned |
| `TypeScript*`, `TScode` | Learning | Consolidate under `dam-learning/typescript/` | Private |
| `pruebaM03*`, `pruebaFicherosBinaris1` | Learning | Move to `dam-learning/m03/` | Private |
| `SC_M06_UF2_PR01_Sergi_Garcia` | Learning | Move to `dam-learning/security/` | Private |
| `SKILL.md` | Sandbox | Move useful bits to `sandbox-lab` | Private/archived |
| `ParkVault` | Main project | Curate + publish README/screens/docs | Public + pinned |
| `ControlCenter` | Main project | Curate + publish architecture docs | Public + pinned |
| `GemeloDigital` | Main project | Curate + publish demo + docs | Public + pinned |
| `Proyecto Final` | Main project | Publish as `meeting-point-transit` | Public + pinned |

## Acceptance Criteria
- Max 5 public repositories emphasized.
- No repository named `prueba`, `ejercicio`, `test`, `v2-final`.
- Every public project has:
  - README with problem, architecture, setup, trade-offs
  - `docs/` and `screens/` directories
  - Clean `.gitignore`
