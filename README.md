NC News API

Overview
NC News is a RESTful API that serves as the backend for a news feed website, similar to Reddit. It provides endpoints for articles, comments, users, and topics, enabling users to read, post, and interact with content. The API is built using Node.js, Express, and PostgreSQL, and returns data in JSON format.

The API is hosted at: https://nc-news-mojb.onrender.com/api

## Setup Instructions

Prerequisites:

- Node.js
- PostgreSQL

Installation:

1. Clone the Repository
   `git clone https://github.com/ayuko399/be-nc-news.git`
   `cd be-nc-news`

2. Install
   `npm install`

3. Create two. env files in the rood directory. Make sure these files are listed in .gitignore so they don’t get pushed to GitHub.

- `.env.development` for the development database.
- `.env.test` for the testing database.

4. Add this line to each of the file above:

- `PGDATABASE=YOUR_DATABASE_NAME`, replacing `YOUR_DATABASE_NAME` with the correct name found in `/db/setup.sql`

5. Setup the database and seed data

- `npm run setup-dbs`
- `npm run seed`

6. Run tests

- `npm test`

API Documentation

A complete list of available endpoints can be found by making a GET request to /api.
Example endpoints:

- GET /api/topics
- GET /api/articles
- GET /api/articles/:article_id
- GET /api/articles/:article_id/comments
- POST /api/articles/:article
