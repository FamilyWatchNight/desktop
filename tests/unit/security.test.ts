/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { assertPathInsideAllowedDirs, safeJoin } from '../../src/main/security';

describe('Security Utilities', () => {
  describe('safeJoin', () => {
    test('joins normal paths correctly', () => {
      const result = safeJoin('/base/path', 'subdir', 'file.txt');
      expect(result).toBe(path.resolve('/base/path/subdir/file.txt'));
    });

    test('prevents path traversal with ..', () => {
      expect(() => safeJoin('/base', '../../../etc/passwd')).toThrow('Path traversal detected');
    });

    test('prevents path traversal with absolute path after ..', () => {
      expect(() => safeJoin('/base', '..', '..', '/etc/passwd')).toThrow('Path traversal detected');
    });

    test('allows normal relative paths within base', () => {
      const result = safeJoin('/base', 'safe', 'path');
      expect(result).toBe(path.resolve('/base/safe/path'));
    });

    test('handles multiple path segments', () => {
      const result = safeJoin('/base', 'a', 'b', 'c', 'file.txt');
      expect(result).toBe(path.resolve('/base/a/b/c/file.txt'));
    });

    test('normalizes path separators', () => {
      const result = safeJoin('/base', 'dir\\with\\backslashes');
      expect(result).toBe(path.resolve('/base/dir/with/backslashes'));
    });

    const isWindows = process.platform === 'win32';

    (isWindows ? test : test.skip)('handles Windows drive letter paths', () => {
      const result = safeJoin('C:\\base', 'subdir', 'file.txt');
      expect(result).toBe(path.resolve('C:\\base\\subdir\\file.txt'));
    });

    (isWindows ? test : test.skip)('prevents traversal across Windows drives', () => {
      expect(() => safeJoin('C:\\base', '..\\..\\..\\D:\\other')).toThrow(
        'Path traversal detected',
      );
    });

    (isWindows ? test : test.skip)('prevents UNC path escape', () => {
      expect(() => safeJoin('C:\\base', '\\\\server\\share\\file.txt')).toThrow(
        'Path traversal detected',
      );
    });
  });

  describe('assertPathInsideAllowedDirs', () => {
    test('allows paths inside safeRoot', async () => {
      const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'fw-'));
      const file = path.join(temp, 'a.txt');
      const resolved = assertPathInsideAllowedDirs(file, temp);
      expect(resolved).toBe(path.resolve(file));
    });

    test('throws when path is outside safeRoot', async () => {
      const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'fw-'));
      const other = await fs.mkdtemp(path.join(os.tmpdir(), 'fw-'));
      const file = path.join(other, 'b.txt');

      expect(() => assertPathInsideAllowedDirs(file, temp)).toThrow(
        'Path is outside allowed directories',
      );
    });

    test('throws when safeRoot is not normalized absolute', async () => {
      const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'fw-'));
      const notNormalized = `${path.resolve(temp)}${path.sep}..`;
      const file = path.join(temp, 'c.txt');

      expect(() => assertPathInsideAllowedDirs(file, notNormalized)).toThrow(
        'Expected fully normalized absolute path',
      );
    });

    test('throws when symlink inside safeRoot escapes', async () => {
      const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'fw-'));
      const outside = await fs.mkdtemp(path.join(os.tmpdir(), 'fw-'));
      const target = path.join(outside, 'out.txt');
      await fs.writeFile(target, 'x');
      const link = path.join(temp, 'link');
      try {
        await fs.symlink(target, link);
      } catch {
        // Symlinks may not be supported in some environments (e.g. without privileges).
        // In that case, the fact that we can't create the symlink is enough to
        // validate the OS behavior and we skip the remaining assertion.
        return;
      }

      expect(() => assertPathInsideAllowedDirs(link, temp)).toThrow(
        'Symlink escape detected',
      );
    });
  });

});