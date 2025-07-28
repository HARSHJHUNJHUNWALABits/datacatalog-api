# PostgreSQL Setup Guide

## 🐘 **PostgreSQL Configuration**

The application has been updated to use PostgreSQL instead of SQLite. Here's how to set it up:

### **Option 1: Using Docker (Recommended)**

1. **Start the application with PostgreSQL:**
   ```bash
   docker-compose up --build
   ```
   This will start both PostgreSQL and the API service.

### **Option 2: Local PostgreSQL Installation**

1. **Install PostgreSQL:**
   - **macOS**: `brew install postgresql`
   - **Ubuntu**: `sudo apt-get install postgresql postgresql-contrib`
   - **Windows**: Download from https://www.postgresql.org/download/windows/

2. **Start PostgreSQL service:**
   ```bash
   # macOS
   brew services start postgresql
   
   # Ubuntu
   sudo systemctl start postgresql
   ```

3. **Create the database:**
   ```bash
   createdb rudderstack_data_catalog_dev
   createdb rudderstack_data_catalog_test
   ```

4. **Create a `.env` file:**
   ```bash
   cp env.example .env
   ```

5. **Run migrations:**
   ```bash
   npm run migrate
   ```

### **Environment Variables**

Create a `.env` file with these settings:

```env
# Application Configuration
NODE_ENV=development
PORT=3000

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=rudderstack_data_catalog_dev
DB_NAME_TEST=rudderstack_data_catalog_test

# Logging Configuration
LOG_LEVEL=info

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **Key Changes Made**

1. **Database Client**: Changed from `sqlite3` to `pg` (PostgreSQL)
2. **Connection**: Updated to use PostgreSQL connection parameters
3. **Data Types**: 
   - `validation_rules` now uses `JSONB` instead of `TEXT`
   - `events` now uses `JSONB` instead of `TEXT`
4. **Search**: Updated to use `ILIKE` for case-insensitive search
5. **Docker**: Added PostgreSQL service to docker-compose

### **Benefits of PostgreSQL**

- ✅ **Better Performance**: Optimized for complex queries
- ✅ **JSONB Support**: Native JSON data type with indexing
- ✅ **ACID Compliance**: Full transaction support
- ✅ **Scalability**: Better for production workloads
- ✅ **Advanced Features**: Full-text search, JSON operators, etc.

### **Testing the Setup**

Once PostgreSQL is running:

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Test the health endpoint:**
   ```bash
   curl http://localhost:3000/health
   ```

3. **Create a test event:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/events \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Event",
       "type": "track",
       "description": "A test event"
     }'
   ```

The application will now store data in PostgreSQL instead of SQLite! 🎉 