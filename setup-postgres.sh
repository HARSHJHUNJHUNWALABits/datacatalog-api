#!/bin/bash

# RudderStack Data Catalog API - Database Setup Script
# This script creates the PostgreSQL database and runs Knex migrations.

set -e

# Load environment variables from .env if present
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Set defaults if env vars are not set
DB_NAME=${DB_NAME:-rudderstack_data_catalog_dev}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

# Create the database if it does not exist
echo "Checking if database '$DB_NAME' exists..."
if psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  echo "Database '$DB_NAME' already exists."
else
  echo "Creating database '$DB_NAME'..."
  createdb -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" "$DB_NAME"
  echo "Database '$DB_NAME' created."
fi

echo "Running Knex migrations..."
npx knex migrate:latest --knexfile knexfile.ts --env development

echo "Database and tables are set up!" 