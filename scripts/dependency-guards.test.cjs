'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const deepmerge = require('deepmerge');

test('deepmerge rejects prototype keys from either input, including null-prototype targets', () => {
  const hostile = JSON.parse('{"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}},"prototype":{"polluted":true},"safe":1}');
  for (const target of [{}, Object.create(null), hostile]) {
    const merged = deepmerge(target, hostile);
    assert.equal(Object.getPrototypeOf(merged), Object.prototype);
    assert.equal(merged.polluted, undefined);
    assert.equal(Object.hasOwn(merged, '__proto__'), false);
    assert.equal(Object.hasOwn(merged, 'constructor'), false);
    assert.equal(Object.hasOwn(merged, 'prototype'), false);
    assert.equal(merged.safe, 1);
  }
  assert.equal({}.polluted, undefined);
});

test('hardened merge preserves nested values, symbols, array merging and the Jest all API', () => {
  const symbol = Symbol('config');
  const source = { nested: { b: 2 }, list: [2], [symbol]: 'value' };
  const result = deepmerge.all([{ nested: { a: 1 }, list: [1] }, source]);
  assert.deepEqual(result.nested, { a: 1, b: 2 });
  assert.deepEqual(result.list, [1, 2]);
  assert.equal(result[symbol], 'value');
  assert.notEqual(result.nested, source.nested);
  assert.deepEqual(deepmerge([1], [2], { arrayMerge: (_, source) => source }), [2]);
});

test('Jimp can decode a real PNG through the patched file-type adapter', async () => {
  const Jimp = require('jimp');
  const png = await new Jimp(10, 10, 'white').getBufferAsync(Jimp.MIME_PNG);
  assert.deepEqual(await require('file-type').fromBuffer(png), { ext: 'png', mime: 'image/png' });
  const decoded = await Jimp.read(png);
  assert.equal(decoded.bitmap.width, 10);
  assert.equal(decoded.bitmap.height, 10);
});

test('malformed ASF with a zero-size sub-header cannot hang file detection', () => {
  const run = spawnSync(process.execPath, ['-e', `
    const buffer = Buffer.alloc(55);
    Buffer.from('3026b2758e66cf11a6d900aa0062ce6c', 'hex').copy(buffer);
    require('file-type').fromBuffer(buffer).then(result => {
      require('node:assert/strict').equal(result, undefined);
    }).catch(error => { console.error(error); process.exitCode = 1; });
  `], { cwd: process.cwd(), encoding: 'utf8', timeout: 5000 });
  assert.ifError(run.error);
  assert.equal(run.status, 0, run.stderr);
});

test('minimatch bounds globpart amplification and still matches ordinary patterns', () => {
  const run = spawnSync(process.execPath, ['-e', `
    const { Minimatch, minimatch, makeRe } = require('minimatch');
    const assert = require('node:assert/strict');
    const matcher = new Minimatch('a/**/../b/'.repeat(18) + 'x', { optimizationLevel: 2, braceExpandMax: 64 });
    assert.ok(matcher.globParts.length <= 64);
    assert.ok(minimatch('src/app/test.ts', 'src/**/*.ts'));
    assert.ok(makeRe('src/**/*.ts').test('src/app/test.ts'));
    assert.ok(require('minimatch')('src/app/test.ts', 'src/**/*.ts'));
  `], { cwd: process.cwd(), encoding: 'utf8', timeout: 5000 });
  assert.ifError(run.error);
  assert.equal(run.status, 0, run.stderr);
});

test('the patched ESM minimatch exports remain usable by ESLint', async () => {
  const { makeRe, Minimatch } = await import('minimatch');
  assert.ok(makeRe('src/**/*.js').test('src/app/test.js'));
  const matcher = new Minimatch('a/**/../b/'.repeat(18) + 'x', { optimizationLevel: 2, braceExpandMax: 64 });
  assert.ok(matcher.globParts.length <= 64);
});

test('glob stops filesystem traversal when an in-flight request is aborted', async () => {
  const fs = require('node:fs');
  const { glob } = require('glob');
  const directory = mkdtempSync(join(tmpdir(), 'sudoq-glob-'));
  const controller = new AbortController();
  let readsAfterAbort = 0;
  let reads = 0;
  try {
    for (let i = 0; i < 5; i++) {
      mkdirSync(join(directory, String(i)));
      writeFileSync(join(directory, String(i), 'file.js'), '');
    }
    const guardedFs = {
      ...fs,
      readdir(path, options, callback) {
        reads++;
        if (controller.signal.aborted) readsAfterAbort++;
        return fs.readdir(path, options, (error, entries) => {
          controller.abort();
          callback(error, entries);
        });
      },
    };
    await assert.rejects(glob('**/*', { cwd: directory, fs: guardedFs, signal: controller.signal }), { name: 'AbortError' });
    await new Promise(resolve => setTimeout(resolve, 30));
    assert.ok(reads > 0);
    assert.equal(readsAfterAbort, 0);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
