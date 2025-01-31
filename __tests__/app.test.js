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
        const { articles } = body.articles;

        expect(articles.length).toBe(10);

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
        const { articles } = body.articles;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("should respond with comments for the specified article_id", () => {
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
        const { articles } = body.articles;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("serves an array of articles sorted by a valid column in the valid given order", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body.articles;
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
        const { articles } = body.articles;
        expect(articles.length).toBe(10);

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

describe("GET /api/articles/:article_id(comment_count)", () => {
  test("responds with comment_count = 0 when article has no comments", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article.comment_count).toBe(0);
      });
  });
});

describe("GET /api/users/:username", () => {
  test("serves a user object corresponding to the username input", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body }) => {
        const { user } = body;
        expect(user).toMatchObject({
          username: "butter_bridge",
          name: "jonny",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });
      });
  });
  test("reponds with 404 if the username does not exist", () => {
    return request(app)
      .get("/api/users/does_not_exist")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Username not found");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("updates the votes on a comment with the specified id", () => {
    const updateVotesParam = { inc_votes: 1 };
    return request(app)
      .patch("/api/comments/1")
      .send(updateVotesParam)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toMatchObject({
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 17,
          author: "butter_bridge",
          article_id: 9,
          created_at: expect.any(String),
        });
        expect(comment.votes).toBe(17);
      });
  });
  test("returns 404 if the comment_id does not exist", () => {
    const updateVotesParam = { inc_votes: 1 };
    return request(app)
      .patch("/api/comments/9999")
      .send(updateVotesParam)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment not found");
      });
  });
  test("returns 400 if the comment_id is invalid", () => {
    const updateVotesParam = { inc_votes: 1 };
    return request(app)
      .patch("/api/comments/not-a-number")
      .send(updateVotesParam)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: Invalid input");
      });
  });
  test("returns 400 if the input in the field is invalid", () => {
    const updateVotesParam = { inc_votes: "not-a-number" };
    return request(app)
      .patch("/api/comments/1")
      .send(updateVotesParam)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: Invalid input");
      });
  });
  test("returns 400 if the input in the field is missing", () => {
    const updateVotesParam = {};
    return request(app)
      .patch("/api/comments/1")
      .send(updateVotesParam)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: missing required fields");
      });
  });
});

describe("POST /api/articles", () => {
  test("posts a new article with the given inputs from the request body", () => {
    const newArticle = {
      title: "Test: Posting Article",
      topic: "mitch",
      author: "butter_bridge",
      body: "test body: this is a test body",
      article_img_url:
        "https://images.pexels.com/photos/47343/the-ball-stadion-horn-corner-47343.jpeg?w=700&h=700",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          article_id: expect.any(Number),
          title: "Test: Posting Article",
          topic: "mitch",
          author: "butter_bridge",
          body: "test body: this is a test body",
          created_at: expect.any(String),
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/47343/the-ball-stadion-horn-corner-47343.jpeg?w=700&h=700",
        });
      });
  });
  test("posts a new article with the default article_img_url if it is not provided", () => {
    const newArticle = {
      title: "Test: Posting Article",
      topic: "mitch",
      author: "butter_bridge",
      body: "test body: this is a test body",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          article_id: expect.any(Number),
          title: "Test: Posting Article",
          topic: "mitch",
          author: "butter_bridge",
          body: "test body: this is a test body",
          created_at: expect.any(String),
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("responds with 400 if there is missing required fields", () => {
    const newArticle = {
      topic: "mitch",
      author: "butter_bridge",
      body: "test body: this is a test body",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: missing required fields");
      });
  });
  test("responds with 404 if the author does not exist", () => {
    const newArticle = {
      topic: "mitch",
      author: "does_not_exist",
      body: "test body: this is a test body",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("username not found");
      });
  });
  test("responds with 404 if the topic does not exist", () => {
    const newArticle = {
      topic: "does_not_exist",
      author: "butter_bridge",
      body: "test body: this is a test body",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("topic not found");
      });
  });
});

