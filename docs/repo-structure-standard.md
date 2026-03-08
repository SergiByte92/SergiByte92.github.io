# Repository Naming and Structure Standard

## Naming Convention
- Public repositories: `kebab-case`, English, semantic.
- Avoid: `prueba`, `ejercicio`, `final-final`, `v2`, `test123`.

## Recommended Repository Names
- `meeting-point-transit`
- `parkvault`
- `controlcenter-mapsui`
- `gemelo-digital-engine`
- `sergi-garcia-portfolio`
- `dam-learning` (private)
- `sandbox-lab` (private)

## Minimal Structure (main repositories)
```txt
/
|-- src/
|-- tests/
|-- docs/
|   |-- architecture.md
|   |-- decisions/
|-- screens/
|-- .editorconfig
|-- .gitignore
|-- LICENSE
|-- README.md
```

## .gitignore Rules
- .NET:
  - `bin/`
  - `obj/`
  - `.vs/`
  - `*.user`
  - `TestResults/`
- WPF/OpenGL:
  - Temporary assets and local cache directories
- Static portfolio:
  - `.vercel/`
  - editor/OS artifacts

## License Policy
- Public main repositories: `MIT`
- Private learning repositories: no mandatory public license
