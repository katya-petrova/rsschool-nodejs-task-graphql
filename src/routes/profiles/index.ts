import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<ProfileEntity[]> {
    return reply.send(fastify.db.profiles.findMany());
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profile = await fastify.db.profiles.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (!profile) {
        return reply.code(404).send({ message: 'Profile not found' });
      }

      return reply.send(profile);
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const memberType = await fastify.db.memberTypes.findOne({
        key: 'id',
        equals: request.body.memberTypeId,
      });

      if (!memberType) {
        throw fastify.httpErrors.badRequest('Member type not found');
      }

      const profileExists = await fastify.db.profiles.findOne({
        key: 'userId',
        equals: request.body.userId,
      });

      if (profileExists) {
        throw fastify.httpErrors.badRequest('User already has a profile');
      }

      const profile = await fastify.db.profiles.create(request.body);

      return profile;
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      try {
        const deleteProfile = await fastify.db.profiles.delete(
          request.params.id
        );

        return reply.send(deleteProfile);
      } catch (error) {
        return reply.code(400).send({ message: error });
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      try {
        const updatedProfile = await fastify.db.profiles.change(
          request.params.id,
          request.body
        );
        return reply.send(updatedProfile);
      } catch (error) {
        return reply.code(400).send({ message: error });
      }
    }
  );
};

export default plugin;
