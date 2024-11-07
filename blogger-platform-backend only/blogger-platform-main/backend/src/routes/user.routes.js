import UserController from "../controllers/user.controller.js";

export default async function userRoutes(fastify) {
  // Route for getting all users
  fastify.get("/", UserController.getAllUsers);

  // Route for getting a specific user by ID
  fastify.get("/:id", UserController.getUserById);

  // Route for creating a new user
  fastify.post("/register", UserController.createUser);

  fastify.post("/login", UserController.login);

  fastify.delete(
    "/logout",
    { preHandler: [fastify.authenticate] },
    UserController.logout
  );

  // Route for updating a user by ID
  fastify.put(
    "/:id",
    { preHandler: [fastify.authenticate] },
    UserController.updateUser
  );

  // Route for deleting a user by ID
  fastify.delete(
    "/:id",
    { preHandler: [fastify.authenticate] },
    UserController.deleteUser
  );
}
