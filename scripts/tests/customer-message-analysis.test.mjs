import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeCustomerMessage as analyze, preserveOriginalUserMessage } from '../../src/utils/customerMessageAnalysis.js';

const complaint = "I want to file a complaint! The batch of rations I just got from the agent is seriously underweight. We're being shortchanged here—how do you guys manage your agents?";

test('routes the reported English complaint to shortage intake rather than quota or human handoff', () => {
  const result = analyze(complaint);
  assert.equal(result.intent, 'COMPLAINT');
  assert.equal(result.typeCode, 'SHORTAGE');
  assert.equal(result.sentiment, 'NEGATIVE');
  assert.equal(result.emotion, 'FRUSTRATED');
  assert.equal(result.complaintRequested, true);
  assert.equal(result.needsComfort, true);
});

test('preserves customer wording, whitespace and punctuation without applying topic translations', () => {
  const original = `  ${complaint}\nPlease retain my words.  `;
  const message = { role: 'user', originalContent: original, content: 'Quota template', topicKey: 'quota', contentMap: { en: 'Quota template' } };
  preserveOriginalUserMessage(message);
  assert.equal(message.content, original);
  assert.equal(message.contentMap, undefined);
  assert.equal(message.topicKey, undefined);
  assert.equal(preserveOriginalUserMessage({ role: 'user', content: original }).content, original);
  const assistant = { role: 'assistant', content: 'Reply', contentMap: { en: 'Reply' } };
  assert.equal(preserveOriginalUserMessage(assistant).contentMap.en, 'Reply');
});

test('recognizes shortage complaints in each supported language and from quantity discrepancies', () => {
  for (const text of [complaint, 'I received 13kg instead of 15kg from my agent.', '我要投诉，代理网点缺斤短两！', 'اريد تقديم شكوى، الوزن ناقص عند الوكيل', 'سکاڵام هەیە، کەمکێشان لە بەشەخۆراک ڕوویداوە']) {
    assert.equal(analyze(text).typeCode, 'SHORTAGE', text);
    assert.equal(analyze(text).complaintRequested, true, text);
  }
});

test('selects the related complaint category', () => {
  for (const [text, category] of [['The agent overcharged me.', 'OVERCHARGE'], ['The ration oil smells rancid.', 'QUALITY'], ['我的配额有误，需要申诉。', 'QUOTA'], ['The agent was rude.', 'SERVICE']]) {
    assert.equal(analyze(text).typeCode, category, text);
    assert.equal(analyze(text).complaintRequested, true, text);
  }
});

test('does not open complaint drafts for neutral, negated or hypothetical questions', () => {
  for (const text of ['What is the monthly basic food ration quota standard for 2026?', 'What is the meaning of underweight rations?', 'How do I transfer to a new agent?', 'The rations are not underweight.', 'My ration agent is not rude.', 'I am not angry with my agent.', 'If my rations are underweight, what should I do?', '配给物资并非重量不足，我想查询标准。']) {
    assert.equal(analyze(text).complaintRequested, false, text);
  }
});

test('distinguishes progress requests from new complaints', () => {
  for (const text of ['What is the status of my complaint?', 'Track my complaint', '我要投诉进度', '查看投诉处理结果', 'متابعة شكوى', 'بەدواداچوونی سکاڵاکەم']) {
    assert.equal(analyze(text).intent, 'COMPLAINT_PROGRESS', text);
    assert.equal(analyze(text).complaintRequested, false, text);
  }
});

test('recognizes explicit human service requests without treating ration agents as support agents', () => {
  for (const text of ['I want to talk to a human agent.', 'Please connect me to customer service.', '转人工客服']) assert.equal(analyze(text).intent, 'HUMAN_HANDOFF', text);
  assert.equal(analyze('How do I transfer to another agent?').intent, 'QUESTION');
});

test('offers comfort while respecting refusal to file a complaint', () => {
  const result = analyze("I'm upset with this service, but I don't want to file a complaint.");
  assert.equal(result.complaintRequested, false);
  assert.equal(result.needsComfort, true);
  assert.equal(result.sentiment, 'NEGATIVE');
});

test('distinguishes strong negative and positive expressions', () => {
  assert.equal(analyze('I am furious about this service!').emotion, 'ANGRY');
  assert.equal(analyze('Thank you, that was helpful.').sentiment, 'POSITIVE');
});
