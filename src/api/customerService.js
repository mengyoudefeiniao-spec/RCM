import client, { request } from './client.js';

/**
 * 智能客服助手与 RAG 检索微服务 API 模块
 * 对标 Spring Cloud 微服务架构规范（请求经过 API Gateway 统一路由并进行 Token 鉴权）
 */

/**
 * 1. 发起 RAG 增强智能问答
 * @param {Object} params
 * @param {string} params.question 用户问题
 * @param {Array} params.history 多轮对话历史 [{ role: 'user' | 'assistant', content: string }]
 * @param {string} [params.kbId] 指定知识库分类（全部或特定分类）
 * @param {Object} [params.userContext] 前端附带的用户身份画像与当前页面上下文
 * @returns {Promise<Object>}
 */
export function askRagAssistant(params) {
  return request({
    url: '/ai-service/chat',
    method: 'POST',
    data: params
  });
}

/**
 * 2. 获取向量化知识库体系分类与检索状态概览
 * @returns {Promise<Array>}
 */
export function getKnowledgeBasesList() {
  return request({
    url: '/ai-service/knowledge-bases',
    method: 'GET'
  });
}

/**
 * 3. 获取特定政策依据/知识切片原文完整详情
 * @param {string} chunkId
 * @returns {Promise<Object>}
 */
export function getKnowledgeChunkDetail(chunkId) {
  return request({
    url: `/ai-service/chunk-detail/${chunkId}`,
    method: 'GET'
  });
}

/**
 * 4. 一键无缝转接 7x24 人工客服（同步多轮上下文与用户身份档案）
 * @param {Object} payload
 * @param {string} payload.sessionId 会话编号
 * @param {Array} payload.conversationHistory 完整的问答上下文
 * @param {Object} payload.userContext 用户身份档案与当前访问页面
 * @param {string} [payload.reason] 转接原因（用户主动转接、未解决、无法解答）
 * @returns {Promise<Object>}
 */
export function transferToHuman(payload) {
  return request({
    url: '/ai-service/transfer-human',
    method: 'POST',
    data: payload
  });
}

/**
 * 5. 人工客服模式下发送实时交互消息
 * @param {Object} payload
 * @param {string} payload.sessionId 会话编号
 * @param {string} payload.message 用户发送的消息
 * @param {string} payload.agentId 承接的客服坐席工号
 * @returns {Promise<Object>}
 */
export function sendHumanChatMessage(payload) {
  return request({
    url: '/ai-service/human-message',
    method: 'POST',
    data: payload
  });
}

/**
 * 6. 提交问答评价与客服满意度反馈
 * @param {Object} payload
 * @param {string} payload.messageId 消息编号
 * @param {string} payload.rating 评分或点赞状态（like | dislike | star1-5）
 * @param {string} [payload.comment] 用户评价意见
 * @returns {Promise<Object>}
 */
export function submitFeedback(payload) {
  return request({
    url: '/ai-service/feedback',
    method: 'POST',
    data: payload
  });
}
