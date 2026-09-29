# AGENTS.md

Alle Hinweise für KI-Agenten stehen in [CLAUDE.md](CLAUDE.md). Das gilt für jedes Werkzeug, nicht
nur für Claude.

Kurzfassung:

- App startet aus `index.html` über `file://`: keine ES-Module, kein `fetch`, keine Abhängigkeiten.
- Keine urheberrechtlich geschützten Lieder, Notenfotos oder Verlagsangaben committen. Private Lieder
  liegen in `local/` (gitignored).
- Vor dem Abschluss: `npm test`, `npm run lint`, `npm run format:check`.
