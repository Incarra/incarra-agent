// Frontend Integration Example (frontend-integration.js)
class IncarraAPI {
  constructor(baseUrl = 'http://localhost:3001/api') {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json'
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: this.headers,
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Agent Management
  async createAgent(userPublicKey, agentData) {
    return this.request('/agent/create', {
      method: 'POST',
      body: JSON.stringify({ userPublicKey, ...agentData })
    });
  }

  async getAgent(userPublicKey) {
    return this.request(`/agent/${userPublicKey}`);
  }

  async addKnowledgeArea(userPublicKey, knowledgeArea) {
    return this.request('/agent/knowledge-area', {
      method: 'POST',
      body: JSON.stringify({ userPublicKey, knowledgeArea })
    });
  }

  // AI Interactions
  async chat(userPublicKey, message, interactionType = 'conversation') {
    return this.request('/agent/interact', {
      method: 'POST',
      body: JSON.stringify({ userPublicKey, message, interactionType })
    });
  }

  async chatSimple(userPublicKey, message, context = {}) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({ userPublicKey, message, context })
    });
  }

  // Research Functions
  async searchPapers(query, limit = 10) {
    return this.request(`/research/papers?query=${encodeURIComponent(query)}&limit=${limit}`);
  }

  async analyzePaper(userPublicKey, paperId, paperContent) {
    return this.request('/research/analyze', {
      method: 'POST',
      body: JSON.stringify({ userPublicKey, paperId, paperContent })
    });
  }

  // Carv ID Functions
  async verifyCarvId(userPublicKey, verificationProof) {
    return this.request('/agent/verify-carv', {
      method: 'POST',
      body: JSON.stringify({ userPublicKey, verificationProof })
    });
  }

  async getCarvProfile(userPublicKey) {
    return this.request(`/agent/carv-profile/${userPublicKey}`);
  }

  async addCredential(userPublicKey, credentialType, credentialData, issuer) {
    return this.request('/agent/add-credential', {
      method: 'POST',
      body: JSON.stringify({ userPublicKey, credentialType, credentialData, issuer })
    });
  }

  async addAchievement(userPublicKey, achievementName, achievementDescription, achievementScore) {
    return this.request('/agent/add-achievement', {
      method: 'POST',
      body: JSON.stringify({ 
        userPublicKey, 
        achievementName, 
        achievementDescription, 
        achievementScore 
      })
    });
  }
}

// React Hook for INCARRA Integration
const useIncarra = (userWallet) => {
  const [api] = useState(() => new IncarraAPI());
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userPublicKey = userWallet?.publicKey?.toString();

  // Load agent data
  const loadAgent = useCallback(async () => {
    if (!userPublicKey) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.getAgent(userPublicKey);
      setAgent(result.data);
    } catch (err) {
      setError(err.message);
      setAgent(null);
    } finally {
      setLoading(false);
    }
  }, [userPublicKey, api]);

  // Create new agent
  const createAgent = useCallback(async (agentData) => {
    if (!userPublicKey) throw new Error('Wallet not connected');
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.createAgent(userPublicKey, agentData);
      setAgent(result.data.agent);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userPublicKey, api]);

  // Chat with agent
  const chat = useCallback(async (message, interactionType = 'conversation') => {
    if (!userPublicKey) throw new Error('Wallet not connected');
    
    try {
      const result = await api.chat(userPublicKey, message, interactionType);
      
      // Update agent stats after interaction
      if (result.data.agentUpdate) {
        setAgent(prev => ({
          ...prev,
          ...result.data.agentUpdate.agent
        }));
      }
      
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [userPublicKey, api]);

  // Add knowledge area
  const addKnowledgeArea = useCallback(async (knowledgeArea) => {
    if (!userPublicKey) throw new Error('Wallet not connected');
    
    try {
      const result = await api.addKnowledgeArea(userPublicKey, knowledgeArea);
      setAgent(prev => ({
        ...prev,
        ...result.data.agent
      }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [userPublicKey, api]);

  // Load agent on wallet connection
  useEffect(() => {
    if (userPublicKey) {
      loadAgent();
    } else {
      setAgent(null);
    }
  }, [userPublicKey, loadAgent]);

  return {
    agent,
    loading,
    error,
    createAgent,
    chat,
    addKnowledgeArea,
    loadAgent,
    api
  };
};

// Example React Component
const IncarraChat = () => {
  const { wallet } = useWallet(); // Assume you have Solana wallet integration
  const { agent, loading, error, createAgent, chat } = useIncarra(wallet);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const handleCreateAgent = async () => {
    try {
      await createAgent({
        agentName: 'My INCARRA',
        personality: 'Helpful research companion focused on AI and blockchain',
        carvId: '0x1234567890abcdef1234567890abcdef12345678',
        verificationSignature: 'signature_placeholder'
      });
    } catch (err) {
      console.error('Failed to create agent:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !agent) return;
    
    const userMessage = message;
    setMessage('');
    setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);
    
    try {
      const response = await chat(userMessage, 'conversation');
      setConversation(prev => [...prev, { 
        role: 'assistant', 
        content: response.aiResponse 
      }]);
    } catch (err) {
      console.error('Chat failed:', err);
      setConversation(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <div>Loading INCARRA...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!agent) {
    return (
      <div>
        <h2>Create Your INCARRA Agent</h2>
        <button onClick={handleCreateAgent}>Create Agent</button>
      </div>
    );
  }

  return (
    <div className="incarra-chat">
      <div className="agent-info">
        <h3>{agent.agentName}</h3>
        <p>Level: {agent.level} | XP: {agent.experience}</p>
        <p>Reputation: {agent.reputation}</p>
      </div>
      
      <div className="conversation">
        {conversation.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {chatLoading && <div className="message assistant loading">Thinking...</div>}
      </div>
      
      <div className="input-area">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask your INCARRA agent anything..."
          disabled={chatLoading}
        />
        <button onClick={handleSendMessage} disabled={chatLoading || !message.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

// Export for use in your frontend
export { IncarraAPI, useIncarra, IncarraChat };