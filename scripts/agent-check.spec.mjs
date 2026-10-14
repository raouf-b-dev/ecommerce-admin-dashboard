import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { failureExcerpt, selectVitestCommands } from './agent-output.mjs';

describe('admin planner', () => {
  it('does not run format or the architecture suite', () => {
    const file = 'src/features/orders/core/domain/order.ts';
    const plan = selectVitestCommands([file], [file], 'admin');
    const labels = plan.commands.map(([label]) => label);
    assert.equal(labels.includes('format'), false);
    assert.equal(labels.includes('test:arch'), false);
    assert.equal(labels.includes('vitest related'), true);
  });
});

describe('failureExcerpt', () => {
  it('drops a passing prefix', () => {
    const excerpt = failureExcerpt('PASS ok\nFAIL src/a.spec.ts\nError: boom');
    assert.match(excerpt, /^FAIL /);
    assert.equal(excerpt.includes('PASS ok'), false);
  });
});
