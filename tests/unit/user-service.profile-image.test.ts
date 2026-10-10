/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License,
version 3.
*/

import { describe, expect, test } from '@jest/globals';

import { createAuthContext } from '../../src/main/auth/auth-context';
import { UserService } from '../../src/main/services/UserService';

describe('UserService profile image validation', () => {
  test('rejects non-Buffer input before using it as image data', async () => {
    const service = new UserService();
    const saveProfileImage = Reflect.apply(service.saveProfileImage, service, [
      1,
      'not binary data',
      'image/png',
      createAuthContext(1, ['can-update-profile']),
    ]);

    await expect(saveProfileImage).rejects.toThrow('Invalid profile image data');
  });
});
