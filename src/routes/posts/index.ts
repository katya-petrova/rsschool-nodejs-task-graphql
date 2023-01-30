import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    return reply.send(fastify.db.posts.findMany());
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const post = await fastify.db.posts.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (!post) {
        return reply.code(404).send({ message: 'Post not found' });
      }

      return reply.send(post);
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: request.body.userId,
      });

      if (!user) {
        return reply.status(404).send({ message: 'User not found' });
      }

      const newPost = await fastify.db.posts.create(request.body);

      return reply.send(newPost);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const post = await fastify.db.posts.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (!post) {
        return reply.code(400).send({ message: 'Post not found' });
      }

      const postToDelete = await fastify.db.posts.delete(request.params.id);
      try {
        return reply.send(postToDelete);
      } catch (error) {
        return reply.code(400).send({ message: error });
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      try {
        const updatedPost = await fastify.db.posts.change(
          request.params.id,
          request.body
        );
        return reply.send(updatedPost);
      } catch (error) {
        return reply.code(400).send({ message: (error as Error).message });
      }
    }
  );
};

export default plugin;
