## Requirements

- Docker Desktop on Windows or macOS
- Docker Engine with Docker Compose on Linux
- WSL users must enable their distro under Docker Desktop's WSL integration settings

Verify the installation:

```bash
docker --version
docker compose version
```

## Run the project

For the first run, build the PHP image and start the services:

```bash
docker compose up --build
```

For normal runs after the image has been built:

```bash
docker compose up
```

Use `--build` again only after changing the `Dockerfile` or other image dependencies. Changes to mounted HTML, CSS, JavaScript, and PHP files do not require rebuilding.

Open the frontend at:

```text
http://localhost:8080/frontend/
```

The PHP API is available under:

```text
http://localhost:8080/backend/api/
```

MySQL is exposed to the host on port `3307`.

Code changes are mounted into the web container, so HTML, CSS, JavaScript, and PHP updates appear after refreshing the browser.

## Current pages

- Main page for showcasing Batangas
- Listings page for rentals and bookable services
- User page for profile details and bookings
- Admin page for managing users, listings, and listing images

## Stop the project

When Compose is running in the terminal, press `Ctrl+C`.

To run in the background:

```bash
docker compose up -d
```

Stop background containers with:

```bash
docker compose down
```
