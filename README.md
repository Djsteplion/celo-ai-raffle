# Celo Agent-Powered Raffle

A fully on-chain, agent-powered raffle/lottery built on **Celo Alfajores** testnet.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Smart Contracts | Solidity 0.8.20, Hardhat |
| Randomness | Chainlink VRF v2 |
| Wallet | Wagmi v2 + RainbowKit |
| Payments | cUSD (ERC-20) via x402 pattern |
| Agent Identity | ERC-8004 on-chain registration |
| AI Commentary | OpenAI GPT-4o-mini (ARIA Agent) |
| Chain | Celo Alfajores (testnet) |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │PrizePool │ │ Ticket   │ │ LiveDraw │ │  ARIA    │  │
│  │ Display  │ │ Purchase │ │Animation │ │  Agent   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘
         │ Wagmi/RainbowKit           │ OpenAI API
┌─────────────────────┐    ┌─────────────────────────────┐
│   CeloRaffle.sol    │    │     /api/agent route         │
│                     │    │   GPT-4o-mini commentary     │
│ ├─ ERC-8004 Agent   │    └─────────────────────────────┘
│ ├─ Chainlink VRF    │
│ ├─ cUSD Payments    │
│ └─ Winner Logic     │
└─────────────────────┘
         │
┌─────────────────────┐
│  Chainlink VRF v2   │
│  (Alfajores)        │
└─────────────────────┘
```

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
# Fill in your values
```

### 3. Get testnet tokens
- CELO: https://faucet.celo.org/alfajores
- cUSD: Available from the faucet above

### 4. Set up Chainlink VRF subscription
1. Go to https://vrf.chain.link/alfajores
2. Create a subscription and fund it with LINK
3. Note your subscription ID
4. Update `SUBSCRIPTION_ID` in `scripts/deploy.ts`

### 5. Deploy the contract
```bash
npm run compile
npm run deploy
# Copy the contract address to NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local
```

### 6. Add contract to VRF subscription
- Go back to https://vrf.chain.link/alfajores
- Add your deployed contract address as a consumer

### 7. Run the app
```bash
npm run dev
```

Open http://localhost:3000

---

## Contract Details

### CeloRaffle.sol

**Celo Alfajores addresses:**
- VRF Coordinator: `0x326C977E6efc84E512bB9C30f76E30c160eD06FB`
- cUSD: `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`
- LINK Token: `0xa36085F69e2889c224210F603D836748e7dC0088`

**Key functions:**
```solidity
purchaseTickets(uint256 numTickets)  // Buy tickets with cUSD
requestDraw()                         // Owner: trigger Chainlink VRF draw
startNewRaffle()                      // Owner: reset for new round
registerAgent(bytes32, string)        // ERC-8004: register AI agent
activateAgent(bytes32)                // Owner: set active agent
```

**Raffle states:**
- `OPEN (0)` — Tickets on sale
- `DRAWING (1)` — VRF requested, awaiting randomness
- `CLOSED (2)` — Winner paid out

### ERC-8004 Agent Identity

The contract implements a simplified ERC-8004 pattern for on-chain AI agent identity:

```solidity
struct AgentIdentity {
    bytes32 agentId;      // Unique agent identifier
    string metadata;       // JSON or IPFS CID with agent capabilities
    address operator;      // Wallet that registered the agent
    bool active;          // Registration status
    uint256 registeredAt; // Timestamp
}
```

### x402 Payment Protocol

Ticket purchases follow the x402 payment flow:
1. User calls `approve(contractAddress, amount)` on cUSD
2. User calls `purchaseTickets(n)` — contract pulls cUSD
3. Contract records participant entries
4. On draw: 95% goes to winner, 5% protocol fee

---

## ARIA Agent

ARIA (Autonomous Raffle Intelligence Agent) provides live commentary powered by GPT-4o-mini.

**Trigger events:**
- `welcome` — When app loads
- `ticket_purchase` — When someone buys tickets
- `draw_start` — When draw is requested
- `winner_announced` — When winner is selected

ARIA is registered on-chain with an ERC-8004 identity at deploy time.

---

## Project Structure

```
celo-raffle/
├── contracts/
│   └── CeloRaffle.sol          # Main raffle contract
├── scripts/
│   └── deploy.ts               # Deployment script
├── src/
│   ├── app/
│   │   ├── api/agent/route.ts  # ARIA agent API endpoint
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── AdminPanel.tsx       # Owner controls
│   │   ├── AgentPanel.tsx       # ARIA commentary UI
│   │   ├── LiveDraw.tsx         # Slot machine animation
│   │   ├── Navbar.tsx
│   │   ├── PrizePool.tsx        # Prize display
│   │   ├── RaffleApp.tsx        # Main orchestrator
│   │   ├── Ticker.tsx
│   │   ├── TicketPurchase.tsx   # Buy tickets UI
│   │   ├── WalletProvider.tsx   # Wagmi + RainbowKit
│   │   └── WinnerAnnouncement.tsx # Confetti modal
│   ├── hooks/
│   │   ├── useAgent.ts          # ARIA commentary hook
│   │   ├── useConfetti.ts       # Confetti effect
│   │   └── useRaffle.ts         # All contract interactions
│   └── lib/
│       ├── agent.ts             # OpenAI integration
│       ├── contracts.ts         # ABI + addresses
│       └── wagmi.ts             # Chain config
├── hardhat.config.ts
├── next.config.js
└── package.json
```

---

## Testnet Resources

| Resource | URL |
|---|---|
| Celo Faucet | https://faucet.celo.org/alfajores |
| Alfajores Explorer | https://alfajores.celoscan.io |
| Chainlink VRF | https://vrf.chain.link/alfajores |
| WalletConnect | https://cloud.walletconnect.com |
