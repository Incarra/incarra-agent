const Joi = require('joi');

const createAgentSchema = Joi.object({
  userPublicKey: Joi.string().required(),
  agentName: Joi.string().min(1).max(50).required(),
  personality: Joi.string().min(1).max(200).required(),
  carvId: Joi.string().min(1).max(42).required(),
  verificationSignature: Joi.string().required()
});

const interactionSchema = Joi.object({
  userPublicKey: Joi.string().required(),
  message: Joi.string().min(1).max(2000).required(),
  interactionType: Joi.string().valid('research', 'analysis', 'conversation', 'problem_solving').default('conversation')
});

const knowledgeAreaSchema = Joi.object({
  userPublicKey: Joi.string().required(),
  knowledgeArea: Joi.string().min(1).max(30).required()
});

module.exports = {
  createAgentSchema,
  interactionSchema,
  knowledgeAreaSchema
};