#!/bin/bash

echo "Setting up PostgreSQL database for Life Organization 2026..."

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Please install PostgreSQL first."
    echo "You can install it via: brew install postgresql@14"
    exit 1
fi

# Create database
echo "Creating database lifeorg2026..."
psql -U postgres -c "CREATE DATABASE lifeorg2026;" 2>/dev/null || echo "Database might already exist, continuing..."

echo "Database setup complete!"
echo ""
echo "Now run the following commands:"
echo "1. npx prisma db push    # Push schema to database"
echo "2. npm run db:seed       # Seed initial data"
echo "3. npm run dev           # Start development server"
