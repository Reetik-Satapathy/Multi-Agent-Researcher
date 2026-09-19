# React + TypeScript + Vite

## Backend integration

Start the Python backend API from the project root:

```bash
cd backend
source ../.venv/bin/activate
PYTHONPATH=src uvicorn knowledge_discovery.api:app --reload --port 8000
```

Install and start the frontend from another terminal:

```bash
cd frontend
npm ci
npm run dev
```

The frontend uses `http://localhost:8000` by default. Set
`VITE_API_BASE_URL` in a `.env.local` file when the API runs elsewhere.

### Fish shell

Fish treats `PATH` as a list. Do not use Bash syntax such as
`export PATH=/path/to/node/bin:$PATH`, because it can remove `/usr/bin` and
cause npm's `spawn sh ENOENT` error. Restore a complete PATH and start Vite:

```fish
set -gx PATH /home/reet/.local/node-v22.14.0-linux-x64/bin /home/reet/.local/bin /usr/local/sbin /usr/local/bin /usr/sbin /usr/bin /sbin /bin
cd frontend
npm run dev
```

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
