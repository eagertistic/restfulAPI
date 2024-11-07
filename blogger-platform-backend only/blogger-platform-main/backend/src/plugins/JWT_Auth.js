import fastifyPlugin from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";

async function JWT_Auth(fastify, opts) {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET,
  });

  fastify.addHook("preHandler", (request, reply, next) => {
    request.jwt = fastify.jwt;
    next();
  });

  fastify.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
    hook: "preHandler",
  });

  fastify.decorate("authenticate", async function (request, reply) {
    const token = request.cookies.access_token;
    if (!token) {
      return reply.code(401).send({ message: "Authentication required" });
    }

    const decoded = await request.jwt.verify(token);
    request.user = decoded;
  });

  fastify.decorateRequest("generateToken", function (user) {
    const payload = { id: user._id, name: user.name };
    return fastify.jwt.sign(payload);
  });

  fastify.decorateRequest("setCookie", function (reply, token) {
    reply.setCookie("access_token", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "Strict", // Prevent CSRF attacks
      maxAge: 3600, // Set expiration to 1 hour (3600 seconds)
    });
  });
}
export default fastifyPlugin(JWT_Auth);
