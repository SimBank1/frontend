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