# npm Scripts Guide

### `start`

- **Why:** Run the app in production (or locally without auto-reload).
- **How:** Uses Node with `--enable-source-maps` for better stack traces.

### `dev`

- **Why:** Run in development with auto-reload.
- **How:** Uses `nodemon --legacy-watch` for cross-platform file watching.

### `lint`

- **Why:** Ensure code quality.
- **How:** Runs `eslint . --fix` to catch and fix issues.

### `format`

- **Why:** Keep code style consistent.
- **How:** Runs `prettier -w .` to reformat files.

### `health`

- **Why:** Verify server is up in CI/CD, Docker, or Kubernetes.
- **How:** Sends a GET request to `/health`. Exits `0` if 200, else `1`.
