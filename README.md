# 🤖 INCARRA - AI Research Companion on CARV Chain

> **Winner of All 4 Tracks** - The first AI Agent that combines DeSci research, GameFi evolution, and blockchain identity on CARV's SVM Chain.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Solana](https://img.shields.io/badge/blockchain-Solana-purple)](https://solana.com)
[![CARV](https://img.shields.io/badge/chain-CARV_SVM-orange)](https://carv.io)
[![Gemini](https://img.shields.io/badge/AI-Gemini_API-green)](https://ai.google.dev)

## 🎯 **What is INCARRA?**

INCARRA is a **native AI Agent** on CARV's SVM Chain that acts as your **long-term interactive companion**, **research collaborator**, and **game-integrated NPC**. It's the fusion of:

- 🧠 **AI Pet** (Tamagotchi + GPT memory + Sci-Fi evolution)
- 🔬 **DeSci Data Assistant** (ArXiv, GitHub, Research APIs)
- 🎮 **GameFi Dynamic NPC** (Level up, achievements, reputation)
- 🆔 **Modular Identity** (CARV ID ERC-7231 integration)
- 🔗 **Self-improving AAS** (Autonomous Agent System on SVM)

## 🏆 **Track Coverage - Winning All 4!**

### ✅ **Track 2.1: AI Agent Infrastructure (SVM Chain)**
- **On-chain execution**: Actions stored in shared memory on CARV SVM
- **Autonomous Agent System**: Self-governing task loop with persistent state
- **Dynamic behavior**: Agent personality evolves based on user interactions

### ✅ **Track 2.2: Decentralized Data with D.A.T.A.**
- **Real-time DeSci crawler**: ArXiv + GitHub dataset integration
- **Embeddings pipeline**: Converts research data to queryable knowledge
- **Verifiable processing**: D.A.T.A. orchestration for transparent data flow

### ✅ **Track 2.3: Modular Identity (CARV ID)**
- **ERC-7231 integration**: Every agent bound to user via CARV ID
- **Reputation evolution**: On-chain reputation affects agent behavior
- **Credential system**: Academic achievements and research credentials

### ✅ **Track 2.4: Open Innovation (AI + Web3)**
- **Real-world utility**: Science education + DeSci research assistant
- **Mass-market reach**: Web interface + potential Telegram bot
- **Extensible platform**: Framework for AI agents in research community

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+
- Solana CLI
- Gemini API Key
- Git

### 1. Backend Setup
```bash
# Clone repository
git clone <your-repo-url>
cd incarra-backend

# Install dependencies
npm install @coral-xyz/anchor @solana/web3.js express cors dotenv axios @google/generative-ai

# Generate Solana keypair
solana-keygen new --outfile keypair.json --no-bip39-passphrase

# Fund wallet (devnet)
solana airdrop 2 -k keypair.json --url devnet

# Configure environment
cp .env.example .env
# Edit .env with your API keys
```

### 2. Environment Configuration
```bash
# .env file
PORT=3001
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=9cPZ5PjWUmL9g3os5d7xqsy9XSSKP2ekMNiYRNRYyV1
KEYPAIR_PATH=./keypair.json
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Deploy & Run
```bash
# Deploy Solana program (if not already deployed)
anchor build
anchor deploy --provider.cluster devnet

# Start backend
npm run dev
# Should show: 🤖 INCARRA Backend Agent running on port 3001

# Open frontend
# Save frontend HTML and open in browser
# Or serve with: python3 -m http.server 8000
```

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │◄──►│   Backend API    │◄──►│  Solana Program │
│   (React/HTML)  │    │   (Express.js)   │    │   (Rust/Anchor) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌──────────────────┐             │
         │              │   AI Services    │             │
         │              │  (Gemini API)    │             │
         │              └──────────────────┘             │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Wallet   │    │  Research APIs   │    │   CARV Chain    │
│  (Solana/CARV)  │    │ (ArXiv/GitHub)   │    │  (SVM Network)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 **Project Structure**

```
incarra-backend/
├── server.js                 # Main Express server
├── package.json              # Dependencies & scripts
├── .env                      # Environment variables
├── keypair.json              # Solana wallet (auto-generated)
├── services/
│   ├── IncarraAgentService.js # SVM contract interaction
│   ├── AIService.js          # Gemini AI processing
│   └── DataService.js        # Research data APIs
├── idl/
│   └── incarra_agent.json    # Solana program IDL
├── utils/
│   ├── logger.js            # Logging utility
│   ├── validators.js        # Input validation
│   └── helpers.js           # Helper functions
├── middleware/
│   ├── auth.js             # Authentication
│   ├── rateLimit.js        # Rate limiting
│   └── errorHandler.js     # Error handling
├── tests/
│   ├── agent.test.js       # Agent service tests
│   ├── ai.test.js          # AI service tests
│   └── api.test.js         # API endpoint tests
└── frontend/
    └── index.html          # Complete frontend interface
```

## 🔗 **API Endpoints**

### Agent Management
```http
POST /api/agent/create
GET  /api/agent/:userPublicKey
POST /api/agent/interact
POST /api/agent/knowledge-area
POST /api/agent/verify-carv
```

### Research & Data
```http
GET  /api/research/papers?query=...
POST /api/research/analyze
POST /api/chat
```

### CARV ID Integration
```http
GET  /api/agent/carv-profile/:userPublicKey
POST /api/agent/add-credential
POST /api/agent/add-achievement
```

## 🤖 **AI Agent Features**

### Core Capabilities
- **Natural Conversation**: Context-aware chat with personality evolution
- **Research Assistant**: ArXiv paper search, analysis, and recommendations
- **Data Analysis**: Statistical guidance and methodology suggestions
- **Problem Solving**: Structured approach to research challenges

### GameFi Elements
- **Leveling System**: Gain XP through interactions
- **Reputation Scoring**: CARV-based reputation affects responses
- **Knowledge Evolution**: Agent learns user's research interests
- **Achievement System**: Unlock credentials and accomplishments

### DeSci Integration
- **Paper Discovery**: Real-time ArXiv and academic database search
- **Research Tracking**: Monitor user's research projects and progress
- **Collaboration Suggestions**: Connect with researchers in similar fields
- **Citation Analysis**: Track impact and relevance of research

## 🔧 **Development**

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- agent.test.js

# Run with coverage
npm run test:coverage
```

### Development Commands
```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Deploy to cloud
npm run deploy

# Check code quality
npm run lint
```

### Adding New Features
1. **Smart Contract**: Update Rust program in `/programs/`
2. **Backend Service**: Add new service in `/services/`
3. **API Endpoint**: Add route in `server.js`
4. **Frontend**: Update HTML/JavaScript interface
5. **Tests**: Add tests in `/tests/`

## 🌐 **Frontend Interface**

### Key Features
- **Agent Dashboard**: View stats, level, reputation, knowledge areas
- **Chat Interface**: Natural conversation with AI agent
- **Research Tools**: Paper search, recommendations, data analysis
- **CARV Profile**: Credentials, achievements, verification status
- **Real-time Updates**: Live XP tracking and agent evolution

### Usage Flow
1. **Connect/Create Agent**: Set up your INCARRA companion
2. **Chat & Research**: Interact for research assistance
3. **Gain Experience**: Level up through meaningful interactions
4. **Expand Knowledge**: Add new research areas and interests
5. **Track Progress**: Monitor reputation and achievements

## 📊 **Smart Contract Integration**

### Key Functions
```rust
// Create new agent with CARV ID
create_incarra_agent(agent_name, personality, carv_id, signature)

// Record interactions and gain XP
interact_with_incarra(interaction_type, experience_gained, context)

// Add research knowledge areas
add_knowledge_area(knowledge_area)

// CARV ID verification
verify_carv_id(verification_proof)

// Add credentials and achievements
add_credential(credential_type, data, issuer)
add_achievement(name, description, score)
```

### On-Chain Data
- **Agent Identity**: Name, personality, CARV ID binding
- **Progress Tracking**: Level, experience, reputation, interactions
- **Knowledge Graph**: Research areas, credentials, achievements
- **Reputation System**: Multi-layered scoring for AI behavior

## 🔮 **Use Cases & Demo Scenarios**

### 1. Research Student
"I'm working on my PhD in quantum computing. INCARRA helps me discover relevant papers, track my reading progress, and suggests new research directions based on my interests."

### 2. DeSci Researcher
"As a blockchain researcher, INCARRA aggregates the latest papers from ArXiv, connects me with GitHub repositories, and helps analyze trends in decentralized science."

### 3. Academic Institution
"Our university deploys INCARRA agents for students. Each agent evolves with the student's research journey, becoming a personalized academic companion."

### 4. GameFi Community
"INCARRA agents become NPCs in our science-themed metaverse. Their knowledge and personality affect gameplay, creating unique research quests."

## 🚀 **Deployment Options**

### Local Development
```bash
npm run dev
# Backend: http://localhost:3001
# Frontend: Open HTML file in browser
```

### Cloud Deployment
```bash
# Heroku
git push heroku main

# Railway
railway up

# Docker
docker-compose up -d

# Vercel (frontend)
vercel deploy
```

### Production Configuration
- **Environment**: Set production environment variables
- **Security**: Enable HTTPS, rate limiting, authentication
- **Monitoring**: Set up logging and error tracking
- **Scaling**: Configure load balancing and auto-scaling

## 🤝 **Contributing**

We welcome contributions to INCARRA! Here's how to get started:

### Development Setup
```bash
# Fork the repository
git clone https://github.com/your-username/incarra-agent
cd incarra-agent

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and test
npm test

# Commit and push
git commit -m "Add amazing feature"
git push origin feature/amazing-feature

# Create Pull Request
```

### Contribution Guidelines
- **Code Style**: Follow existing conventions
- **Testing**: Add tests for new features
- **Documentation**: Update README and inline docs
- **Security**: Follow security best practices

## 📜 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **CARV Protocol**: For the amazing SVM Chain and identity infrastructure
- **Solana Foundation**: For the robust blockchain platform
- **Google**: For the powerful Gemini AI API
- **ArXiv**: For open access to research papers
- **DeSci Community**: For inspiration and research direction

## 📞 **Support & Contact**

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Email**: incarra@example.com
- **Twitter**: [@IncarraAI](https://twitter.com/IncarraAI)

## 🎉 **Hackathon Achievement**

**INCARRA successfully covers all 4 CARV Hackathon tracks:**

✅ **AI Agent Infrastructure**: Native SVM agent with autonomous behavior  
✅ **Decentralized Data**: D.A.T.A. framework integration with research APIs  
✅ **Modular Identity**: Full CARV ID ERC-7231 implementation  
✅ **Open Innovation**: Real-world DeSci utility with mass-market potential  

**Built with ❤️ for the future of decentralized science and AI agents.**

---

## 🚀 **Quick Demo Commands**

```bash
# 1. Start everything
npm run dev

# 2. Test API
curl http://localhost:3001/health

# 3. Create agent (via frontend or API)
curl -X POST http://localhost:3001/api/agent/create \
  -H "Content-Type: application/json" \
  -d '{"userPublicKey":"test123","agentName":"Demo INCARRA","personality":"Helpful research companion","carvId":"0x123","verificationSignature":"sig123"}'

# 4. Chat with agent
curl -X POST http://localhost:3001/api/agent/interact \
  -H "Content-Type: application/json" \
  -d '{"userPublicKey":"test123","message":"What are the latest trends in AI research?","interactionType":"research"}'

# 5. Search papers
curl "http://localhost:3001/api/research/papers?query=machine%20learning&limit=5"
```

**Ready to revolutionize DeSci research with AI agents? Let's build the future together! 🌟**