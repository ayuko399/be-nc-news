## Setting Up Environment Variables

This project requires two `.env` files to connect to the databases:

- `.env.development` for the development database.
- `.env.test` for the testing database.

### Steps:

1. Create two files in the root of the project:
   - `.env.development`
   - `.env.test`
2. Add this line to eachi file: `PGDATABASE=YOUR_DATABASE_NAME`, replacing `YOUR_DATABASE_NAME` with the correct name found in `/db/setup.sql`
