import { test } from 'tap';
import { build } from '../helper';
import { getMemberType } from '../utils/requests';

test('member-types', async (t) => {
  const app = await build(t);

  await t.test(
    'GET /member-types/:id => failure; fake params.id',
    async (t) => {
      const { res: resReceivedMT } = await getMemberType(app, 'fakeId');

      t.ok(resReceivedMT.statusCode === 404);
    }
  );

  await t.test(
    'PATCH /member-types/:id => failure; fake params.id',
    async (t) => {
      const resPatchMT = await app.inject({
        url: `/member-types/fakeId`,
        method: 'PATCH',
        payload: {},
      });

      t.ok(resPatchMT.statusCode === 400);
    }
  );

  await t.test('PATCH /member-types/:id => success', async (t) => {
    const changedDiscount = 1;
    await app.inject({
      url: `/member-types/basic`,
      method: 'PATCH',
      payload: {
        discount: changedDiscount,
      },
    });

    const { body: receivedMT } = await getMemberType(app, 'basic');

    t.ok(receivedMT.discount === changedDiscount);
  });
});
