# Hangaurd Index 🚀

<div align="center">
  <img src="./logo.jpeg" alt="Hangaurd Logo" width="200" height="200" />
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.18.3-brightgreen)](https://nodejs.org/)
  [![Hedera Testnet](https://img.shields.io/badge/Hedera-Testnet-purple)](https://testnet.hedera.com/)
  [![Built with Scaffold-ETH](https://img.shields.io/badge/Built%20with-Scaffold--ETH-blue)](https://scaffoldeth.io/)
</div>

## 🌟 Project Description

**Hangaurd Index** is a revolutionary decentralized platform built on **Hedera Hashgraph** that enables anyone to create and invest in diversified cryptocurrency index funds using **HBAR**. Leveraging Hedera's fast, secure, and low-cost consensus mechanism, investors can purchase a single fund token that automatically diversifies their investment across multiple cryptocurrencies through smart contract-managed vaults.

### 🎯 Key Value Propositions
- **Lightning Fast**: Hedera's consensus provides 3-5 second finality
- **Ultra Low Fees**: Predictable fees starting at $0.0001 USD
- **Enterprise Grade**: Built on Hedera's enterprise-ready infrastructure
- **Carbon Negative**: Powered by Hedera's sustainable consensus algorithm
- **Regulatory Compliant**: Hedera's governance model ensures regulatory clarity

---

## ✨ Features

### 🏗️ Core Functionality
- **Custom Index Funds**: Create personalized crypto index funds with flexible token weightings
- **HBAR Investment**: Single HBAR token investment, automatically diversified across underlying tokens
- **Secure Custody**: On-chain vaults managed by fund creators with Hedera's security guarantees
- **Dynamic Rebalancing**: Fund creators can adjust token allocations to optimize performance
- **Fair Fee Structure**: Transparent 1% fees distributed to creators, treasury, and governance token buybacks
- **DEX Integration**: Seamless integration with Hedera-based DEXs for token swaps

### 🚀 Hedera-Specific Advantages
- **Hedera Token Service (HTS)**: Native token creation and management
- **Hedera Consensus Service (HCS)**: Immutable audit trails for all fund operations
- **Hedera Smart Contract Service (HSCS)**: EVM-compatible smart contracts with Hedera benefits
- **Predictable Fees**: Fixed USD-denominated fees regardless of network congestion
- **Instant Finality**: No waiting for block confirmations
- **Energy Efficient**: Carbon-negative network operations

### 🔮 Advanced Features (Roadmap)
- **HTS Token Staking**: Automated staking of vault tokens for additional yield
- **Collateralized Lending**: Use fund tokens as collateral for borrowing
- **AI Fund Managers**: Automated rebalancing with AI-driven investment strategies
- **Cross-Network Bridges**: Multi-chain fund creation using Hedera's interoperability
- **DAO Governance**: Community-driven platform control and fund oversight
- **Hedera Mirror Node Integration**: Enhanced analytics and reporting

---

## 🛠️ Tech Stack

### Blockchain & Smart Contracts
- **Blockchain**: Hedera Hashgraph Testnet
- **Smart Contracts**: Solidity contracts deployed on Hedera Smart Contract Service
- **Token Standard**: Hedera Token Service (HTS) for native token operations
- **Development Framework**: Scaffold-ETH adapted for Hedera

### Frontend & User Interface
- **Framework**: Next.js 15 with App Router
- **Styling**: TailwindCSS with DaisyUI components
- **State Management**: Zustand for global state management
- **Wallet Integration**: HashConnect for Hedera wallet connectivity
- **Charts & Analytics**: Recharts for portfolio visualization

### Backend & Infrastructure
- **Database**: Supabase (PostgreSQL) for user data and metadata
- **Real-time Updates**: Supabase Realtime for live data synchronization
- **File Storage**: Supabase Storage for fund documents and images
- **API**: Hedera Mirror Node REST API for blockchain data
- **Oracles**: Hedera-compatible price oracles for token valuations

### Development Tools
- **Package Manager**: Yarn 3.2.3
- **Code Quality**: ESLint, Prettier, Husky for pre-commit hooks
- **Testing**: Hardhat testing framework adapted for Hedera
- **Deployment**: Vercel for frontend, Hedera testnet for contracts

---

## 🚀 Getting Started

### 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20.18.3 or higher
- **Yarn**: Version 3.2.3 (recommended) or npm
- **Git**: For version control
- **Hedera Wallet**: HashPack, Blade, or any Hedera-compatible wallet

### 🔧 Environment Setup

1. **Hedera Testnet Account**: Create a testnet account at [Hedera Portal](https://portal.hedera.com/)
2. **Testnet HBAR**: Get free testnet HBAR from the [Hedera Faucet](https://portal.hedera.com/faucet)
3. **Wallet Configuration**: Configure your wallet to connect to Hedera testnet

### 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/hangaurd-index.git
cd hangaurd-index

# Install dependencies
yarn install

# Copy environment variables
cp .env.example .env.local
```

### ⚙️ Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Hedera Network Configuration
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com

# Smart Contract Addresses (will be populated after deployment)
NEXT_PUBLIC_FUND_FACTORY_ADDRESS=
NEXT_PUBLIC_HGI_TOKEN_ADDRESS=

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# HashConnect Configuration
NEXT_PUBLIC_HASHCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_HASHCONNECT_APP_NAME=Hangaurd Index

# Optional: Analytics and Monitoring
NEXT_PUBLIC_ANALYTICS_ID=
SENTRY_DSN=
```

### 🏗️ Development Setup

```bash
# Start local Hedera node (optional, for local development)
yarn chain

# Compile smart contracts
yarn compile

# Deploy contracts to Hedera testnet
yarn deploy --network hedera-testnet

# Start the frontend development server
yarn start
```

The application will be available at `http://localhost:3000`

### 🧪 Testing

```bash
# Run smart contract tests
yarn test

# Run frontend tests
yarn test:frontend

# Run integration tests
yarn test:integration

# Check code formatting
yarn format

# Lint code
yarn lint
```

---

## 📖 Usage Guide

### 🔗 Connecting Your Wallet

1. **Install HashPack**: Download from [HashPack](https://www.hashpack.app/)
2. **Create/Import Account**: Set up your Hedera testnet account
3. **Get Testnet HBAR**: Use the Hedera faucet to get testnet tokens
4. **Connect to Hangaurd**: Click "Connect Wallet" and approve the connection

### 💰 Creating Your First Index Fund

1. **Navigate to Create Fund**: Click "Create Fund" in the navigation
2. **Fund Details**: 
   - Enter fund name (e.g., "DeFi Leaders")
   - Choose unique ticker symbol (e.g., "DEFI")
   - Add description and upload fund image
3. **Select Tokens**: Choose tokens for your index from available Hedera tokens
4. **Set Weightings**: Assign percentage weights (must total 100%)
5. **Review & Deploy**: 
   - Review creation fee (1000 HGI tokens)
   - Confirm transaction in your wallet
   - Wait for deployment confirmation

### 📈 Investing in Index Funds

1. **Browse Marketplace**: Explore available funds in the marketplace
2. **Fund Analysis**: 
   - Review fund composition and performance
   - Check creator reputation and fund metrics
   - Analyze historical returns and volatility
3. **Make Investment**:
   - Enter HBAR amount to invest
   - Review fee breakdown (1% platform fee)
   - Confirm transaction
   - Receive fund tokens in your wallet

### ⚖️ Rebalancing Your Fund (Fund Creators)

1. **Access Fund Management**: Navigate to your created funds
2. **Analyze Performance**: Review current allocation vs. target weights
3. **Adjust Weights**: Modify token percentages based on market conditions
4. **Execute Rebalance**: Confirm rebalancing transaction
5. **Monitor Results**: Track performance improvements

---

## 🏗️ Smart Contract Architecture

### 📋 Contract Overview

```solidity
// Core Contracts
├── HGIToken.sol              // Governance token (ERC-20)
├── FundFactory.sol           // Fund creation and management
├── IndexFund.sol             // Individual fund logic
├── HederaTokenManager.sol    // HTS integration
└── PriceOracle.sol          // Price feed management
```

### 🔧 Key Contract Functions

#### **FundFactory.sol**
```solidity
function createFund(
    string memory fundName,
    string memory fundTicker,
    address[] memory tokens,
    uint256[] memory weights
) external returns (address fundAddress);

function getFund(uint256 fundId) external view returns (FundInfo memory);
```

#### **IndexFund.sol**
```solidity
function buyFundTokens() external payable;
function sellFundTokens(uint256 amount) external;
function rebalance(uint256[] memory newWeights) external onlyCreator;
function getCurrentFundValue() external view returns (uint256);
```

### 🌐 Hedera Integration

- **HTS Integration**: Native token operations using Hedera Token Service
- **Mirror Node Queries**: Real-time blockchain data access
- **Consensus Service**: Immutable audit trails for fund operations
- **Smart Contract Service**: EVM-compatible contracts with Hedera benefits

---

## 🗄️ Database Schema

### 📊 Core Tables

```sql
-- Users with Hedera addresses
CREATE TABLE users_hedera (
    hedera_account_id TEXT PRIMARY KEY,  -- 0.0.123456 format
    wallet_address TEXT,                 -- EVM address if applicable
    display_name TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Funds on Hedera
CREATE TABLE funds_hedera (
    fund_address TEXT PRIMARY KEY,
    fund_id BIGINT NOT NULL,
    creator_account_id TEXT REFERENCES users_hedera(hedera_account_id),
    name TEXT NOT NULL,
    ticker TEXT UNIQUE NOT NULL,
    hgi_burned DECIMAL(18,8) DEFAULT 1000,
    underlying_tokens TEXT[],
    creation_date TIMESTAMP DEFAULT NOW()
);

-- HTS Token Integration
CREATE TABLE hedera_tokens (
    token_id TEXT PRIMARY KEY,           -- 0.0.789012 format
    token_address TEXT,                  -- EVM address
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    decimals INTEGER DEFAULT 8,
    is_active BOOLEAN DEFAULT true
);
```

---

## 🚀 Deployment Guide

### 🌐 Hedera Testnet Deployment

1. **Prepare Deployment Account**:
   ```bash
   # Generate new account or use existing
   yarn account:generate
   
   # Fund account with testnet HBAR
   # Visit https://portal.hedera.com/faucet
   ```

2. **Configure Network**:
   ```javascript
   // hardhat.config.js
   networks: {
     "hedera-testnet": {
       url: "https://testnet.hashio.io/api",
       accounts: [process.env.PRIVATE_KEY],
       chainId: 296
     }
   }
   ```

3. **Deploy Contracts**:
   ```bash
   # Deploy to Hedera testnet
   yarn deploy --network hedera-testnet
   
   # Verify contracts (if supported)
   yarn verify --network hedera-testnet
   ```

4. **Update Environment**:
   ```bash
   # Update .env.local with deployed contract addresses
   NEXT_PUBLIC_FUND_FACTORY_ADDRESS=0x...
   NEXT_PUBLIC_HGI_TOKEN_ADDRESS=0x...
   ```

### 🌍 Frontend Deployment

```bash
# Build for production
yarn build

# Deploy to Vercel
yarn vercel

# Or deploy to other platforms
yarn export  # For static export
```

---

## 🧪 Testing Strategy

### 🔬 Smart Contract Tests

```bash
# Unit tests for individual contracts
yarn test:contracts

# Integration tests for contract interactions
yarn test:integration

# Gas optimization tests
yarn test:gas
```

### 🖥️ Frontend Tests

```bash
# Component unit tests
yarn test:components

# End-to-end tests with Hedera testnet
yarn test:e2e

# Performance tests
yarn test:performance
```

### 🌐 Hedera-Specific Tests

- **HTS Token Operations**: Create, mint, transfer, burn
- **Mirror Node Integration**: Query transaction history and account data
- **Consensus Service**: Message submission and retrieval
- **Fee Calculation**: Validate Hedera fee structures

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🐛 Bug Reports
- Use GitHub Issues to report bugs
- Include detailed reproduction steps
- Provide environment information

### 💡 Feature Requests
- Discuss new features in GitHub Discussions
- Consider Hedera-specific capabilities
- Align with project roadmap

### 🔧 Development Contributions
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `yarn test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### 📝 Code Standards
- Follow ESLint configuration
- Use Prettier for code formatting
- Write comprehensive tests
- Document new features
- Follow Hedera best practices

---

## 🛣️ Roadmap

### 🎯 Phase 1: Core Platform (Q1 2024)
- [x] Basic fund creation and investment
- [x] Hedera testnet integration
- [x] HashConnect wallet support
- [ ] HTS token integration
- [ ] Basic rebalancing functionality

### 🚀 Phase 2: Advanced Features (Q2 2024)
- [ ] AI-powered fund management
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Hedera mainnet deployment
- [ ] Institutional investor features

### 🌟 Phase 3: Ecosystem Expansion (Q3 2024)
- [ ] Cross-chain bridge integration
- [ ] DeFi protocol partnerships
- [ ] NFT-backed investment strategies
- [ ] Governance token launch
- [ ] DAO implementation

### 🔮 Phase 4: Enterprise Features (Q4 2024)
- [ ] Regulatory compliance tools
- [ ] Institutional custody solutions
- [ ] API for third-party integrations
- [ ] White-label solutions
- [ ] Global expansion

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support & Community

### 📞 Getting Help
- **Documentation**: Check our [Wiki](https://github.com/your-username/hangaurd-index/wiki)
- **GitHub Issues**: Report bugs and request features
- **Discord**: Join our [community server](https://discord.gg/hangaurd)
- **Twitter**: Follow [@HangaurdIndex](https://twitter.com/hangaurdindex)

### 🌍 Community Resources
- **Hedera Developer Portal**: [https://hedera.com/developers](https://hedera.com/developers)
- **Hedera Discord**: [https://hedera.com/discord](https://hedera.com/discord)
- **Scaffold-ETH**: [https://scaffoldeth.io](https://scaffoldeth.io)

### 📧 Contact
- **Team Email**: team@hangaurd.io
- **Business Inquiries**: business@hangaurd.io
- **Security Issues**: security@hangaurd.io

---

## 🙏 Acknowledgments

- **Hedera Hashgraph**: For providing the fast, secure, and sustainable blockchain infrastructure
- **Scaffold-ETH**: For the excellent development framework
- **Supabase**: For the robust backend infrastructure
- **The Community**: For continuous feedback and contributions

---

<div align="center">
  <p>Built with ❤️ on Hedera Hashgraph</p>
  <p>
    <a href="https://hedera.com">
      <img src="https://hedera.com/logo.svg" alt="Hedera" width="100">
    </a>
  </p>
</div>

---

**Disclaimer**: This project is in active development. Use testnet funds only. Not financial advice.
