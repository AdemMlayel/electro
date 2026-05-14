# ElectroFix - PHP + JavaScript Project

ElectroFix is a dynamic web application built to satisfy the course requirement for a `PHP + JS` project with user features, administration features, uploads, and statistics.

## Final Stack

- Backend: PHP 8.3
- Frontend: Next.js / TypeScript
- Database: PostgreSQL
- Active backend files: `backend/src` and `backend/public`

## Requirement Mapping

- User registration: `/register`
- User login: `/login`
- Consult account: `/dashboard/profile`
- Reserve a service: `/dashboard/new-ticket`
- Manage clients: `/admin/users`
- Manage services with upload: `/admin/appliances`
- Manage reservations: `/admin/tickets`
- Display statistics: `/admin`

## Main Entities

- `users`
- `appliances` (service categories)
- `problem_types`
- `tickets` (reservations / service bookings)

This covers more than the minimum number of entities required beyond `USER`.

## Run With Docker

1. Copy `.env.template` to `.env` if needed.
2. Start the project:

```powershell
docker compose up --build
```

3. Open:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

## Demo Accounts

- Admin: `adminadmin@test.com` / `adminadmin`
- Technician: `testtechnician@test.com` / `testtechnician`

## Notes

- The admin catalog includes image upload support to satisfy the mandatory upload requirement.
- The project uses Git and is ready for commit-based collaboration.
