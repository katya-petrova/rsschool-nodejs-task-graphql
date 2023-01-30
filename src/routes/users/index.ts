import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    return reply.send(fastify.db.users.findMany());
  });
  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (!user) {
        return reply.code(404).send({ message: 'User not found' });
      }

      return reply.send(user);
    }
  );
  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const newUser = await fastify.db.users.create(request.body);

      return reply.send(newUser);
    }
  );
  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (!user) {
        throw fastify.httpErrors.badRequest('User not found');
      }

      const userPosts = await fastify.db.posts.findMany({
        key: 'userId',
        equals: request.params.id,
      });

      for (const post of userPosts) {
        await fastify.db.posts.delete(post.id);
      }

      const userProfile = await fastify.db.profiles.findOne({
        key: 'userId',
        equals: request.params.id,
      });

      if (userProfile) {
        await fastify.db.profiles.delete(userProfile.id);
      }

      const userFollowers = await fastify.db.users.findMany({
        key: 'subscribedToUserIds',
        inArray: request.params.id,
      });

      for (const follower of userFollowers) {
        const followerUserIndex = follower.subscribedToUserIds.indexOf(
          request.params.id
        );

        follower.subscribedToUserIds.splice(followerUserIndex, 1);

        await fastify.db.users.change(follower.id, {
          subscribedToUserIds: follower.subscribedToUserIds,
        });
      }

      const deletedUser = await fastify.db.users.delete(request.params.id);

      return deletedUser;
    }
  );
  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: request.body.userId,
      });
      const userToFollow = await fastify.db.users.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (!user || !userToFollow) {
        throw fastify.httpErrors.badRequest('User not found');
      }

      const alreadySubscribed = user.subscribedToUserIds.includes(
        request.params.id
      );

      if (alreadySubscribed) {
        return user;
      }

      const userTriesToSubscribeToHimself =
        request.body.userId === request.params.id;

      if (userTriesToSubscribeToHimself) {
        throw fastify.httpErrors.badRequest("You can't subscribe to yourself");
      }

      try {
        const patchedUser = await fastify.db.users.change(request.body.userId, {
          subscribedToUserIds: [...user.subscribedToUserIds, request.params.id],
        });

        return patchedUser;
      } catch (error) {
        return reply.code(400).send({ message: error });
      }
    }
  );
  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: request.body.userId,
      });
      const userToUnfollow = await fastify.db.users.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (!user || !userToUnfollow) {
        throw fastify.httpErrors.badRequest('User not found');
      }

      const notFollowedUser = user.subscribedToUserIds.includes(
        request.params.id
      );

      if (!notFollowedUser) {
        throw fastify.httpErrors.badRequest('You are not following this user');
      }

      const selfSubscribe = request.body.userId === request.params.id;

      if (selfSubscribe) {
        throw fastify.httpErrors.badRequest(
          "You can't unsubscribe from yourself"
        );
      }

      try {
        const subscribedIndex = user.subscribedToUserIds.indexOf(
          request.params.id
        );

        user.subscribedToUserIds.splice(subscribedIndex, 1);

        const patchedUser = await fastify.db.users.change(request.body.userId, {
          subscribedToUserIds: user.subscribedToUserIds,
        });

        return patchedUser;
      } catch (error) {
        return reply.code(400).send({ message: error });
      }
    }
  );
  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        const updatedUser = await fastify.db.users.change(
          request.params.id,
          request.body
        );
        return reply.send(updatedUser);
      } catch (error) {
        return reply.code(400).send({ message: error });
      }
    }
  );
};

export default plugin;
