import assert from 'node:assert/strict';
import test from 'node:test';
import { stationReached } from './route-tour.ts';

const stops = [0, 100, 200, 300];

test('estación alcanzada en la ida y en la vuelta', () => {
  assert.equal(stationReached([], 0, 1), -1);

  assert.equal(stationReached(stops, 0, 1), 0);
  assert.equal(stationReached(stops, 97, 1), 0);
  assert.equal(stationReached(stops, 98, 1), 1);
  assert.equal(stationReached(stops, 300, 1), 3);

  assert.equal(stationReached(stops, 300, -1), 3);
  assert.equal(stationReached(stops, 250, -1), 3);
  assert.equal(stationReached(stops, 202, -1), 2);
  assert.equal(stationReached(stops, 150, -1), 2);
  assert.equal(stationReached(stops, 0, -1), 0);
});
