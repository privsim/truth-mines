# truth-mines

Meta transparency on the entire project build:

Multi-agent conversation threads between Sonnet4.5 and gpt5pro to brainstorm and converge on ideas and direction then to create the PRD.md with 5pro.

Initial message to a planning mode instance of claude-code sonnet4.5 with 1 mil context window:
```
We are just beginning this truth-mines project. The only file in the folder is presently the PRD.md which I am also including at the end of this message.

Your job in this session:

1. Read and internalize the PRD.
2. Break the entire project down into a ROADMAP suitable for GitHub:
   - Epics (aligned with the Milestones in the PRD).
   - Under each epic, concrete GitHub issues / tasks.
3. For EVERY GitHub issue you define, include:
   - Title
   - Short description
   - Dependencies (other issues, if any)
   - Definition of Done (clear, testable)
   - Test Plan (for strict TDD): list of specific tests that must exist and pass.

Important process constraints:

- We will use a fully spec-driven approach and **strict TDD** for everything.
- No production code should be written without at least one failing test specified and then implemented first.
- MVP must respect the PRD non-goals:
  - No mandatory RDF/OWL/JSON-LD as core storage.
  - No mandatory BFO/DOLCE/SUMO alignment.
  - No external graph DBs (Neo4j, Kùzu, etc.) in MVP.
  - Single-user, no complex auth/multi-tenant logic in MVP.

Tech constraints and expectations:

- Canonical storage:
  - Git repository + JSON/JSONL files, with optional Markdown notes.
- Engine:
  - Rust library compiled to WASM (wasm-bindgen / wasm-pack).
  - Pure Rust graph core with strong unit and integration tests.
- Frontend:
  - React + TypeScript + Vite.
  - 2D overview using cosmos.gl or similar GPU force graph (WebGL).
  - 3D “truth mine” view using WebGPU (or Three.js WebGPU renderer as a stepping stone).
- Scripts:
  - Python 3.11+ for validation/build.
  - Optional: @toon-format/cli for TOON conversion.
- Target environments: Linux/macOS (no Windows-specific instructions).

Testing expectations (strict TDD):

- Rust:
  - Unit tests colocated with modules.
  - Integration tests under `tests/`.
  - Use `cargo test` as the primary Rust test runner.
- Frontend:
  - Component tests with Vitest + React Testing Library.
  - At least one basic end-to-end flow test (e.g. Playwright/Cypress) for the main graph exploration path.
- Scripts:
  - Pure functions where possible.
  - Golden-file / snapshot tests for JSON → TOON and manifest generation.

Please also:

- Propose a repo folder structure for:
  - Rust engine / WASM, including how to organize the GraphStore and layout logic.
  - `web/` React app.
  - `scripts/` and `dist/`.
- Propose coding conventions:
  - Naming conventions for ids, domains, relations.
  - Linting/formatting tools (`rustfmt`, `clippy`, ESLint, Prettier).
- Define a CI plan as GitHub issues:
  - GitHub Actions workflows that:
    - Run all tests (Rust, frontend, scripts).
    - Run the graph validation script on every push/PR.
    - Build the web app.
    - Optionally build WASM artifacts.

If you think any change to the PRD itself is necessary, do NOT silently change it. Instead, propose an ADR (Architecture Decision Record) with:

- Context
- Decision
- Consequences

and treat those as separate issues under an “Architecture / ADRs” epic.

Below is the current PRD.md in full:

⸻

PRD.md's content
```
