import { test } from 'tap';
import { build } from '../helper';
import { createUser, createProfile, getProfile } from '../utils/requests';

test('profiles', async (t) => {
  const app = await build(t);

  await t.test('GET /profiles/:id => failure; fake params.id', async (t) => {
    const { res: resReceivedProfile } = await getProfile(app, 'fakeId');

    t.ok(resReceivedProfile.statusCode === 404);
  });

  await t.test('POST /profiles => failure; fake body.userId', async (t) => {
    const { res: resCreateProfile } = await createProfile(
      app,
      'fakeId',
      'basic'
    );

    t.ok(resCreateProfile.statusCode === 400);
  });

  await t.test(
    'POST /profiles => failure; fake body.memberTypeId',
    async (t) => {
      const { body: user1 } = await createUser(app);
      const { res: resCreateProfile1 } = await createProfile(
        app,
        user1.id,
        'fakeId'
      );

      t.ok(resCreateProfile1.statusCode === 400);
    }
  );

  await t.test('POST /profiles => success', async (t) => {
    const { body: user1 } = await createUser(app);
    const { body: profile1 } = await createProfile(app, user1.id, 'basic');

    const { body: receivedProfile1 } = await getProfile(app, profile1.id);
    t.ok(profile1.id === receivedProfile1.id);
  });

  await t.test(
    'POST /profiles => failure; user already has a profile',
    async (t) => {
      const { body: user1 } = await createUser(app);
      await createProfile(app, user1.id, 'basic');
      const { res: resCreateProfile1 } = await createProfile(
        app,
        user1.id,
        'basic'
      );

      t.ok(resCreateProfile1.statusCode === 400);
    }
  );

  await t.test('PATCH /profiles/:id => failure; fake params.id', async (t) => {
    const resPatchProfile = await app.inject({
      url: `/profiles/fakeId`,
      method: 'PATCH',
      payload: {},
    });

    t.ok(resPatchProfile.statusCode === 400);
  });

  await t.test('PATCH /profiles/:id => success', async (t) => {
    const { body: user1 } = await createUser(app);
    const { body: profile1 } = await createProfile(app, user1.id, 'basic');

    const changedCity = 'Svetlogorsk';
    const changedMemberTypeId = 'business';
    await app.inject({
      url: `/profiles/${profile1.id}`,
      method: 'PATCH',
      payload: {
        city: changedCity,
        memberTypeId: changedMemberTypeId,
      },
    });

    const { body: receivedProfile1 } = await getProfile(app, profile1.id);
    t.ok(
      receivedProfile1.city === changedCity &&
        receivedProfile1.memberTypeId === changedMemberTypeId
    );
  });

  await t.test('DELETE /profiles/:id => failure; fake params.id', async (t) => {
    const resDeleteProfile = await app.inject({
      url: `/profiles/fakeId`,
      method: 'DELETE',
    });

    t.ok(resDeleteProfile.statusCode === 400);
  });

  await t.test('DELETE /profiles/:id => success', async (t) => {
    const { body: user1 } = await createUser(app);
    const { body: profile1 } = await createProfile(app, user1.id, 'basic');

    await app.inject({
      url: `/profiles/${profile1.id}`,
      method: 'DELETE',
    });

    const { res: resReceivedProfile1 } = await getProfile(app, profile1.id);
    t.ok(resReceivedProfile1.statusCode === 404);
  });
});
