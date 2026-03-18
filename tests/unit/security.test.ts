/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import path from 'path';
import { safeJoin } from '../../src/main/security';

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

});