const request = require('supertest');
const app = require('../server');

describe('INCARRA Backend API', () => {
  const testUserPublicKey = 'Test1234567890abcdef1234567890abcdef12345678';
  const testAgentData = {
    agentName: 'TestAgent',
    personality: 'Helpful research companion for testing',
    carvId: '0x1234567890abcdef1234567890abcdef12345678',
    verificationSignature: 'test_signature_123'
  };

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);
      
      expect(res.body.status).toBe('INCARRA Backend Running');
    });
  });

  describe('Agent Management', () => {
    it('should create a new agent', async () => {
      const res = await request(app)
        .post('/api/agent/create')
        .send({
          userPublicKey: testUserPublicKey,
          ...testAgentData
        })
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.agent.agentName).toBe(testAgentData.agentName);
    });

    it('should get agent details', async () => {
      const res = await request(app)
        .get(`/api/agent/${testUserPublicKey}`)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.agentName).toBe(testAgentData.agentName);
    });

    it('should add knowledge area', async () => {
      const res = await request(app)
        .post('/api/agent/knowledge-area')
        .send({
          userPublicKey: testUserPublicKey,
          knowledgeArea: 'Machine Learning'
        })
        .expect(200);
      
      expect(res.body.success).toBe(true);
    });
  });

  describe('AI Interactions', () => {
    it('should process conversation', async () => {
      const res = await request(app)
        .post('/api/agent/interact')
        .send({
          userPublicKey: testUserPublicKey,
          message: 'Hello, how can you help with research?',
          interactionType: 'conversation'
        })
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.aiResponse).toBeDefined();
    });

    it('should handle research query', async () => {
      const res = await request(app)
        .post('/api/agent/interact')
        .send({
          userPublicKey: testUserPublicKey,
          message: 'What are the latest trends in quantum computing?',
          interactionType: 'research'
        })
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.experienceGained).toBeGreaterThan(10);
    });
  });

  describe('Research Data', () => {
    it('should search ArXiv papers', async () => {
      const res = await request(app)
        .get('/api/research/papers?query=machine learning&limit=5')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('Carv ID Integration', () => {
    it('should verify Carv ID', async () => {
      const res = await request(app)
        .post('/api/agent/verify-carv')
        .send({
          userPublicKey: testUserPublicKey,
          verificationProof: 'test_proof_123'
        })
        .expect(200);
      
      expect(res.body.success).toBe(true);
    });

    it('should get Carv profile', async () => {
      const res = await request(app)
        .get(`/api/agent/carv-profile/${testUserPublicKey}`)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.carvId).toBeDefined();
    });
  });
});