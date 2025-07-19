// services/IncarraAgentService.js - Main service for SVM contract interaction
const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const fs = require('fs');

class IncarraAgentService {
  constructor() {
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );
    
    this.programId = new PublicKey('9cPZ5PjWUmL9g3os5d7xqsy9XSSKP2ekMNiYRNRYyV1');
    this.provider = null;
    this.program = null;
    this.payer = null;
    
    this.initializeProvider();
  }

  async initializeProvider() {
    try {
      // Load keypair from environment or file
      const keypairPath = process.env.KEYPAIR_PATH || './keypair.json';
      const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
      this.payer = Keypair.fromSecretKey(new Uint8Array(keypairData));

      this.provider = new anchor.AnchorProvider(
        this.connection,
        new anchor.Wallet(this.payer),
        { commitment: 'confirmed' }
      );

      // Load IDL
      const idl = require('../idl/incarra_agent.json');
      this.program = new anchor.Program(idl, this.programId, this.provider);
      
      console.log('✅ INCARRA Agent Service initialized');
      console.log('📋 Program ID:', this.programId.toString());
      console.log('🔑 Payer:', this.payer.publicKey.toString());
    } catch (error) {
      console.error('❌ Failed to initialize provider:', error);
      throw error;
    }
  }

  // Get agent PDA address
  getAgentPDA(userPublicKey) {
    const userPubkey = new PublicKey(userPublicKey);
    const [agentPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('incarra_agent'), userPubkey.toBuffer()],
      this.programId
    );
    return agentPDA;
  }

  // Create new agent
  async createAgent(userPublicKey, agentName, personality, carvId, verificationSignature) {
    try {
      const userPubkey = new PublicKey(userPublicKey);
      const agentPDA = this.getAgentPDA(userPublicKey);

      // Check if agent already exists
      try {
        await this.program.account.incarraAgent.fetch(agentPDA);
        throw new Error('Agent already exists for this user');
      } catch (error) {
        if (!error.message.includes('Account does not exist')) {
          throw error;
        }
      }

      const tx = await this.program.methods
        .createIncarraAgent(agentName, personality, carvId, verificationSignature)
        .accounts({
          incarraAgent: agentPDA,
          user: userPubkey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([this.payer])
        .rpc();

      console.log('✅ Agent created:', tx);
      
      // Fetch and return the created agent
      const agent = await this.program.account.incarraAgent.fetch(agentPDA);
      return {
        transactionId: tx,
        agentAddress: agentPDA.toString(),
        agent: this.formatAgentData(agent)
      };
    } catch (error) {
      console.error('❌ Error creating agent:', error);
      throw error;
    }
  }

  // Get existing agent
  async getAgent(userPublicKey) {
    try {
      const agentPDA = this.getAgentPDA(userPublicKey);
      const agent = await this.program.account.incarraAgent.fetch(agentPDA);
      
      return {
        address: agentPDA.toString(),
        ...this.formatAgentData(agent)
      };
    } catch (error) {
      console.error('❌ Error fetching agent:', error);
      throw new Error('Agent not found for this user');
    }
  }

  // Record interaction
  async recordInteraction(userPublicKey, interactionType, experienceGained, contextData) {
    try {
      const userPubkey = new PublicKey(userPublicKey);
      const agentPDA = this.getAgentPDA(userPublicKey);

      // Convert interaction type string to enum
      const interactionTypeEnum = this.getInteractionTypeEnum(interactionType);

      const tx = await this.program.methods
        .interactWithIncarra(interactionTypeEnum, new anchor.BN(experienceGained), contextData)
        .accounts({
          incarraAgent: agentPDA,
          owner: userPubkey,
        })
        .signers([this.payer])
        .rpc();

      console.log('✅ Interaction recorded:', tx);
      
      // Fetch updated agent
      const updatedAgent = await this.program.account.incarraAgent.fetch(agentPDA);
      return {
        transactionId: tx,
        agent: this.formatAgentData(updatedAgent)
      };
    } catch (error) {
      console.error('❌ Error recording interaction:', error);
      throw error;
    }
  }

  // Verify Carv ID
  async verifyCarvId(userPublicKey, verificationProof) {
    try {
      const userPubkey = new PublicKey(userPublicKey);
      const agentPDA = this.getAgentPDA(userPublicKey);

      const tx = await this.program.methods
        .verifyCarvId(verificationProof)
        .accounts({
          incarraAgent: agentPDA,
          owner: userPubkey,
        })
        .signers([this.payer])
        .rpc();

      console.log('✅ Carv ID verified:', tx);
      
      const updatedAgent = await this.program.account.incarraAgent.fetch(agentPDA);
      return {
        transactionId: tx,
        agent: this.formatAgentData(updatedAgent)
      };
    } catch (error) {
      console.error('❌ Error verifying Carv ID:', error);
      throw error;
    }
  }

  // Add credential
  async addCredential(userPublicKey, credentialType, credentialData, issuer) {
    try {
      const userPubkey = new PublicKey(userPublicKey);
      const agentPDA = this.getAgentPDA(userPublicKey);

      const tx = await this.program.methods
        .addCredential(credentialType, credentialData, issuer)
        .accounts({
          incarraAgent: agentPDA,
          owner: userPubkey,
        })
        .signers([this.payer])
        .rpc();

      console.log('✅ Credential added:', tx);
      
      const updatedAgent = await this.program.account.incarraAgent.fetch(agentPDA);
      return {
        transactionId: tx,
        agent: this.formatAgentData(updatedAgent)
      };
    } catch (error) {
      console.error('❌ Error adding credential:', error);
      throw error;
    }
  }

  // Add achievement
  async addAchievement(userPublicKey, achievementName, achievementDescription, achievementScore) {
    try {
      const userPubkey = new PublicKey(userPublicKey);
      const agentPDA = this.getAgentPDA(userPublicKey);

      const tx = await this.program.methods
        .addAchievement(achievementName, achievementDescription, new anchor.BN(achievementScore))
        .accounts({
          incarraAgent: agentPDA,
          owner: userPubkey,
        })
        .signers([this.payer])
        .rpc();

      console.log('✅ Achievement added:', tx);
      
      const updatedAgent = await this.program.account.incarraAgent.fetch(agentPDA);
      return {
        transactionId: tx,
        agent: this.formatAgentData(updatedAgent)
      };
    } catch (error) {
      console.error('❌ Error adding achievement:', error);
      throw error;
    }
  }

  // Add knowledge area
  async addKnowledgeArea(userPublicKey, knowledgeArea) {
    try {
      const userPubkey = new PublicKey(userPublicKey);
      const agentPDA = this.getAgentPDA(userPublicKey);

      const tx = await this.program.methods
        .addKnowledgeArea(knowledgeArea)
        .accounts({
          incarraAgent: agentPDA,
          owner: userPubkey,
        })
        .signers([this.payer])
        .rpc();

      console.log('✅ Knowledge area added:', tx);
      
      const updatedAgent = await this.program.account.incarraAgent.fetch(agentPDA);
      return {
        transactionId: tx,
        agent: this.formatAgentData(updatedAgent)
      };
    } catch (error) {
      console.error('❌ Error adding knowledge area:', error);
      throw error;
    }
  }

  // Get Carv profile
  async getCarvProfile(userPublicKey) {
    try {
      const agentPDA = this.getAgentPDA(userPublicKey);
      
      const profile = await this.program.methods
        .getCarvProfile()
        .accounts({
          incarraAgent: agentPDA,
        })
        .view();

      return profile;
    } catch (error) {
      console.error('❌ Error getting Carv profile:', error);
      throw error;
    }
  }

  // Get agent context
  async getAgentContext(userPublicKey) {
    try {
      const agentPDA = this.getAgentPDA(userPublicKey);
      
      const context = await this.program.methods
        .getIncarraContext()
        .accounts({
          incarraAgent: agentPDA,
        })
        .view();

      return context;
    } catch (error) {
      console.error('❌ Error getting agent context:', error);
      throw error;
    }
  }

  // Helper methods
  getInteractionTypeEnum(interactionType) {
    const types = {
      'research': { researchQuery: {} },
      'analysis': { dataAnalysis: {} },
      'conversation': { conversation: {} },
      'problem_solving': { problemSolving: {} }
    };
    
    return types[interactionType] || types['conversation'];
  }

  formatAgentData(agent) {
    return {
      owner: agent.owner.toString(),
      agentName: agent.agentName,
      personality: agent.personality,
      carvId: agent.carvId,
      carvVerified: agent.carvVerified,
      level: agent.level.toNumber(),
      experience: agent.experience.toNumber(),
      reputation: agent.reputation.toNumber(),
      reputationScore: agent.reputationScore.toNumber(),
      totalInteractions: agent.totalInteractions.toNumber(),
      researchProjects: agent.researchProjects.toNumber(),
      aiConversations: agent.aiConversations.toNumber(),
      knowledgeAreas: agent.knowledgeAreas,
      credentials: agent.credentials.map(cred => ({
        credentialType: cred.credentialType,
        credentialData: cred.credentialData,
        issuer: cred.issuer,
        issuedAt: cred.issuedAt.toNumber(),
        isVerified: cred.isVerified
      })),
      achievements: agent.achievements.map(ach => ({
        name: ach.name,
        description: ach.description,
        score: ach.score.toNumber(),
        earnedAt: ach.earnedAt.toNumber()
      })),
      createdAt: agent.createdAt.toNumber(),
      lastInteraction: agent.lastInteraction.toNumber(),
      isActive: agent.isActive
    };
  }

  // Event listening
  async listenToEvents() {
    console.log('🎧 Listening to INCARRA events...');
    
    this.program.addEventListener('IncarraAgentCreated', (event) => {
      console.log('🎉 Agent Created:', event);
    });
    
    this.program.addEventListener('IncarraInteraction', (event) => {
      console.log('💬 Interaction:', event);
    });
    
    this.program.addEventListener('IncarraLevelUp', (event) => {
      console.log('⬆️ Level Up:', event);
    });
    
    this.program.addEventListener('CarvIdVerified', (event) => {
      console.log('✅ Carv ID Verified:', event);
    });
  }
}

module.exports = { IncarraAgentService };