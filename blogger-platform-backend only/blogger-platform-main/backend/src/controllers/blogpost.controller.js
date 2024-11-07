import BlogPost from "../schemas/Blog.js";

// Function to create a new blog post
async function createBlogPost(request, reply) {
  try {
    const authorId = request.user.id;
    const newBlogPost = await BlogPost.create({
      ...request.body,
      author: authorId,
    });
    if (newBlogPost) reply.code(201).send(newBlogPost);
  } catch (error) {
    return reply.code(500).send({ error: "Failed to create blog posts" });
  }
}

// Function to get all blog posts
async function getAllBlogPosts(request, reply) {
  try {
    const blogPosts = await BlogPost.find({});
    return reply.code(200).send(blogPosts);
  } catch (error) {
    return reply.code(500).send({ error: "Failed to fetch blog posts" });
  }
}

// Function to get a blog post by ID
async function getBlogPostById(request, reply) {
  const { id } = request.params;

  try {
    const blogPost = await BlogPost.findById(id);
    if (!blogPost) {
      return reply.code(404).send({ error: "Blog post not found" });
    }
    return reply.code(200).send(blogPost);
  } catch (error) {
    return reply.code(500).send({ error: "Failed to fetch blog post" });
  }
}

// Function to update a blog post by ID
async function updateBlogPostById(request, reply) {
  const { id } = request.params;
  const { title, content, category, tags } = request.body;

  try {
    const updatedBlogPost = await BlogPost.findByIdAndUpdate(
      id,
      { title, content, category, tags },
      { new: true, runValidators: true }
    );

    if (!updatedBlogPost) {
      return reply.code(404).send({ error: "Blog post not found" });
    }

    return reply.code(200).send(updatedBlogPost);
  } catch (error) {
    return reply.code(500).send({ error: "Failed to update blog post" });
  }
}

// Function to delete a blog post by ID
async function deleteBlogPostById(request, reply) {
  const { id } = request.params;

  try {
    const deletedBlogPost = await BlogPost.findByIdAndDelete(id);

    if (!deletedBlogPost) {
      return reply.code(404).send({ error: "Blog post not found" });
    }

    return reply
      .status(200)
      .send({ message: "Blog post deleted successfully" });
  } catch (error) {
    return reply.code(500).send({ error: "Failed to delete blog post" });
  }
}

// Export the BlogPostController object
const BlogPostController = {
  createBlogPost,
  getAllBlogPosts,
  getBlogPostById,
  updateBlogPostById,
  deleteBlogPostById,
};

export default BlogPostController;
