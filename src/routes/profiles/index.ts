// import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
// import { idParamSchema } from '../../utils/reusedSchemas';
// import { createProfileBodySchema, changeProfileBodySchema } from './schema';
// import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

// const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
//   fastify
// ): Promise<void> => {
//   fastify.get('/', async function (request, reply): Promise<
//     ProfileEntity[]
//   > {});

//   fastify.get(
//     '/:id',
//     {
//       schema: {
//         params: idParamSchema,
//       },
//     },
//     async function (request, reply): Promise<ProfileEntity> {}
//   );

//   fastify.post(
//     '/',
//     {
//       schema: {
//         body: createProfileBodySchema,
//       },
//     },
//     async function (request, reply): Promise<ProfileEntity> {}
//   );

//   fastify.delete(
//     '/:id',
//     {
//       schema: {
//         params: idParamSchema,
//       },
//     },
//     async function (request, reply): Promise<ProfileEntity> {}
//   );

//   fastify.patch(
//     '/:id',
//     {
//       schema: {
//         body: changeProfileBodySchema,
//         params: idParamSchema,
//       },
//     },
//     async function (request, reply): Promise<ProfileEntity> {}
//   );
// };

// export default plugin;
