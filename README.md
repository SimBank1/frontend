# SimBank Frontend 🌐

This is the React-based UI for **SimBank**. It connects to the backend service to simulate banking operations.

---

## 🔧 Requirements

- Node.js 18+
- npm or yarn
- Docker + Docker Compose (optional)

---

## 🚀 Run Without Docker

1. Install Node.js 18+.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The app runs at: [http://localhost:5173](http://localhost:5173)
4. Build for production:
   ```bash
   npm run build
   ```

---

## 🐳 Run With Docker

Build and start the container:

```bash
docker compose up --build
```

The app will be available at [http://localhost:5173](http://localhost:5173).

Use `--build` again whenever the code changes.

---

## 📁 Project Structure

| File/Folder           | Purpose                         |
|-----------------------|---------------------------------|
| `src/`                | React source code               |
| `index.html`          | Entry HTML                      |
| `Dockerfile`          | Build container image           |
| `docker-compose.yml`  | Run the app with Docker         |

---

## 🛠 Config

Adjust the backend URL in `src/server_link.js` and edit `vite.config.js` if you need a custom API endpoint.

---

## 📜 License

MIT