// Deterministic intake rules shared by the chat UI and the demo API. These
// classify the current request; they never rewrite the customer's words.
function normalize(value) {
  return String(value || '').normalize('NFKC').toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/[’‘]/g, "'");
}

function hasUnnegated(text, pattern) {
  return [...text.matchAll(new RegExp(pattern.source, pattern.flags + 'g'))].some(match => {
    const prefix = text.slice(Math.max(0, match.index - 30), match.index);
    return !/(?:\b(?:not|never|no|isn't|isnt|wasn't|wasnt)\s+(?:(?:at all|seriously|actually|really|very)\s+)?|并非|不是|没有|并不|不感到|ليس\s*)$/iu.test(prefix);
  });
}

const issueRules = [
  ['SHORTAGE', /\b(?:under[\s-]?weight|shortchang\w*|short[\s-]?weight|short[\s-]?deliver\w*)\b|\d+(?:\.\d+)?\s*(?:kg|kilos?|kilograms?).{0,25}(?:instead of|rather than)\s+\d|缺斤(?:短|少)两|克扣|重量不足|份量不足|少(?:发|给|了)|(?:نقص|نقصان|ناقص|اقل).{0,18}(?:الوزن|وزن|الحصة|الكمي)|(?:الوزن|وزن|الكمية).{0,12}(?:ناقص|اقل)|کەمکێش\S*|کەم.?کێش\S*|کەمبوونەوەی کێش/iu],
  ['OVERCHARGE', /\b(?:overcharg\w*|illegal (?:fees?|charges?)|extra (?:fees?|charges?))\b|私自加价|违规收费|乱收费|多收钱|(?:رسوم|اجور).{0,16}(?:غير قانون|اضافي)|زيادة الاسعار|زیادکردنی نرخ|ڕسومی نایاسایی/iu],
  ['QUALITY', /\b(?:rotten|spoiled|mouldy|moldy|rancid|bad smell|poor quality|expired food)\b|发霉|变质|腐烂|异味|食物过期|(?:طعام|غذاء|مواد).{0,12}(?:فاسد|متعفن)|رائحة كريهة|خراپی کوالیتی|خۆراکی خراپ|بۆنی ناخۆش/iu],
  ['QUOTA', /\b(?:wrong quota|incorrect quota|quota (?:error|dispute))\b|配额(?:有误|不对|错误)|份额(?:有误|错误)|خطا في (?:الحصة|احتساب)|هەڵە لە (?:بەشەخۆراک|دیاریکردنی)/iu],
  ['SERVICE', /\b(?:rude|poor service|bad service|long (?:queues?|wait\w*)|refused to (?:serve|deliver))\b|服务(?:态度差|太差)|排队(?:太久|过久)|拒绝发放|سوء (?:الخدمة|المعاملة)|انتظار طويل|خزمەتگوزاریی خراپ|چاوەڕوانیی درێژ/iu]
];

export function analyzeCustomerMessage(value) {
  const text = normalize(value);
  const declined = /\b(?:do not|don't|dont|not going to)\s+(?:want to\s+)?(?:file|submit|make|lodge|raise)?\s*(?:a\s+)?complain(?:t)?\b|\b(?:no complaint|not a complaint|not complaining)\b|不(?:要|想|用|需要)投诉|没有投诉|لا اريد.{0,12}شكوى|نا(?:م|مە)وێت.{0,12}سکاڵا/iu.test(text);
  const explicitComplaint = /\b(?:complaint|complain|complaining|grievance)\b|投诉|举报|申诉|抱怨|شكوى|اشتكي|سكاڵا|سکاڵا/iu.test(text);
  const progress = /\b(?:status|progress|update|track|follow[ -]?up)\b.{0,40}\b(?:complaint|case)\b|\b(?:complaint|case)\b.{0,40}\b(?:status|progress|update)\b|投诉.{0,12}(?:进度|结果|状态|处理到)|(?:حالة|متابعة|نتيجة).{0,16}شكوى|شكوى.{0,16}(?:حالة|متابعة|نتيجة)|(?:بەدواداچوون|دۆخ|ئەنجام).{0,16}سکاڵا/iu.test(text);
  const newRequest = /\b(?:file|submit|make|lodge|raise|register)\s+(?:(?:a|an|my|new)\s+)*complaint\b|(?:我要|我想|提交|发起|新的)投诉(?!进度|状态|结果)|تقديم شكوى|ناردنی سکاڵا/iu.test(text);
  const hypothetical = /\b(?:if|hypothetically|suppose)\b|如果|假如|倘若|اذا|ئەگەر/iu.test(text);
  const informational = /^(?:(?:what (?:is|are) (?:the meaning of|the definition of|an? underweight ration)|define|explain the meaning of)\b|什么是|请解释|ما معنى(?:\s|$))/iu.test(text);
  const angry = hasUnnegated(text, /\b(?:furious|outraged|angry|unacceptable|ridiculous)\b|愤怒|气死|太过分|غاضب|غاضبة|غير مقبول|تووڕەم|قبووڵ ناکرێت/iu);
  const negative = angry || hasUnnegated(text, /\b(?:upset|unhappy|disappointed|frustrat\w*|terrible|awful|cheated|fed up|disgusted|unfair|not satisfied)\b|不满|生气|失望|太差|恶劣|离谱|不公平|مستاء|محبط|ظلم|ناڕازیم|بێزارم|دادپەروەرانە نییە/iu);
  const context = /\b(?:rations?|agents?|service|outlet|app|support|distribution)\b|配给|物资|网点|代理|服务|客服|تموين|وكيل|خدمة|بەشەخۆراک|بریکار|خزمەت/iu.test(text);
  const typeCode = issueRules.find(([, pattern]) => hasUnnegated(text, pattern))?.[0];
  const human = /\b(?:live agent|human (?:agent|support)|(?:speak|talk|connect|transfer).{0,20}(?:a human|a person|an agent|customer service))\b|转人工|人工客服|真人客服|(?:تحويل|التحدث).{0,20}(?:موظف|بشري)|پەیوەندی.{0,15}فەرمانبەر/iu.test(text);
  const complaintRequested = !declined && !(progress && !newRequest)
    && (explicitComplaint || (!hypothetical && !informational && (!!typeCode || (negative && context))));
  const dissatisfied = negative || (!!typeCode && !hypothetical && !informational);
  return {
    intent: progress && !newRequest ? 'COMPLAINT_PROGRESS' : complaintRequested ? 'COMPLAINT' : human ? 'HUMAN_HANDOFF' : declined && negative ? 'FEEDBACK' : 'QUESTION',
    sentiment: dissatisfied || complaintRequested ? 'NEGATIVE' : /\b(?:thank you|helpful|satisfied)\b|谢谢|感谢|شكرا|سوپاس/iu.test(text) ? 'POSITIVE' : 'NEUTRAL',
    emotion: angry ? 'ANGRY' : dissatisfied ? 'FRUSTRATED' : complaintRequested ? 'CONCERNED' : 'NEUTRAL',
    typeCode: typeCode || 'SERVICE',
    complaintRequested,
    needsComfort: complaintRequested || (declined && dissatisfied),
    ruleVersion: 1
  };
}

export function preserveOriginalUserMessage(message) {
  if (message.role !== 'user') return message;
  message.originalContent ??= message.content;
  message.content = message.originalContent;
  delete message.contentMap;
  delete message.topicKey;
  return message;
}
