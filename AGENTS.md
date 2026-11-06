# Codebase Knowledge Graph

This project uses codebase-memory-mcp. Prefer `search_graph`, `trace_path`,
`get_code_snippet`, `query_graph`, and `get_architecture` for code discovery.
Use text/file search for configuration, strings, logs, or insufficient graph results.

# Project checks

- Run `./scripts/test.sh` for backend, frontend, architecture and integration checks.
- Run `./scripts/test-e2e.sh` for the complete Docker/browser acceptance suite.
- Use `DOCKER_TESTS=1` when the host has no .NET/Node installation.
- Keep backend and frontend gates at >=95% lines and >=90% branches.
- Do not exclude hand-written application code to raise coverage.
- Keep service domains and databases independent; share technical contracts only.
- Never commit `.env`, `.local`, signing keys or test artifacts.