describe("GET /api/articles(pagination)", () => {
  test("serves articles with the default of 10 articles with page 1", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body.articles;
        const { total_count } = body.articles;
        expect(articles.length).toBe(10);
        expect(total_count).toBe(10);
      });
  });
  test("serves articles with queries specifying the limit with the defaul page number 1", () => {
    return request(app)
      .get("/api/articles?limit=5")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body.articles;
        const { total_count } = body.articles;
        expect(articles.length).toBe(5);
        expect(total_count).toBe(5);
      });
  });
  test("serves articles with queries specifying the limit with the defaul page number 2", () => {
    return request(app)
      .get("/api/articles?limit=5&p=3")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body.articles;
        const { total_count } = body.articles;
        expect(articles.length).toBe(3);
        expect(total_count).toBe(3);
      });
  });
  test("serves articles with queries with default limit and page number, but with topic specified", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body.articles;
        const { total_count } = body.articles;
        expect(articles.length).toBe(10);
        expect(total_count).toBe(10);
      });
  });
  test("serves articles with queries specifying the limit and the topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch&limit=5")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body.articles;
        const { total_count } = body.articles;
        expect(articles.length).toBe(5);
        expect(total_count).toBe(5);
      });
  });
  test("serves articles with queries specifying the limit. page num, and the topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch&limit=5&p=3")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body.articles;
        const { total_count } = body.articles;
        expect(articles.length).toBe(2);
        expect(total_count).toBe(2);
      });
  });
  test("responds with 400 if invalid input for limit", () => {
    return request(app)
      .get("/api/articles?limit=not-a-number")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: Invalid input");
      });
  });
  test("responds with 400 if invalid input for page num", () => {
    return request(app)
      .get("/api/articles?p=not-a-number")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: Invalid input");
      });
  });
  test("responds with 400 if the page number is negative", () => {
    return request(app)
      .get("/api/articles?p=-10")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: Invalid input");
      });
  });
  test("responds with 400 if limit is negative", () => {
    return request(app)
      .get("/api/articles?limit=-10")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: Invalid input");
      });
  });

  test("responds with 400 if invalid input for limit", () => {
    return request(app)
      .get("/api/articles?topic=mitch&limit=not-a-number")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: Invalid input");
      });
  });
  test("responds with 400 if invalid input for page num", () => {
    return request(app)
      .get("/api/articles?topic=mitch&p=not-a-number")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: Invalid input");
      });
  });
  test("responds with 400 if the page number is negative", () => {
    return request(app)
      .get("/api/articles?topic=mitch&p=-10")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: Invalid input");
      });
  });
  test("responds with 400 if limit is negative", () => {
    return request(app)
      .get("/api/articles?topic=mitch&limit=-10")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: Invalid input");
      });
  });
  test("responds with an empty array for a page num beyond available articles", () => {
    return request(app)
      .get("/api/articles?limit=10&p=3")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toEqual([]);
      });
  });
  test("responds with an empty array for a page num beyond available articles with topic specified", () => {
    return request(app)
      .get("/api/articles?topic=mitch&limit=10&p=3")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toEqual([]);
      });
  });
});

describe("GET /api/articles/:article_id/comments (pagination)", () => {
  test("serves comments for the specified article with the default limit of 10 and p=1", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments.length).toBe(10);
      });
  });
  test("serves comments for the specified article with the specified limit", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments.length).toBe(5);
        comments.forEach((comment) => {
          expect(comment.article_id).toBe(1);
        });
      });
  });
  test("serves comments for the specified article with the specified limit", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5&p=3")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments.length).toBe(1);
        comments.forEach((comment) => {
          expect(comment.article_id).toBe(1);
        });
      });
  });
  test("responds with an empty array when the page num exceeds the available comments", () => {
    return request(app)
      .get("/api/articles/1/comments?p=5")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toEqual([]);
      });
  });
  test("responds with 400 if the input for limit is invalid", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=not-a-number")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: Invalid input");
      });
  });
  test("responds with 400 if the input for page num is invalid", () => {
    return request(app)
      .get("/api/articles/1/comments?p=not-a-number")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: Invalid input");
      });
  });
  test("responds with 400 if the input for page num is invalid", () => {
    return request(app)
      .get("/api/articles/1/comments?p=not-a-number")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: Invalid input");
      });
  });
  test("responds with 400 when query key is not valid", () => {
    return request(app)
      .get("/api/articles/1/comments?notvalid=1")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid query parameter");
      });
  });
});

describe.only("POST /api/topics", () => {
  test("posts a new topic", () => {
    const newTopic = { slug: "test topic", description: "test description" };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .then(({ body }) => {
        const { topic } = body;
        expect(topic).toMatchObject({
          slug: "test topic",
          description: "test description",
        });
      });
  });
  test("responds with 404 if the topic already exists", () => {
    const newTopic = { slug: "cats", description: "test description" };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("topic already exists");
      });
  });
  test("responds with 400 if there is a missing field", () => {
    const newTopic = { description: "test description" };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request: missing required fields");
      });
  });
});
