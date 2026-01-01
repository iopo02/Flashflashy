# Admin Configuration

This directory contains admin configuration files.

## admin.js (Gitignored - DO NOT COMMIT)

Contains the hardcoded admin user ID. This file is **gitignored** and should never be committed to version control.

**To set up:**
1. Copy the example file: `cp config/admin.js.example config/admin.js`
2. Replace `YOUR_ADMIN_USER_ID_HERE` with your actual admin user ID
3. Or set the `ADMIN_USER_ID` environment variable in your `.env` file

**Admin User Information:**
- Stored locally in `admin.js` (gitignored)
- Can also be set via `ADMIN_USER_ID` environment variable

## admin.js.example

A safe template file that can be committed to version control. Contains no sensitive information.

## Security Note

The admin user ID can be set via:
1. Environment variable: `ADMIN_USER_ID` in `.env` file
2. Hardcoded in `config/admin.js` (gitignored)

Only the specific admin user ID has admin privileges. The middleware checks for this ID before checking the database `isAdmin` flag.

## Ensuring Admin Status

To ensure the admin user has the `isAdmin` flag set in the database, run:

```bash
npm run ensure-admin
```

or

```bash
node scripts/ensure-admin.js
```

This script will:
1. Connect to MongoDB
2. Find the admin user by ID
3. Set their `isAdmin` flag to `true` if it's not already set

