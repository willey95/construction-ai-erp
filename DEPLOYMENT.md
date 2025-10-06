# Deployment Guide - Netlify

## Current Status
✅ Application deployed to: https://willaierp.netlify.app

## Database Setup Required

Your app needs database connections to function. Follow these steps:

### Option 1: Quick Setup with Neon (Recommended - Free Tier Available)

1. **Create a Neon PostgreSQL Database** (Free)
   - Go to https://neon.tech
   - Sign up and create a new project
   - Copy the connection string (looks like: `postgresql://user:pass@ep-xxx.region.neon.tech/dbname`)

2. **Add to Netlify Environment Variables**
   ```bash
   # Method 1: Using Netlify CLI
   netlify env:set DATABASE_URL "your-neon-connection-string"

   # Method 2: Using Netlify Dashboard
   # Go to: Site settings > Environment variables > Add a variable
   # Key: DATABASE_URL
   # Value: your-neon-connection-string
   ```

3. **Run Prisma Migrations**
   ```bash
   # Set the DATABASE_URL in your local .env
   DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy

   # Seed the database
   DATABASE_URL="your-neon-connection-string" npm run db:seed
   ```

4. **Redeploy**
   ```bash
   netlify deploy --prod
   ```

### Option 2: Full Setup with Neo4j (For All Features)

If you want the ontology/knowledge graph features:

1. **Create Neo4j Database** (Free tier at https://neo4j.com/cloud/aura/)
   - Sign up and create a new database
   - Save the credentials

2. **Add ALL environment variables to Netlify**
   ```bash
   netlify env:set DATABASE_URL "your-postgres-connection-string"
   netlify env:set NEO4J_URI "neo4j+s://xxx.databases.neo4j.io"
   netlify env:set NEO4J_USERNAME "neo4j"
   netlify env:set NEO4J_PASSWORD "your-password"
   ```

3. **Run migrations and redeploy**
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   netlify deploy --prod
   ```

### Option 3: Local Development Only

If you just want to test locally without deploying:

1. **Keep your local .env file**
2. **Run locally**
   ```bash
   npm run dev
   # Access at http://localhost:3000
   ```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string for Prisma |
| `NEO4J_URI` | ⚠️ Optional | Neo4j connection URI (for ontology features) |
| `NEO4J_USERNAME` | ⚠️ Optional | Neo4j username |
| `NEO4J_PASSWORD` | ⚠️ Optional | Neo4j password |

## Quick Fix Commands

```bash
# 1. Set up Neon database
netlify env:set DATABASE_URL "postgresql://user:pass@ep-xxx.neon.tech/dbname"

# 2. Deploy migrations
DATABASE_URL="your-connection-string" npx prisma migrate deploy

# 3. Seed data
DATABASE_URL="your-connection-string" npm run db:seed

# 4. Redeploy
netlify deploy --prod
```

## Troubleshooting

### Error: "Application error: a client-side exception has occurred"
- **Cause**: Missing DATABASE_URL environment variable
- **Solution**: Add DATABASE_URL to Netlify environment variables and redeploy

### Error: "Cannot fetch data from service"
- **Cause**: Database connection string is incorrect
- **Solution**: Verify the connection string works locally first

### Check deployment logs
```bash
netlify logs
```

## Alternative Database Providers

- **Neon** (Recommended): https://neon.tech - Serverless PostgreSQL, free tier
- **Supabase**: https://supabase.com - PostgreSQL + Auth, free tier
- **Railway**: https://railway.app - PostgreSQL, $5/month
- **Vercel Postgres**: https://vercel.com/storage/postgres - Serverless PostgreSQL

## Next Steps

1. ✅ Choose a database provider (Neon recommended)
2. ✅ Get connection string
3. ✅ Add to Netlify environment variables
4. ✅ Run migrations
5. ✅ Redeploy
6. ✅ Access https://willaierp.netlify.app
