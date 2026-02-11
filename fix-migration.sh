#!/bin/bash

# Fix Prisma Migration Script
echo "🔧 Fixing Prisma Migration..."

# Step 1: Mark the migration as applied
echo "📝 Marking migration as applied..."
npx prisma migrate resolve --applied 20260211132055_new

# Step 2: Generate Prisma Client
echo "⚙️  Generating Prisma Client..."
npx prisma generate

# Step 3: Check migration status
echo "✅ Checking migration status..."
npx prisma migrate status

echo "🎉 Done! You can now run: npm run dev"
