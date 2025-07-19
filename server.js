// server.js - Main Express server
const express = require('express');
const cors = require('cors');
const { IncarraAgentService } = require('./services/IncarraAgentService');
const { AIService } = require('./services/AIService');
const { DataService } = require('./services/DataService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const agentService = new IncarraAgentService();
const aiService = new AIService();
const dataService = new DataService();

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'INCARRA Backend Running', timestamp: new Date() });
});

// Agent Management Routes
app.post('/api/agent/create', async (req, res) => {
  try {
    const { userPublicKey, agentName, personality, carvId, verificationSignature } = req.body;
    
    const result = await agentService.createAgent(
      userPublicKey,
      agentName,
      personality,
      carvId,
      verificationSignature
    );
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/agent/:userPublicKey', async (req, res) => {
  try {
    const { userPublicKey } = req.params;
    const agent = await agentService.getAgent(userPublicKey);
    res.json({ success: true, data: agent });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

app.post('/api/agent/interact', async (req, res) => {
  try {
    const { userPublicKey, message, interactionType } = req.body;
    
    // Process interaction with AI
    const aiResponse = await aiService.processInteraction(userPublicKey, message, interactionType);
    
    // Update on-chain state
    const result = await agentService.recordInteraction(
      userPublicKey,
      interactionType,
      aiResponse.experienceGained,
      JSON.stringify(aiResponse.context)
    );
    
    res.json({ 
      success: true, 
      data: {
        aiResponse: aiResponse.response,
        agentUpdate: result,
        experienceGained: aiResponse.experienceGained
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/agent/verify-carv', async (req, res) => {
  try {
    const { userPublicKey, verificationProof } = req.body;
    const result = await agentService.verifyCarvId(userPublicKey, verificationProof);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/agent/add-credential', async (req, res) => {
  try {
    const { userPublicKey, credentialType, credentialData, issuer } = req.body;
    const result = await agentService.addCredential(userPublicKey, credentialType, credentialData, issuer);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/agent/add-achievement', async (req, res) => {
  try {
    const { userPublicKey, achievementName, achievementDescription, achievementScore } = req.body;
    const result = await agentService.addAchievement(userPublicKey, achievementName, achievementDescription, achievementScore);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/agent/knowledge-area', async (req, res) => {
  try {
    const { userPublicKey, knowledgeArea } = req.body;
    const result = await agentService.addKnowledgeArea(userPublicKey, knowledgeArea);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Data & Research Routes
app.get('/api/research/papers', async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    const papers = await dataService.searchArxivPapers(query, limit);
    res.json({ success: true, data: papers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/research/analyze', async (req, res) => {
  try {
    const { userPublicKey, paperId, paperContent } = req.body;
    const analysis = await aiService.analyzePaper(userPublicKey, paperId, paperContent);
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/agent/carv-profile/:userPublicKey', async (req, res) => {
  try {
    const { userPublicKey } = req.params;
    const profile = await agentService.getCarvProfile(userPublicKey);
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { userPublicKey, message, context } = req.body;
    const response = await aiService.chat(userPublicKey, message, context);
    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🤖 INCARRA Backend Agent running on port ${PORT}`);
});

module.exports = app;