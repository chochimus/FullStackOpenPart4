const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper.test");
const api = supertest(app);
const bcrypt = require("bcrypt");

const Blog = require("../models/blog");
const User = require("../models/user");

describe("when there is initially some blogs saved", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    await Blog.insertMany(helper.initialBlogs);
  });

  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("there are two blogs", async () => {
    const response = await api.get("/api/blogs");

    assert.strictEqual(response.body.length, helper.initialBlogs.length);
  });

  test("blog has id property instead of _id", async () => {
    const response = await api.get("/api/blogs");
    const blogs = response.body;
    assert(blogs.length === helper.initialBlogs.length);
    const blog1 = blogs[0];
    assert("id" in blog1);
  });

  describe("addition of new blog", () => {
    test("post successfully creates new blog", async () => {
      const newBlog = {
        title: "post test",
        author: "tester",
        url: "testurl",
        likes: 0,
      };

      await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const response = await api.get("/api/blogs");
      const { id, ...foundBlog } = response.body.find(
        (r) => r.title === "post test"
      );
      assert.strictEqual(response.body.length, helper.initialBlogs.length + 1);
      assert.deepStrictEqual(foundBlog, newBlog);
    });
    test("blog with likes not defined defaults to 0", async () => {
      const newBlog = {
        title: "likes test",
        author: "no likes",
        url: "test likes",
      };

      await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const response = await api.get("/api/blogs");
      const { likes } = response.body.find((r) => r.title === "likes test");
      assert.strictEqual(likes, 0);
    });

    test("blog with no title or url is not added", async () => {
      const noTitleBlog = {
        author: "no title",
        url: "no title",
      };

      await api.post("/api/blogs").send(noTitleBlog).expect(400);

      const response1 = await api.get("/api/blogs");
      assert.strictEqual(response1.body.length, helper.initialBlogs.length);

      const noUrlBlog = {
        title: "no url",
        author: "no url",
      };

      await api.post("/api/blogs").send(noUrlBlog).expect(400);

      const response2 = await api.get("/api/blogs");
      assert.strictEqual(response2.body.length, helper.initialBlogs.length);
    });
  });

  describe("deletion of a blog", () => {
    test("succeeds with statuscode 204 if id is valid", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToDelete = blogsAtStart[0];

      await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);

      const titles = blogsAtEnd.map((r) => r.title);
      assert(!titles.includes(blogToDelete.title));
    });
  });
  describe("edit of a blog", () => {
    test("succeeds with a copy of the new note in response", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToEdit = blogsAtStart[0];

      const updatedBlog = {
        title: "test blog",
        author: "test author",
        url: "test url",
        likes: 1,
      };
      await api
        .put(`/api/blogs/${blogToEdit.id}`)
        .send(updatedBlog)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);

      const { id, ...editedBlog } = blogsAtEnd.find(
        (blog) => blog.id === blogToEdit.id
      );

      assert.deepStrictEqual(editedBlog, updatedBlog);
    });
  });
});

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("secret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "chochimus",
      name: "Aaron Hoyos",
      password: "password",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "somebody",
      password: "password",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert(result.body.error.includes("expected `username` to be unique"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test("retreive correct number of users", async () => {
    const usersAtStart = await helper.usersInDb();
    const result = await api
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /application\/json/);
    assert.strictEqual(usersAtStart.length, result.body.length);
  });
});

after(async () => {
  await mongoose.connection.close();
});
