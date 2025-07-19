echo "🚀 Setting up INCARRA Backend..."

# Create directories
mkdir -p logs idl tests docs utils middleware

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Solana keypair if not exists
if [ ! -f "keypair.json" ]; then
    echo "🔑 Generating Solana keypair..."
    solana-keygen new --outfile keypair.json --no-bip39-passphrase
fi

# Fund wallet on devnet
echo "💰 Funding wallet on devnet..."
solana airdrop 2 -k keypair.json --url devnet

# Generate IDL from deployed program
echo "📄 Fetching program IDL..."
anchor idl fetch 9cPZ5PjWUmL9g3os5d7xqsy9XSSKP2ekMNiYRNRYyV1 --provider.cluster devnet --output idl/incarra_agent.json || echo "❌ Could not fetch IDL - you may need to deploy your program first"

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your OpenAI API key to .env"
echo "2. Deploy your Solana program if not already deployed"
echo "3. Run 'npm run dev' to start development server"
echo "4. Test the API at http://localhost:3001/health"

## Deployment Script (deploy.js)
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Deploying INCARRA Backend...');

// Check environment
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not set');
  process.exit(1);
}

if (!fs.existsSync('keypair.json')) {
  console.error('❌ keypair.json not found');
  process.exit(1);
}

// Run tests
console.log('🧪 Running tests...');
try {
  execSync('npm test', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Tests failed');
  process.exit(1);
}

// Check Solana program
console.log('🔍 Checking Solana program...');
try {
  execSync(`solana program show ${process.env.PROGRAM_ID || '9cPZ5PjWUmL9g3os5d7xqsy9XSSKP2ekMNiYRNRYyV1'}`, { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Solana program not found or not deployed');
  process.exit(1);
}

console.log('✅ Deployment checks passed!');
console.log('📦 Ready for production deployment');

## Docker Configuration (Dockerfile)
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start application
CMD ["npm", "start"]

## Docker Compose (docker-compose.yml)
version: '3.8'

services:
  incarra-backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
      - ./keypair.json:/app/keypair.json:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl:ro
    depends_on:
      - incarra-backend
    restart: unless-stopped