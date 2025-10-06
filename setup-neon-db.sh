#!/bin/bash
# Quick setup script for Neon database

echo "🚀 Setting up Neon Database"
echo ""
echo "Step 1: Go to https://console.neon.tech/signup"
echo "Step 2: Create a new project (free tier)"
echo "Step 3: Copy the connection string"
echo ""
echo "It will look like:"
echo "postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb"
echo ""
read -p "Paste your Neon connection string here: " NEON_URL

if [ -z "$NEON_URL" ]; then
    echo "❌ No connection string provided"
    exit 1
fi

# Update .env file
echo "DATABASE_URL=\"$NEON_URL\"" > .env
echo "✅ .env file updated"

# Run migrations
echo ""
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Seed database
echo ""
echo "🌱 Seeding database with sample data..."
npm run db:seed

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Add to Netlify: netlify env:set DATABASE_URL \"$NEON_URL\""
echo "2. Deploy: netlify deploy --prod"
