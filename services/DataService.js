// services/DataService.js - External data integration for DeSci research
const axios = require('axios');
const cheerio = require('cheerio');

class DataService {
  constructor() {
    this.arxivBaseUrl = 'http://export.arxiv.org/api/query';
    this.githubApiUrl = 'https://api.github.com';
    this.githubToken = process.env.GITHUB_TOKEN;
    this.semanticScholarUrl = 'https://api.semanticscholar.org/graph/v1';
    
    // Initialize request configs
    this.githubHeaders = this.githubToken ? {
      'Authorization': `token ${this.githubToken}`,
      'Accept': 'application/vnd.github.v3+json'
    } : {};
  }

  // ArXiv paper search and retrieval
  async searchArxivPapers(query, maxResults = 10, category = '') {
    try {
      const searchQuery = encodeURIComponent(query);
      const categoryFilter = category ? `+AND+cat:${category}` : '';
      
      const url = `${this.arxivBaseUrl}?search_query=all:${searchQuery}${categoryFilter}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;
      
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'INCARRA-Research-Agent/1.0'
        }
      });

      return this.parseArxivResponse(response.data);
    } catch (error) {
      console.error('❌ Error searching ArXiv:', error);
      throw new Error('Failed to search ArXiv papers');
    }
  }

  // Parse ArXiv XML response
  parseArxivResponse(xmlData) {
    const papers = [];
    
    try {
      // Simple XML parsing - in production, use a proper XML parser
      const entryMatches = xmlData.match(/<entry>[\s\S]*?<\/entry>/g);
      
      if (!entryMatches) {
        return papers;
      }

      entryMatches.forEach(entry => {
        const paper = this.extractPaperInfo(entry);
        if (paper) papers.push(paper);
      });

      return papers;
    } catch (error) {
      console.error('Error parsing ArXiv response:', error);
      return papers;
    }
  }

  extractPaperInfo(entryXml) {
    try {
      const extractField = (field) => {
        const match = entryXml.match(new RegExp(`<${field}[^>]*>([\\s\\S]*?)<\\/${field}>`));
        return match ? match[1].trim() : '';
      };

      const extractLink = () => {
        const linkMatch = entryXml.match(/<link[^>]*href="([^"]*)"[^>]*title="pdf"/);
        return linkMatch ? linkMatch[1] : '';
      };

      const extractAuthors = () => {
        const authorMatches = entryXml.match(/<author>[\s\S]*?<name>([^<]*)<\/name>[\s\S]*?<\/author>/g);
        if (!authorMatches) return [];
        
        return authorMatches.map(match => {
          const nameMatch = match.match(/<name>([^<]*)<\/name>/);
          return nameMatch ? nameMatch[1].trim() : '';
        }).filter(name => name);
      };

      const extractCategories = () => {
        const categoryMatches = entryXml.match(/<category[^>]*term="([^"]*)"[^>]*\/>/g);
        if (!categoryMatches) return [];
        
        return categoryMatches.map(match => {
          const termMatch = match.match(/term="([^"]*)"/);
          return termMatch ? termMatch[1] : '';
        }).filter(term => term);
      };

      return {
        id: extractField('id').replace('http://arxiv.org/abs/', ''),
        title: extractField('title').replace(/\s+/g, ' '),
        summary: extractField('summary').replace(/\s+/g, ' ').substring(0, 500),
        authors: extractAuthors(),
        publishedDate: extractField('published'),
        updatedDate: extractField('updated'),
        pdfUrl: extractLink(),
        categories: extractCategories(),
        source: 'arxiv'
      };
    } catch (error) {
      console.error('Error extracting paper info:', error);
      return null;
    }
  }

  // Get specific ArXiv paper by ID
  async getArxivPaper(paperId) {
    try {
      const url = `${this.arxivBaseUrl}?id_list=${paperId}`;
      const response = await axios.get(url, { timeout: 10000 });
      
      const papers = this.parseArxivResponse(response.data);
      return papers.length > 0 ? papers[0] : null;
    } catch (error) {
      console.error('❌ Error fetching ArXiv paper:', error);
      throw new Error('Failed to fetch ArXiv paper');
    }
  }

  // GitHub repository search for research projects
  async searchGithubRepositories(query, language = '', topic = '') {
    try {
      let searchQuery = query;
      if (language) searchQuery += `+language:${language}`;
      if (topic) searchQuery += `+topic:${topic}`;
      
      const url = `${this.githubApiUrl}/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=updated&order=desc&per_page=20`;
      
      const response = await axios.get(url, {
        headers: this.githubHeaders,
        timeout: 10000
      });

      return response.data.items.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        topics: repo.topics || [],
        updatedAt: repo.updated_at,
        htmlUrl: repo.html_url,
        cloneUrl: repo.clone_url,
        license: repo.license?.name || null,
        source: 'github'
      }));
    } catch (error) {
      console.error('❌ Error searching GitHub:', error);
      throw new Error('Failed to search GitHub repositories');
    }
  }

  // Get GitHub repository details
  async getGithubRepository(owner, repo) {
    try {
      const url = `${this.githubApiUrl}/repos/${owner}/${repo}`;
      const response = await axios.get(url, {
        headers: this.githubHeaders,
        timeout: 10000
      });

      const repoData = response.data;
      
      // Get README content
      let readmeContent = '';
      try {
        const readmeResponse = await axios.get(`${this.githubApiUrl}/repos/${owner}/${repo}/readme`, {
          headers: { ...this.githubHeaders, 'Accept': 'application/vnd.github.v3.raw' },
          timeout: 5000
        });
        readmeContent = readmeResponse.data.substring(0, 2000); // Limit README length
      } catch (readmeError) {
        console.log('No README found or error fetching README');
      }

      return {
        id: repoData.id,
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        topics: repoData.topics || [],
        createdAt: repoData.created_at,
        updatedAt: repoData.updated_at,
        htmlUrl: repoData.html_url,
        license: repoData.license?.name || null,
        readmeContent,
        source: 'github'
      };
    } catch (error) {
      console.error('❌ Error fetching GitHub repository:', error);
      throw new Error('Failed to fetch GitHub repository');
    }
  }

  // Semantic Scholar paper search
  async searchSemanticScholar(query, limit = 10) {
    try {
      const url = `${this.semanticScholarUrl}/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=paperId,title,abstract,authors,year,citationCount,publicationDate,journal`;
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'INCARRA-Research-Agent/1.0'
        }
      });

      return response.data.data.map(paper => ({
        id: paper.paperId,
        title: paper.title,
        abstract: paper.abstract,
        authors: paper.authors?.map(author => author.name) || [],
        year: paper.year,
        citationCount: paper.citationCount,
        publicationDate: paper.publicationDate,
        journal: paper.journal?.name || '',
        source: 'semantic_scholar'
      }));
    } catch (error) {
      console.error('❌ Error searching Semantic Scholar:', error);
      throw new Error('Failed to search Semantic Scholar');
    }
  }

  // Get paper recommendations based on interests
  async getRecommendedPapers(knowledgeAreas, limit = 15) {
    try {
      const allPapers = [];
      
      // Search for papers in each knowledge area
      for (const area of knowledgeAreas.slice(0, 3)) { // Limit to 3 areas to avoid rate limits
        try {
          const arxivPapers = await this.searchArxivPapers(area, 5);
          allPapers.push(...arxivPapers);
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.log(`Failed to get papers for ${area}:`, error.message);
        }
      }

      // Remove duplicates and sort by date
      const uniquePapers = allPapers.filter((paper, index, self) => 
        index === self.findIndex(p => p.id === paper.id)
      );

      return uniquePapers
        .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate))
        .slice(0, limit);
    } catch (error) {
      console.error('❌ Error getting recommended papers:', error);
      throw new Error('Failed to get recommended papers');
    }
  }

  // Search for research datasets (simplified)
  async searchDatasets(query, source = 'all') {
    try {
      // This would integrate with actual dataset APIs like:
      // - Zenodo API
      // - Figshare API
      // - Dryad API
      // For now, return mock data structure
      
      return [
        {
          id: 'mock_dataset_1',
          title: `${query} Research Dataset`,
          description: `Comprehensive dataset related to ${query} research`,
          authors: ['Research Team'],
          publishedDate: new Date().toISOString(),
          format: 'CSV, JSON',
          size: '2.5 GB',
          license: 'CC BY 4.0',
          downloadUrl: 'https://example.com/dataset',
          source: 'zenodo'
        }
      ];
    } catch (error) {
      console.error('❌ Error searching datasets:', error);
      throw new Error('Failed to search datasets');
    }
  }

  // Aggregate research data from multiple sources
  async aggregateResearchData(query, options = {}) {
    const { 
      includeArxiv = true, 
      includeGithub = true, 
      includeSemanticScholar = false,
      limit = 20 
    } = options;

    const results = {
      papers: [],
      repositories: [],
      datasets: [],
      totalResults: 0,
      query,
      timestamp: new Date().toISOString()
    };

    try {
      // Parallel searches with error handling
      const promises = [];

      if (includeArxiv) {
        promises.push(
          this.searchArxivPapers(query, Math.floor(limit * 0.6))
            .then(papers => ({ papers, error: null }))
            .catch(error => ({ papers: [], error: error.message }))
        );
      }

      if (includeGithub) {
        promises.push(
          this.searchGithubRepositories(query)
            .then(repositories => ({ repositories, error: null }))
            .catch(error => ({ repositories: [], error: error.message }))
        );
      }

      if (includeSemanticScholar) {
        promises.push(
          this.searchSemanticScholar(query, Math.floor(limit * 0.4))
            .then(papers => ({ semanticPapers: papers, error: null }))
            .catch(error => ({ semanticPapers: [], error: error.message }))
        );
      }

      const searchResults = await Promise.all(promises);

      // Process results
      searchResults.forEach(result => {
        if (result.papers) {
          results.papers.push(...result.papers);
        }
        if (result.semanticPapers) {
          results.papers.push(...result.semanticPapers);
        }
        if (result.repositories) {
          results.repositories = result.repositories;
        }
        if (result.error) {
          console.log('Search error:', result.error);
        }
      });

      results.totalResults = results.papers.length + results.repositories.length;

      return results;
    } catch (error) {
      console.error('❌ Error aggregating research data:', error);
      throw new Error('Failed to aggregate research data');
    }
  }

  // Get trending research topics
  async getTrendingTopics() {
    try {
      // This would analyze recent papers to identify trending topics
      // For now, return some common research areas
      return [
        { topic: 'Machine Learning', count: 1250, growth: '+15%' },
        { topic: 'Quantum Computing', count: 890, growth: '+28%' },
        { topic: 'Blockchain', count: 675, growth: '+12%' },
        { topic: 'Climate Science', count: 1100, growth: '+22%' },
        { topic: 'Biotechnology', count: 950, growth: '+18%' },
        { topic: 'Renewable Energy', count: 780, growth: '+25%' }
      ];
    } catch (error) {
      console.error('❌ Error getting trending topics:', error);
      throw new Error('Failed to get trending topics');
    }
  }

  // Extract research metrics
  async getResearchMetrics(paperId, source = 'arxiv') {
    try {
      // This would integrate with citation databases
      // Return mock metrics for now
      return {
        paperId,
        source,
        citationCount: Math.floor(Math.random() * 100),
        hIndex: Math.floor(Math.random() * 20),
        altmetricScore: Math.floor(Math.random() * 500),
        downloadCount: Math.floor(Math.random() * 1000),
        socialMentions: Math.floor(Math.random() * 50),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error getting research metrics:', error);
      throw new Error('Failed to get research metrics');
    }
  }

  // Parse and extract key information from research papers
  async extractPaperInsights(paperContent, paperTitle) {
    try {
      // This would use NLP to extract key insights
      // For now, return structured insights
      const insights = {
        title: paperTitle,
        keyFindings: [],
        methodology: '',
        limitations: [],
        futureWork: [],
        citations: [],
        keyTerms: [],
        researchArea: '',
        significance: ''
      };

      // Simple keyword extraction (in production, use proper NLP)
      const content = paperContent.toLowerCase();
      
      // Extract potential key terms
      const keyTermPatterns = [
        /machine learning/g,
        /artificial intelligence/g,
        /deep learning/g,
        /neural network/g,
        /quantum/g,
        /blockchain/g,
        /algorithm/g,
        /optimization/g,
        /classification/g,
        /regression/g
      ];

      keyTermPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          insights.keyTerms.push(...matches);
        }
      });

      // Remove duplicates
      insights.keyTerms = [...new Set(insights.keyTerms)];

      return insights;
    } catch (error) {
      console.error('❌ Error extracting paper insights:', error);
      throw new Error('Failed to extract paper insights');
    }
  }

  // Get research collaboration suggestions
  async getCollaborationSuggestions(userProfile) {
    try {
      // This would analyze user's research interests and suggest collaborators
      // Return mock suggestions for now
      return [
        {
          name: 'Dr. Sarah Chen',
          institution: 'MIT',
          researchAreas: ['Machine Learning', 'Computer Vision'],
          commonInterests: 2,
          recentPapers: 15,
          collaborationScore: 0.85
        },
        {
          name: 'Prof. Michael Rodriguez',
          institution: 'Stanford',
          researchAreas: ['Quantum Computing', 'Algorithms'],
          commonInterests: 1,
          recentPapers: 23,
          collaborationScore: 0.72
        }
      ];
    } catch (error) {
      console.error('❌ Error getting collaboration suggestions:', error);
      throw new Error('Failed to get collaboration suggestions');
    }
  }

  // Monitor research alerts based on user interests
  async setupResearchAlerts(userPublicKey, keywords, frequency = 'weekly') {
    try {
      // This would set up automated alerts for new papers
      const alertId = `alert_${userPublicKey}_${Date.now()}`;
      
      return {
        alertId,
        keywords,
        frequency,
        createdAt: new Date().toISOString(),
        isActive: true,
        nextCheck: this.calculateNextCheck(frequency)
      };
    } catch (error) {
      console.error('❌ Error setting up research alerts:', error);
      throw new Error('Failed to setup research alerts');
    }
  }

  // Helper function to calculate next check time
  calculateNextCheck(frequency) {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  }

  // Get research statistics and analytics
  async getResearchAnalytics(timeframe = '30d') {
    try {
      // This would provide analytics on research trends
      return {
        timeframe,
        totalPapers: Math.floor(Math.random() * 10000),
        topCategories: [
          { category: 'cs.AI', count: 1250 },
          { category: 'cs.LG', count: 980 },
          { category: 'physics.quant-ph', count: 750 }
        ],
        growthRate: '+12.5%',
        averageCitations: 8.7,
        topInstitutions: [
          'MIT', 'Stanford', 'Google', 'OpenAI', 'DeepMind'
        ],
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error getting research analytics:', error);
      throw new Error('Failed to get research analytics');
    }
  }
}

module.exports = { DataService };