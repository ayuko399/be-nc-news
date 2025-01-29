const endpointsJson = require("../endpoints.json");
const app = require("../app");
const testData = require("../db/data/test-data/index");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const request = require("supertest");
require("jest-sorted");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("should respond with an array of topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics.length).toBeGreaterThan(0);
        topics.forEach((topic) => {
          expect.objectContaining({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles/:article", () => {
  test("should respond with the specific article by id", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toEqual(
          expect.objectContaining({
            article_id: 1,
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          })
        );
      });
  });
  test("should respond with 404 if the article_id does not exist", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
  test("should respond with 400 for invalid article_id", () => {
    return request(app)
      .get("/api/articles/not-a-number")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: Invalid input");
      });
  });
});

describe("GET /api/articles", () => {
  test("should respond with an array of articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;

        expect(articles.length).toBe(13);

        articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              body: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });
  test("should be sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("should respond with comments for the specified article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments.length).toBeGreaterThan(0);
        comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: 1,
            })
          );
        });
      });
  });
  test("should respond with 404 if the article_id does not exist", () => {
    return request(app)
      .get("/api/articles/9999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
  test("should respond with 400 if the article_id input is invalid", () => {
    return request(app)
      .get("/api/articles/not-a-number/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: Invalid input");
      });
  });
  test("should respond with an empty array if the article exists but has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(Array.isArray(comments)).toBe(true);
        expect(comments.length).toBe(0);
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("should add a new comment to the corresponding article specified by id", () => {
    const testComment = {
      username: "butter_bridge",
      body: "This is a body of the test comment",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(testComment)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment.author).toBe("butter_bridge");
        expect(comment.body).toBe("This is a body of the test comment");
      });
  });
  test("should respond with 400 for missing required fields", () => {
    const testComment = {
      username: "butter_bridge",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: missing required fields");
      });
  });
  test("should respond with 400 for invalid data types for article-id", () => {
    const testComment = {
      username: "butter_bridge",
      body: "This is a body of the test comment",
    };
    return request(app)
      .post("/api/articles/not-a-number/comments")
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: Invalid input");
      });
  });
  test("404: responds with error when username does not exist", () => {
    const testComment = {
      username: "non_existent_user",
      body: "This is a body of the test comment",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(testComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Username not found");
      });
  });
  test("responds with 404 when article_id does not exist", () => {
    const testComment = {
      username: "butter_bridge",
      body: "This is a body of the test comment",
    };
    return request(app)
      .post("/api/articles/9999/comments")
      .send(testComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("should update the votes count by the given amount", () => {
    const updateVotes = { inc_votes: 1 };

    return request(app)
      .patch("/api/articles/1")
      .send(updateVotes)
      .expect(201)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          article_id: 1,
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: 101,
          article_img_url: expect.any(String),
        });
      });
  });
  test("should respond with 404 if the article does not exist", () => {
    const updateVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/9999")
      .send(updateVotes)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
  test("should respond with 400 for invalid article_id", () => {
    const updateVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/not-a-number")
      .send(updateVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: Invalid input");
      });
  });
  test("should respond with 400 if the input is invalid", () => {
    const updateVotes = { inc_votes: "abc" };
    return request(app)
      .patch("/api/articles/1")
      .send(updateVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: Invalid input");
      });
  });
  test("should respond with 400 if there is no input", () => {
    const updatedVotes = {};
    return request(app)
      .patch("/api/articles/1")
      .send(updatedVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: missing required fields");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("should delete a comment specified by id", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });
  test("should respond with 404 if the article does not exist", () => {
    return request(app)
      .delete("/api/comments/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment not found");
      });
  });
  test("should respond with 400 if the comment_id is invalid input", () => {
    return request(app)
      .delete("/api/comments/not-a-number")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: Invalid input");
      });
  });
});

describe("GET /api/users", () => {
  test("should respond with an array of users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(users.length).toBe(4);

        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
  test("responds with 404 for incorrect endpoint spelling", () => {
    return request(app)
      .get("/api/usars")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Path not found");
      });
  });
});

describe("GET /api/articles(sorting queries)", () => {
  test("serves an array of articles sorted by created_at descending as default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("serves an array of articles sorted by a valid column in the valid given order", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("title", { descending: false });
      });
  });
  test("responds with 400 for invalid sort_by column", () => {
    return request(app)
      .get("/api/articles?sort_by=not_valid")
      .expect(400)
      .expect(({ body }) => {
        expect(body.msg).toBe("Bad request: Invalid sort_by column");
      });
  });
  test("responds with 400 for invalid oder value", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=not_valid")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request: Invalid order value");
      });
  });
});

describe("GET /api/articles(topic query)", () => {
  test("serves an array of articles with the topics specified", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        console.log(body, "<<<<<<<<<<<<body from test");
        const { articles } = body;
        expect(articles.length).toBe(12);

        articles.forEach((article) => {
          expect(article).toMatchObject({
            title: expect.any(String),
            topic: "mitch",
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          });
        });
      });
  });
  test("responds with 400 for invalid filter category", () => {
    return request(app)
      .get("/api/articles?title=mitch")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid query parameter");
      });
  });
  test("responds with 200 with empty array when topic exists but has no articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toEqual([]);
      });
  });
});
