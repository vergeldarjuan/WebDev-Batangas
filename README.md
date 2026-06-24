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

For the first run, build the images and start the services:

```bash
docker compose up --build
```

For normal runs after the image has been built:

```bash
docker compose up
```

Use `--build` again only after changing a `Dockerfile`, package dependencies, or other image dependencies. Changes to mounted React, HTML, CSS, JavaScript, and PHP files do not require rebuilding.

Open the React frontend at:

```text
http://localhost:5173
```

The old static frontend is still available at:

```text
http://localhost:8080/frontend/
```

The PHP API is available under:

```text
http://localhost:8080/api/
```

MySQL is exposed to the host on port `3307`.

Code changes are mounted into the containers, so React, HTML, CSS, JavaScript, and PHP updates appear after refreshing the browser.

## Listing images

Seed/demo listing images are kept in:

```text
backend/uploads/listings
```

Inside Docker, uploaded listing images are served from:

```text
http://localhost:8080/uploads/listings/
```

The upload folder uses a Docker volume so Apache can write images on Windows, macOS, Linux, and WSL. If image upload fails after changing Docker settings, rebuild and recreate the web container:

```bash
docker compose down
docker compose up -d --build
```

## React frontend

The React version is in:

```text
frontend/react
```

Docker runs the React dev server, PHP backend, and MySQL together:

```bash
docker compose up --build
```

Open the React app at:

```text
http://localhost:5173
```

React calls the backend through `/api`. Inside Docker, Vite proxies those requests to the PHP service.

You can still run React directly on your machine if you prefer:

```bash
cd frontend/react
npm install
npm run dev
```

If PowerShell blocks `npm`, use `npm.cmd` instead:

```powershell
npm.cmd install
npm.cmd run dev
```

Apache is also configured to expose the PHP APIs under:

```text
http://localhost:8080/api/
```

Rebuild the images after changing Apache, Dockerfile, or package settings:

```bash
docker compose up --build
```

Create a production build with:

```bash
cd frontend/react
npm run build
```

## Database

MySQL runs inside Docker. On the first start, it uses these files:

- `backend/database/schema.sql`
- `backend/database/seed.sql`

The seed data includes these test accounts:

```text
Admin
Email: admin@example.com
Password: password

User
Email: user@example.com
Password: password
```

To reset the local database and load the schema/seed files again:

```bash
docker compose down --volumes
docker compose up --build
```

## Current pages

- Main tourism page for showcasing Batangas
- Listings page for rentals and booking requests
- User page for profile details and booking management
- Admin page for booking status and listing management

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
