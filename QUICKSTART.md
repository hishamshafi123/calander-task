# Quick Start Guide

## The App is Already Running! 🎉

Your Life Organization 2026 app is now running at: **http://localhost:3000**

Open this URL in your browser to start using the app!

## What's Already Set Up

✅ Next.js application with TypeScript
✅ SQLite database (file: `prisma/dev.db`)
✅ 10 default categories (Physical, Money, Education, etc.)
✅ Sample task created
✅ Development server running on port 3000

## Current Features Available

### 1. Calendar View (Main Page)
- View tasks in a monthly calendar layout
- See today highlighted with blue ring
- Tasks color-coded by status
- Sample task "Morning workout" visible on today's date

### 2. Status Board (`/status`)
- Kanban-style board with 4 columns:
  - ⭕ Not Started
  - ⏳ Waiting
  - 🔄 In Progress
  - ✅ Completed
- Drag tasks between columns (coming soon)
- View task counts per status

### 3. Settings (`/settings`)
- Configure week start day (Sunday/Monday)
- Set default view (Month/Week/Day)
- Toggle completed tasks visibility
- View all 10 categories with their colors

### 4. Dark Mode
- Click the moon/sun icon in the header to toggle dark mode
- Setting persists in the database

## Database Information

Currently using **SQLite** for easy local development. The database file is located at:
```
/Users/macbookpro/google sheet len/life-org-2026/prisma/dev.db
```

## Switching to PostgreSQL

If you want to use PostgreSQL instead of SQLite:

1. **Install PostgreSQL** (if not installed):
   ```bash
   brew install postgresql@14
   brew services start postgresql@14
   ```

2. **Create the database**:
   ```bash
   psql postgres
   CREATE DATABASE lifeorg2026;
   \q
   ```

3. **Update `prisma/schema.prisma`**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

4. **Update `.env`**:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lifeorg2026?schema=public"
   ```

5. **Push schema and seed**:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

## Managing the Development Server

### Stop the server:
Press `Ctrl + C` in the terminal

### Start again:
```bash
cd "/Users/macbookpro/google sheet len/life-org-2026"
npm run dev
```

## Useful Commands

```bash
# View database in GUI
npm run db:studio

# Reset database
npx prisma db push --force-reset
npm run db:seed

# Build for production
npm run build
npm start
```

## Next Steps

1. **Explore the app** - Open http://localhost:3000
2. **Add tasks** - Click "New Task" button (coming soon) or add via database
3. **Customize categories** - Modify in Settings page
4. **Test dark mode** - Toggle in header
5. **View Kanban board** - Navigate to Status Board

## File Locations

- **Application**: `/Users/macbookpro/google sheet len/life-org-2026`
- **Database**: `/Users/macbookpro/google sheet len/life-org-2026/prisma/dev.db`
- **Environment**: `/Users/macbookpro/google sheet len/life-org-2026/.env`

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a task
- `PATCH /api/tasks/[id]` - Update a task
- `DELETE /api/tasks/[id]` - Delete a task
- `GET /api/categories` - Get all categories
- `GET /api/settings` - Get settings
- `PATCH /api/settings` - Update settings

## Troubleshooting

### Port 3000 already in use?
```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Database errors?
```bash
# Reset and recreate
rm -f prisma/dev.db
npx prisma db push
npm run db:seed
```

---

**Enjoy your new task management app!** 🚀
