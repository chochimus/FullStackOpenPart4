const Blog = require("../models/blog");
const User = require("../models/user");

const initialBlogs = [
  {
    title: "test blog",
    author: "test author",
    url: "test url",
    likes: 0,
  },
  {
    title: "test blog 2",
    author: "test author 2",
    url: "test url 2",
    likes: 0,
  },
];

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const nonExistingId = async () => {
  const blog = new Blog({ title: "yeah" });
  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

module.exports = {
  initialBlogs,
  blogsInDb,
  nonExistingId,
  usersInDb,
};
