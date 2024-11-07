import BlogPostController from "../controllers/blogpost.controller.js";

export default async function blogRoutes(fastify) {
  // Route for getting all blog posts
  fastify.get("/", BlogPostController.getAllBlogPosts);

  // Route for getting a specific blog post by ID
  fastify.get("/:id", BlogPostController.getBlogPostById);

  // Route for creating a new blog post
  fastify.post(
    "/",
    { preHandler: [fastify.authenticate] },
    BlogPostController.createBlogPost
  );

  // Route for updating a blog post by ID
  fastify.put(
    "/:id",
    { preHandler: [fastify.authenticate, fastify.authorizePostOwner] },
    BlogPostController.updateBlogPostById
  );

  // Route for deleting a blog post by ID
  fastify.delete(
    "/:id",
    { preHandler: [fastify.authenticate, fastify.authorizePostOwner] },
    BlogPostController.deleteBlogPostById
  );
}
