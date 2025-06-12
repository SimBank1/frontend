# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Docker

You can run the frontend without installing Node locally by using Docker.
Build and start the container using [Docker Compose](https://docs.docker.com/compose/):

```bash
docker compose up --build
```

Once the build completes, the app will be available at [http://localhost:5173](http://localhost:5173).

To rebuild the image after changing source files, pass the `--build` flag again:

```bash
docker compose up --build
```

You can change the exposed port by editing `docker-compose.yml` and modifying the
`5173:5173` mapping.