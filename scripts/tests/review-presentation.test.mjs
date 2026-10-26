import test from 'node:test';
import assert from 'node:assert/strict';
import { isPendingReview, reviewTicketField, REVIEW_SOURCE_KEYS } from '../../src/utils/reviewPresentation.js';
import { getInitialFamilies } from '../../src/utils/sharedSession.js';
import zh from '../../src/locales/zh.js';
import en from '../../src/locales/en.js';
import ar from '../../src/locales/ar.js';
import ckb from '../../src/locales/ku.js';

const messages = { zh, en, ar, ckb };
const dictionary = lang => {
  const lookup = key => key.split('.').reduce((value, part) => value?.[part], messages[lang]);
  return { t: key => lookup(key) ?? key, te: key => lookup(key) !== undefined };
};
const dynamic = { id: 'REV-UNF-DYNAMIC', cardNo: 'RC-10029381', targetMemberName: '宰娜卜·艾哈迈德·哈桑', payload: { targetMemberId: 'M-004' } };

test('pending review counts recognize statuses in all four languages and stable codes', () => {
  for (const pack of Object.values(messages)) {
    assert.equal(isPendingReview({ status: pack.review.statusPendingStaff }), true);
    assert.equal(isPendingReview({ status: pack.review.statusPendingManager }), true);
  }
  for (const status of ['PENDING_STAFF', 'PENDING_MANAGER_REVIEW', ' pending staff review ']) assert.equal(isPendingReview({ status }), true);
  for (const status of ['Approved', 'Rejected', '已批准', '已审批通过', '已办结归档', '已驳回', null]) assert.equal(isPendingReview({ status }), false);
  assert.equal(isPendingReview({ statusCode: 'APPROVED', status: 'Pending Staff Review' }), false);
});

test('dynamic tickets display known family demo names in the current language', () => {
  for (const lang of Object.keys(messages)) {
    const { t, te } = dictionary(lang);
    const displayed = reviewTicketField(dynamic, 'targetMemberName', lang, t, te);
    assert.equal(displayed, getInitialFamilies(lang)[0].members[3].name);
    if (lang !== 'zh') assert.equal(/[\u4e00-\u9fff]/.test(displayed), false);
  }
  assert.equal(dynamic.targetMemberName, '宰娜卜·艾哈迈德·哈桑', 'Presentation does not rewrite the application record');
});

test('seed ticket labels switch between English, Chinese and existing Arabic/Kurdish catalogs', () => {
  const ticket = { id: 'REV-ENT-004', cardNo: 'RC-10029381', targetMemberName: '拉希德·艾哈迈德' };
  const expected = { zh: '拉希德·艾哈迈德', en: 'Rashid Ahmed', ar: 'رشيد أحمد', ckb: 'ڕەشید ئەحمەد' };
  for (const lang of Object.keys(messages)) {
    const { t, te } = dictionary(lang);
    assert.equal(reviewTicketField(ticket, 'targetMemberName', lang, t, te), expected[lang]);
  }
});

test('actual registered names and edited seed subjects remain verbatim', () => {
  for (const lang of Object.keys(messages)) {
    const { t, te } = dictionary(lang);
    assert.equal(reviewTicketField({ ...dynamic, targetMemberName: 'Actual English Name' }, 'targetMemberName', lang, t, te), 'Actual English Name');
    assert.equal(reviewTicketField({ id: 'REV-ENT-004', targetMemberName: 'Corrected Registered Name' }, 'targetMemberName', lang, t, te), 'Corrected Registered Name');
    assert.equal(reviewTicketField({ id: 'CUSTOM', cardNo: 'REAL-CARD', targetMemberName: 'Actual Name' }, 'targetMemberName', lang, t, te), 'Actual Name');
  }
});

test('source filters match legacy English labels and pending badge copy is translated', () => {
  assert.equal(REVIEW_SOURCE_KEYS['申请解冻'], REVIEW_SOURCE_KEYS['Card unfreeze']);
  assert.equal(REVIEW_SOURCE_KEYS['申请解冻'], REVIEW_SOURCE_KEYS['Unfreeze Card']);
  for (const pack of Object.values(messages)) assert.match(pack.review.pendingCountLabel, /\{count\}/);
});
