import test from 'node:test';
import assert from 'node:assert/strict';
import { complaintCardNumber, complaintAgentId, buildComplaintLocations, complaintLocationOptions } from '../../src/utils/complaintLocations.js';

const tree = [{ province: 'Baghdad', branches: [{ centers: [{ centerId: '101', centerName: 'Center A', flourAgents: [{ id: 'FA-A', name: 'Flour A' }], foodAgents: [{ id: 'FD-A', name: 'Food A' }] }] }] }, { province: 'Diyala', branches: [{ centers: [{ centerId: '496', centerName: 'Center B', flourAgents: [{ id: 'FA-B', name: 'Flour B' }], foodAgents: [] }] }] }];

test('resolves only the current identity card or known demo identity', () => {
  assert.equal(complaintCardNumber({ id: 'usr-cit-01', role: 'citizen' }), 'RC-10029381');
  assert.equal(complaintCardNumber({ id: 'other', role: 'citizen' }), '');
  assert.equal(complaintCardNumber({ id: 'other', role: 'citizen', rationCardNo: 'CARD-B' }), 'CARD-B');
  assert.equal(complaintAgentId({ id: 'usr-agt-01', role: 'agent' }), 'FA-00128');
  assert.equal(complaintAgentId({ id: 'other', role: 'agent' }), '');
});

test('fills card location and infers center from a transferred card’s linked agents', () => {
  const { defaults } = buildComplaintLocations(tree, { rationCardNo: 'CARD', province: 'Baghdad', agentId: 'FA-A / FD-A', agentName: 'Flour A & Food A' });
  assert.equal(defaults.center, 'Center A');
  assert.equal(defaults.centerId, '101');
  assert.equal(defaults.agentName, 'Flour A & Food A');
  assert.equal(defaults.source, 'card');
});

test('retains actual card values even when missing from the catalog', () => {
  const { rows, defaults } = buildComplaintLocations(tree, { rationCardNo: 'CARD', province: 'Other province', district: 'Actual card center', agentId: 'ACTUAL', agentName: 'Actual outlet' });
  assert.equal(defaults.center, 'Actual card center');
  assert.ok(complaintLocationOptions(rows, 'province').some(row => row.value === 'Other province'));
  assert.deepEqual(complaintLocationOptions(rows, 'agentName', defaults.provinceId, defaults.centerId), [{ id: 'ACTUAL', value: 'Actual outlet' }]);
});

test('limits dependent centers and outlets and deduplicates repeated center rows', () => {
  const { rows } = buildComplaintLocations(tree);
  assert.equal(complaintLocationOptions(rows, 'center', 'province0').length, 1);
  assert.equal(complaintLocationOptions(rows, 'agentName', 'province0', '101').length, 2);
  assert.equal(complaintLocationOptions(rows, 'agentName', 'province1', '496')[0].id, 'FA-B');
  assert.equal(complaintLocationOptions(rows, 'agentName', 'province0', '496').length, 0);
});

test('handles missing data without inventing another user’s card or outlet', () => {
  assert.deepEqual(buildComplaintLocations(), { rows: [], defaults: null });
  const { defaults } = buildComplaintLocations(tree);
  assert.equal(defaults, null);
  const partial = buildComplaintLocations([], { rationCardNo: 'CARD', province: 'Baghdad' });
  assert.equal(partial.defaults.center, ''); assert.equal(partial.defaults.agentName, '');
});

test('uses the exact account outlet as the agent fallback', () => {
  const { defaults } = buildComplaintLocations(tree, null, { id: 'OWN', name: 'Own outlet', centerId: 'OWN-C', centerName: 'Own center', province: 'Own province' });
  assert.equal(defaults.source, 'outlet'); assert.equal(defaults.agentId, 'OWN'); assert.equal(defaults.center, 'Own center');
});
