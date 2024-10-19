const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.length === 0
    ? 0
    : blogs.reduce((sumLikes, blog) => sumLikes + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  return blogs.length === 0
    ? {}
    : blogs.reduce((max, blog) => {
        return max.likes < blog.likes ? blog : max;
      });
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return {};
  }
  const authorTotals = blogs.reduce((authorTotalPost, blog) => {
    authorTotalPost[blog.author] = (authorTotalPost[blog.author] || 0) + 1;
    return authorTotalPost;
  }, {});
  const topAuthor = Object.keys(authorTotals).reduce((authorA, authorB) => {
    return authorTotals[authorA] > authorTotals[authorB] ? authorA : authorB;
  });
  return {
    author: topAuthor,
    blogs: authorTotals[topAuthor],
  };
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return {};
  }
  const authorLikes = blogs.reduce((authorTotalLikes, { author, likes }) => {
    authorTotalLikes[author] = (authorTotalLikes[author] || 0) + likes;
    return authorTotalLikes;
  }, {});
  const topAuthor = Object.keys(authorLikes).reduce((authorA, authorB) => {
    return authorLikes[authorA] > authorLikes[authorB] ? authorA : authorB;
  });
  return {
    author: topAuthor,
    likes: authorLikes[topAuthor],
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
