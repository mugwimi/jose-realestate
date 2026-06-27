markdown# 

JoseRealEstate — On-Chain Property Marketplace

![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity)
![Hardhat](https://img.shields.io/badge/Hardhat-2.22-yellow)
![Tests](https://img.shields.io/badge/Tests-32%20passing-brightgreen)
![Network](https://img.shields.io/badge/Network-Sepolia-blue)
![License](https://img.shields.io/badge/License-MIT-green)

A decentralized real estate marketplace where listings, ownership transfers,
and buyer reviews are all settled and stored on-chain. List a property,
sell it directly for ETH, and let buyers leave star ratings that anyone
can verify. Deployed and verified on Ethereum Sepolia.

---

## Live deployment

| | |
|---|---|
| **RealEstate contract** | [`0xa9c07A6eE103afD1C9DFBfC50DE4823e24f2074d`](https://sepolia.etherscan.io/address/0xa9c07A6eE103afD1C9DFBfC50DE4823e24f2074d#code) |
| **Network** | Ethereum Sepolia Testnet |

---

## What this demonstrates

This project shows a full real-world marketplace pattern: structured
on-chain records (not just tokens), peer-to-peer ETH settlement with
ownership transfer in a single transaction, and a reputation system
(ratings + likeable reviews) layered on top — all without an escrow
intermediary or off-chain database. It's the same pattern used by
NFT marketplaces and asset-tokenization platforms, applied to real estate.

---

## Core mechanics

| Mechanic | How it works |
|---|---|
| **Listing** | Anyone can list a property with title, category, images, address, description, and price |
| **Direct sale** | Buyer sends ETH ≥ price in one transaction; ownership transfers atomically, payment forwards to the seller |
| **Resale** | Properties can be bought and resold indefinitely — each sale emits an on-chain event |
| **Reviews** | Buyers (or anyone) can leave a 1–5 star rating with a comment, tied to the property |
| **Review likes** | Reviews can be upvoted, surfacing the most helpful feedback |
| **Highest rated** | `getHighestRatedProduct()` computes the property with the best average rating on-chain |

---

## Bugs found and fixed from the original draft

This contract started as a working draft with a few real issues that
were caught and corrected during test-driven development — a good
example of why test coverage matters before shipping:

- **Off-by-one indexing**: `listProperty` returned a pre-incremented id
  while every getter (`getAllProperties`, `getUserProperties`, `getProperty`)
  indexed from `id + 1`, silently dropping property `#0` from all reads.
- **Wrong event data on sale**: `propertySold` emitted `property.owner`
  *after* it had already been reassigned to the buyer, so `oldOwner` in
  the event was actually the new owner.
- **No success check on payment**: the original `buyProperty` didn't
  verify the ETH transfer to the seller succeeded before transferring
  ownership — a failed transfer could still hand over the property for free.
- **Infinite-loop-prone rating scan**: `getHighestRatedProduct` post-incremented
  the loop variable twice per iteration (`uint256 productId = i++` inside a
  `for` loop that also runs `i++`), skipping every other property and never
  scanning the full set.

---

## Frontend features

- Connect wallet via MetaMask on Sepolia
- List a property with title, category, image URL, address, description, price
- Browse all properties or filter to "My properties"
- Property detail modal with buy flow, price updates (owner-only), and reviews
- Star-rating review form with like/upvote on individual reviews
- Clear **"You own this"** and **"SOLD"** confirmation states
- Light/dark theme toggle with persisted preference
- Activity history with timestamps and Etherscan links
- Live transaction confirmation banners

---

## Tech stack

- **Smart contract** — Solidity 0.8.20
- **Framework** — Hardhat 2.22
- **Frontend** — React 18 + Vite + Ethers.js v6
- **Testing** — Hardhat + Chai + Ethers.js
- **Deployment** — Alchemy RPC + Hardhat
- **Verification** — Etherscan API

---

## Test coverage — 32 passing
RealEstate

Listing properties           4 passing

Updating properties          5 passing

Buying properties            7 passing

Reading properties           3 passing

Reviews                     10 passing

getHighestRatedProduct       3 passing
32 passing

Covers listing validation, owner-only update/price authorization, the full
buy flow (including rejecting self-purchase and underpayment), resale to
a third buyer, review rating bounds, review-liking, and correct average-rating
computation across multiple properties and multiple reviewers.

---

## Project structure
jose-realestatecontracts/

├── contracts/

│   └── RealEstate.sol

├── scripts/

│   └── deploy.js

├── test/

│   └── RealEstate.test.js   # 32 unit tests

├── frontend/

│   └── src/

│       ├── App.jsx

│       ├── theme.js

│       ├── hooks/

│       │   ├── useRealEstate.js

│       │   └── useTheme.js

│       └── components/

│           ├── PropertyCard.jsx

│           ├── PropertyModal.jsx

│           ├── ListPropertyForm.jsx

│           ├── ThemeToggle.jsx

│           └── TransactionHistory.jsx

├── hardhat.config.js

└── README.md

---

## Run locally

### Prerequisites

- Node.js 22+
- MetaMask browser extension
- Alchemy account (Sepolia RPC)

### Setup

```bash
git clone https://github.com/mugwimi/jose-realestate.git
cd jose-realestatecontracts
npm install
```

### Create .env

```bash
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
```

### Run tests

```bash
npx hardhat test
```

### Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Verify on Etherscan

```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

### Run frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`, connect MetaMask on Sepolia, list a property, and try buying it from a second account.

---

## Smart contract architecture
RealEstate

├── listProperty()           -- create a new listing

├── updateProperty()          -- owner-only metadata edit

├── updatePrice()              -- owner-only price change

├── buyProperty()               -- atomic ETH payment + ownership transfer

├── getAllProperties()           -- full listing feed

├── getUserProperties()           -- per-address portfolio

├── addReview() / likeReview()     -- on-chain reputation

└── getHighestRatedProduct()        -- on-chain leaderboard query

---

## Known simplifications (by design, for portfolio scope)

- No escrow — payment and ownership transfer happen atomically in one
  transaction, which is simple but means no dispute window or inspection period
- Anyone can pass any `owner`/`buyer`/`user` address as a parameter rather
  than the contract strictly deriving identity from `msg.sender` for every
  role — a production version would tighten this further
- Images are stored as a URL string rather than IPFS/Arweave content hashes

---

## Author

**Jose** — Blockchain developer
Building on Ethereum · Targeting Coinbase, Ripple, Binance.US
William Jessup University · San Jose, CA · August 2026

---

## License

MIT