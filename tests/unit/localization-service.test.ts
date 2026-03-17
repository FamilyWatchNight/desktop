import fs from 'fs';
import os from 'os';
import path from 'path';
import { LocalizationService } from '../../src/main/services/LocalizationService';

describe('LocalizationService (missing-key persistence)', () => {
  let tempDir: string;
  let service: LocalizationService;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'locales-'));
    service = new LocalizationService(tempDir);
  });

  afterEach(() => {
    // clean up whatever we created
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  });

  it('creates a missing.json file and writes a simple key', async () => {
    await service.saveMissingKey('app', 'en', 'settings.importTmdb', 'Import from TMDB');

    const filePath = path.join(tempDir, 'en', 'app.missing.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);

    expect(parsed).toEqual({
      settings: {
        importTmdb: 'Import from TMDB',
      },
    });
  });

  it('merges sequential writes correctly', async () => {
    await service.saveMissingKey('app', 'en', 'settings.one', '1');
    await service.saveMissingKey('app', 'en', 'settings.two', '2');

    const filePath = path.join(tempDir, 'en', 'app.missing.json');
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    expect(parsed).toEqual({
      settings: {
        one: '1',
        two: '2',
      },
    });
  });

  it('handles concurrent writes of compound keys without losing any keys or corrupting JSON', async () => {
    // multiple keys which share a namespace to maximize chance of collisions
    const p1 = service.saveMissingKey('app', 'en', 'parent.child1.key1', 'value1');
    const p2 = service.saveMissingKey('app', 'en', 'parent.child1.key2', 'value2');
    const p3 = service.saveMissingKey('app', 'en', 'parent.child1.key3', 'value3');
    const p4 = service.saveMissingKey('app', 'en', 'parent.child2.key4', 'value4');
    const p5 = service.saveMissingKey('app', 'en', 'parent.child2.key5', 'value5');
    const p6 = service.saveMissingKey('app', 'en', 'parent.child2.key6', 'value6');

    // fire both at once and wait for them to complete
    await Promise.all([p1, p2, p3, p4, p5, p6]);

    const filePath = path.join(tempDir, 'en', 'app.missing.json');
    const raw = fs.readFileSync(filePath, 'utf-8');

    // should parse to valid JSON containing both keys
    const parsed = JSON.parse(raw);
    expect(parsed).toEqual({
      parent: {
        child1: {
          key1: 'value1',
          key2: 'value2',
          key3: 'value3',
        },
        child2: {
          key4: 'value4',
          key5: 'value5',
          key6: 'value6',
        },
      },
    });
  });

  it('rejects invalid parameters', async () => {
    await expect(service.saveMissingKey('invalid*name', 'en', 'key', 'value')).rejects.toThrow();
    await expect(service.saveMissingKey('app', 'bad lang', 'key', 'value')).rejects.toThrow();
    // non-string key/fallback
    // @ts-ignore
    await expect(service.saveMissingKey('app', 'en', 123, 456)).rejects.toThrow();
  });
});
