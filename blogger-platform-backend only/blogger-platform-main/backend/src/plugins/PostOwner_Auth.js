import fastifyPlugin from 'fastify-plugin';
import BlogPost from '../schemas/Blog.js'

async function PostOwner_Auth(fastify, opts) {
    fastify.decorate('authorizePostOwner', async function (request, reply) {
        const { id } = request.params; 
        const userId = request.user.id; 

        const blogPost = await BlogPost.findById(id);

        if (!blogPost) {
            reply.code(404).send({ error: 'Blog post not found' });
            return;
        }

        if (blogPost.author.toString() !== userId) {
            reply.code(403).send({ error: 'You are not authorized to modify this blog post' });
            return;
        }

    });
}

export default fastifyPlugin(PostOwner_Auth);
