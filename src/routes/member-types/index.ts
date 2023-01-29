// import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
// import { idParamSchema } from '../../utils/reusedSchemas';
// import { changeMemberTypeBodySchema } from './schema';
// import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

// const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
//   fastify
// ): Promise<void> => {
//   fastify.get('/', async function (request, reply): Promise<
//     MemberTypeEntity[]
//   > {});

//   fastify.get(
//     '/:id',
//     {
//       schema: {
//         params: idParamSchema,
//       },
//     },
//     async function (request, reply): Promise<MemberTypeEntity> {}
//   );

//   fastify.patch(
//     '/:id',
//     {
//       schema: {
//         body: changeMemberTypeBodySchema,
//         params: idParamSchema,
//       },
//     },
//     async function (request, reply): Promise<MemberTypeEntity> {}
//   );
// };

// export default plugin;
