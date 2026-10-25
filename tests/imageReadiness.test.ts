import assert from 'node:assert/strict'
import { test } from 'node:test'
import { waitForImages } from '../src/components/imageReadiness.ts'

test('card readiness waits for every image to decode', async () => {
  let resolveFirst!: () => void
  let resolveSecond!: () => void
  const first = new Promise<void>(resolve => { resolveFirst = resolve })
  const second = new Promise<void>(resolve => { resolveSecond = resolve })
  let finished = false
  const ready = waitForImages([{ decode: () => first }, { decode: () => second }], new AbortController().signal)
    .then(() => { finished = true })
  resolveFirst()
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(finished, false)
  resolveSecond()
  await ready
  assert.equal(finished, true)
})

test('broken artwork and unsupported decoders do not lock a deal', async () => {
  await waitForImages([
    { decode: () => Promise.reject(new Error('Broken image')) },
    { decode: () => { throw new Error('Unsupported decode') } },
  ], new AbortController().signal)
})

test('restart releases a deal waiting on an image that never loads', { timeout: 1000 }, async () => {
  const controller = new AbortController()
  const ready = waitForImages([{ decode: () => new Promise(() => {}) }], controller.signal)
  controller.abort()
  await ready
})

test('an already cancelled deal does not begin decoding', async () => {
  const controller = new AbortController()
  controller.abort()
  let called = false
  await waitForImages([{ decode: async () => { called = true } }], controller.signal)
  assert.equal(called, false)
})
