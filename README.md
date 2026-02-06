# Life Organization 2026 - Task Management App

A beautiful, full-featured task management application built with Next.js, PostgreSQL, and TypeScript.

## Features

- **Visual Calendar** - Month/week/day views with color-coded tasks
- **Task Management** - Create, edit, complete, delete tasks
- **Status Organization** - Kanban board with drag-and-drop
- **Categories** - 10 default categories with custom colors
- **Dark Mode** - Toggle between light and dark themes
- **Mobile Responsive** - Works perfectly on all devices

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: Zustand
- **Date Utilities**: date-fns
- **Icons**: lucide-react

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Database Setup

### Option 1: Using PostgreSQL (Recommended)

1. **Install PostgreSQL** (if not already installed):
   ```bash
   # macOS (using Homebrew)
   brew install postgresql@14
   brew services start postgresql@14

   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib

   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create the database**:
   ```bash
   # Connect to PostgreSQL
   psql postgres

   # Create database
   CREATE DATABASE lifeorg2026;

   # Create user (if needed)
   CREATE USER postgres WITH PASSWORD 'postgres';
   GRANT ALL PRIVILEGES ON DATABASE lifeorg2026 TO postgres;

   # Exit
   \q
   ```

3. **Update .env file** (already created):
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lifeorg2026?schema=public"
   ```

### Option 2: Using Docker PostgreSQL

```bash
docker run --name lifeorg2026-db \
  -e POSTGRES_DB=lifeorg2026 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:14
```

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Push database schema**:
   ```bash
   npx prisma db push
   ```

4. **Seed the database with initial data**:
   ```bash
   npm run db:seed
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Seed database with initial data

## Project Structure

```
life-org-2026/
├── app/
│   ├── api/              # API routes
│   │   ├── tasks/        # Task CRUD endpoints
│   │   ├── categories/   # Category endpoints
│   │   └── settings/     # Settings endpoints
│   ├── status/           # Status board page
│   ├── settings/         # Settings page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page (calendar)
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # UI components
│   ├── calendar/         # Calendar views
│   ├── tasks/            # Task components
│   ├── status/           # Status board components
│   └── layout/           # Layout components
├── lib/
│   ├── prisma.ts         # Prisma client
│   ├── store.ts          # Zustand store
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
└── package.json
```

## Default Categories

The app comes with 10 pre-configured categories:

1. 💪 Physical
2. 💰 Money
3. 📚 Education
4. 🧹 Chores
5. ❤️ Health
6. 👥 Relationship
7. 🎨 Hobbies
8. 🎬 Entertainment
9. 📋 Life Admin
10. 🛒 Shopping

## Database Management

### View Database in Prisma Studio

```bash
npm run db:studio
```

Opens a GUI at [http://localhost:5555](http://localhost:5555) to view and edit your database.

### Reset Database

```bash
npx prisma db push --force-reset
npm run db:seed
```

## Troubleshooting

### PostgreSQL Connection Issues

If you get connection errors:

1. Check if PostgreSQL is running:
   ```bash
   brew services list  # macOS
   sudo systemctl status postgresql  # Linux
   ```

2. Verify connection details in `.env` file

3. Test connection:
   ```bash
   psql -U postgres -d lifeorg2026
   ```

### Port Already in Use

If port 3000 is already in use:

```bash
PORT=3001 npm run dev
```

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/lifeorg2026?schema=public"
```

## Contributing

This is a personal project, but feel free to fork and customize for your own use!

## License

MIT

---

**Built with ❤️ using Next.js and PostgreSQL**
