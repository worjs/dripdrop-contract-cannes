# 🍃 Drip Drop Cafe - Smart Contracts

> **Coffee NFT Cafe with 3x3 Minecraft-style Recipe System**  
> Built on Solidity 0.8.x + OpenZeppelin 5.x

## 📋 Project Overview

DripDropCafe is a blockchain-based coffee ordering and crafting system. Users can pay tokens to purchase ingredients and craft coffee NFTs by placing ingredients in a 3x3 grid according to recipes.

### 🏗️ Architecture

```
MockPaymentToken(ERC20) ─┐   (pay 0.005 MPT)
                         │
            +────────────┴─────────────+
            │      DripDropCafe        │  ← Ownable, ReentrancyGuard
            +────────────┬─────────────+
                         │
         +───────────────┼───────────────+
         │                               │
IngredientToken(ERC1155)         CoffeeNFT(ERC721)
 (ingredient tokens, burn & mint)  (coffee NFTs, burn & mint)
```

## 🎯 Key Features

### 1. Menu Ordering (`orderMenu`)

- Pay 0.005 MPT tokens to receive 1 random ingredient
- Randomly provides one ingredient from the selected menu's recipe

### 2. Coffee Crafting (`craftCoffee`)

- Place ingredients in a 3x3 grid to match recipes
- Burns ingredients and mints coffee NFT if recipe is correct
- Shapeless recipes ignore order, regular recipes require exact positioning

### 3. Coffee Redemption (`redeem`)

- Burn owned coffee NFT to redeem for actual coffee

## 📦 Smart Contracts

| Contract             | Type    | Description                                                              |
| -------------------- | ------- | ------------------------------------------------------------------------ |
| **MockPaymentToken** | ERC20   | Payment token (18 decimals)                                              |
| **IngredientToken**  | ERC1155 | Ingredient tokens (ID 0-5: coffee beans, water, milk, sugar, cream, ice) |
| **CoffeeNFT**        | ERC721  | Coffee NFTs (unique URI support per menu)                                |
| **DripDropCafe**     | Main    | Main contract (order, craft, redeem management)                          |

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
yarn install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Start local network
npx hardhat node

# Deploy (in new terminal)
npx hardhat run scripts/deploy.ts --network localhost

# Try the interactive demo
npx hardhat run scripts/interact.ts --network localhost
```

### Using NPM Scripts

```bash
# Compile contracts
yarn compile

# Run tests
yarn test

# Start local network
yarn node

# Deploy to local network (in another terminal)
yarn deploy:local

# Run interaction demo (in another terminal)
yarn interact:local

# Generate test coverage report
yarn coverage
```

### Usage Example

```javascript
// 1. Approve MPT token spending
await mockPaymentToken.approve(dripDropCafe.address, ethers.parseEther("1"));

// 2. Order menu (ICE_AMERICANO)
await dripDropCafe.orderMenu(2);

// 3. Craft coffee (3x3 grid)
const grid = [0, 1, 0, 1, 0, 1, 0, 5, 0]; // coffee beans, water, ice pattern
await dripDropCafe.craftCoffee(2, grid);

// 4. Redeem NFT
await dripDropCafe.redeem(tokenId);
```

## 🧪 Testing

```bash
npx hardhat test
```

All 17 test cases passing:

- ✅ Deployment tests
- ✅ Recipe management
- ✅ Menu ordering
- ✅ Coffee crafting
- ✅ Coffee redemption
- ✅ Payment withdrawal

## 📝 Recipe System

### Default Recipes

1. **ICE_AMERICANO** (Menu ID: 2)

   ```
   [0,1,0]  // coffee beans, water, coffee beans
   [1,0,1]  // water, empty, water
   [0,5,0]  // coffee beans, ice, coffee beans
   ```

2. **ESPRESSO** (Menu ID: 0, shapeless)

   ```
   [0,0,0]  // coffee beans + water only
   [0,1,0]  // order doesn't matter
   [0,0,0]
   ```

3. **HOT_LATTE** (Menu ID: 3, shapeless)
   ```
   [0,1,2]  // coffee beans + water + milk
   [0,0,0]  // order doesn't matter
   [0,0,0]
   ```

### Adding New Recipes

```javascript
await dripDropCafe.setRecipe(
  menuId, // Menu ID (0-6)
  pattern, // 3x3 pattern array [9 values]
  shapeless, // true: order doesn't matter, false: exact position
  "ipfs://uri/" // NFT metadata URI prefix
);
```

## 🔧 Key Constants

```solidity
uint256 public constant PRICE = 0.005 ether;  // Menu price
uint8 public constant EMPTY = 0;              // Empty slot
uint8 public constant WILDCARD = 255;         // Wildcard (unused)
```

## 🏷️ Events

```solidity
event MenuOrdered(address indexed user, Menu indexed menu, uint8 ingredientId);
event Crafted(address indexed user, Menu indexed menu, uint256 coffeeId);
event Redeemed(address indexed user, uint256 coffeeId);
event RecipeSet(Menu indexed menu, bool shapeless);
```

## 🛡️ Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Owner access control
- **Input Validation**: All functions validate inputs
- **Gas Optimization**: bytes32 hash comparison, uint8 usage

## 📊 Gas Usage

| Function      | Average Gas | Description                        |
| ------------- | ----------- | ---------------------------------- |
| `orderMenu`   | ~100,551    | Token payment + ingredient minting |
| `craftCoffee` | ~246,797    | Ingredient burning + NFT minting   |
| `redeem`      | ~39,437     | NFT burning                        |
| `setRecipe`   | ~145,756    | Recipe registration                |

## 🎨 Menu Types

```solidity
enum Menu {
    ESPRESSO,        // 0
    HOT_AMERICANO,   // 1
    ICE_AMERICANO,   // 2
    HOT_LATTE,       // 3
    ICE_LATTE,       // 4
    HOT_CAPPU,       // 5
    ICE_CAPPU        // 6
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Made with ☕ by DripDrop Team**

# DripDropCafe Smart Contract System

A decentralized coffee ordering system built on World Chain Sepolia Testnet, featuring dynamic ingredient management, recipe crafting, and NFT-based coffee tokens.

## 🌐 Network Information

- **Network**: World Chain Sepolia Testnet
- **Chain ID**: 4801
- **RPC URL**: `https://worldchain-sepolia.g.alchemy.com/public`
- **Currency**: ETH

## 📋 Contract Addresses

| Contract                    | Address                                      | Description                                |
| --------------------------- | -------------------------------------------- | ------------------------------------------ |
| **DripDropCafe**            | `0x2fc1c9B3a3B089Cd4f5FB9E2Ca008Af8FF8C8C31` | Main contract - handles all business logic |
| **MockPaymentToken (USDC)** | `0x0e1E1787d384992064958B49f8D20f305D12D7a1` | Payment token with 6 decimals              |
| **IngredientToken**         | `0x620545FDad6Bc3091A8f5ee32824d25DC31BC9fa` | ERC1155 ingredients                        |
| **CoffeeNFT**               | `0x6570D3EB9CC5740dcE8918C69Ffe7E6C69501206` | ERC721 coffee NFTs                         |

## 🏗️ Architecture Overview

### Centralized Design Pattern

The system uses a **centralized design** where `DripDropCafe` acts as the main entry point for most operations:

- ✅ **Business Logic**: All core functions go through `DripDropCafe`
- ✅ **Access Control**: `DripDropCafe` owns and controls child contracts
- ✅ **Single Integration Point**: Frontend primarily interacts with one contract

### When to Call Each Contract Directly

| Contract             | Direct Calls Required | Purpose                                        |
| -------------------- | --------------------- | ---------------------------------------------- |
| **DripDropCafe**     | ✅ Most operations    | Order menu, craft coffee, redeem NFT, get data |
| **MockPaymentToken** | ✅ ERC20 operations   | Check balance, approve spending, transfer      |
| **IngredientToken**  | ✅ ERC1155 operations | Check ingredient balances, set approvals       |
| **CoffeeNFT**        | ✅ ERC721 operations  | Check NFT ownership, metadata, approvals       |

## 🔧 Frontend Integration Guide

### Required ABIs

You need **ALL 4 contract ABIs** for full functionality:

```javascript
// Required ABI files (located in frontend-config/)
-DripDropCafe.json - // Main business logic
  MockPaymentToken.json - // USDC operations
  IngredientToken.json - // Ingredient balance checks
  CoffeeNFT.json; // NFT operations
```

### Contract Initialization Example

```javascript
import { ethers } from "ethers";

// Contract ABIs (import from frontend-config/)
import DripDropCafeABI from "./DripDropCafe.json";
import MockPaymentTokenABI from "./MockPaymentToken.json";
import IngredientTokenABI from "./IngredientToken.json";
import CoffeeNFTABI from "./CoffeeNFT.json";

// Contract addresses
const CONTRACTS = {
  DripDropCafe: "0x2fc1c9B3a3B089Cd4f5FB9E2Ca008Af8FF8C8C31",
  MockPaymentToken: "0x0e1E1787d384992064958B49f8D20f305D12D7a1",
  IngredientToken: "0x620545FDad6Bc3091A8f5ee32824d25DC31BC9fa",
  CoffeeNFT: "0x6570D3EB9CC5740dcE8918C69Ffe7E6C69501206",
};

// Initialize contracts
const provider = new ethers.providers.JsonRpcProvider(
  "https://worldchain-sepolia.g.alchemy.com/public"
);
const signer = provider.getSigner();

const dripDropCafe = new ethers.Contract(
  CONTRACTS.DripDropCafe,
  DripDropCafeABI.abi,
  signer
);
const usdc = new ethers.Contract(
  CONTRACTS.MockPaymentToken,
  MockPaymentTokenABI.abi,
  signer
);
const ingredientToken = new ethers.Contract(
  CONTRACTS.IngredientToken,
  IngredientTokenABI.abi,
  signer
);
const coffeeNFT = new ethers.Contract(
  CONTRACTS.CoffeeNFT,
  CoffeeNFTABI.abi,
  signer
);
```

## 🎮 User Workflows

### 1. Order Menu Item

```javascript
async function orderMenu(menuId) {
  // 1. Check USDC balance
  const balance = await usdc.balanceOf(userAddress);
  console.log(`USDC Balance: ${balance / 10 ** 6} USDC`);

  // 2. Get menu price
  const price = await dripDropCafe.getMenuPrice(menuId);
  console.log(`Menu Price: ${price / 10 ** 6} USDC`);

  // 3. Check allowance
  const allowance = await usdc.allowance(userAddress, CONTRACTS.DripDropCafe);

  // 4. Approve if needed
  if (allowance < price) {
    await usdc.approve(CONTRACTS.DripDropCafe, price);
  }

  // 5. Order menu
  await dripDropCafe.orderMenu(menuId);

  // 6. Check received ingredient (optional)
  const ingredients = await dripDropCafe.getValidIngredients();
  for (const ingredientId of ingredients) {
    const balance = await ingredientToken.balanceOf(userAddress, ingredientId);
    if (balance > 0) {
      const name = await dripDropCafe.getIngredientName(ingredientId);
      console.log(`Received: ${balance} ${name}`);
    }
  }
}
```

### 2. Craft Coffee

```javascript
async function craftCoffee(pattern) {
  // pattern = [0,1,0,1,0,1,0,5,0] // 3x3 grid

  // 1. Find matching recipe
  const menuId = await dripDropCafe.findMatchingRecipe(pattern);
  if (menuId === 0) {
    throw new Error("No matching recipe found");
  }

  // 2. Validate pattern (optional frontend validation)
  const isValid = await dripDropCafe.validatePattern(menuId, pattern);
  if (!isValid) {
    throw new Error("Invalid pattern");
  }

  // 3. Check if user has required ingredients
  const hasIngredients = await dripDropCafe.hasRequiredIngredients(
    userAddress,
    pattern
  );
  if (!hasIngredients) {
    throw new Error("Insufficient ingredients");
  }

  // 4. Set approval for ingredients
  const isApproved = await ingredientToken.isApprovedForAll(
    userAddress,
    CONTRACTS.DripDropCafe
  );
  if (!isApproved) {
    await ingredientToken.setApprovalForAll(CONTRACTS.DripDropCafe, true);
  }

  // 5. Craft coffee
  await dripDropCafe.craftCoffee(menuId, pattern);

  // 6. Check received NFT
  const nftBalance = await coffeeNFT.balanceOf(userAddress);
  console.log(`Coffee NFTs owned: ${nftBalance}`);
}
```

### 3. Redeem Coffee NFT

```javascript
async function redeemCoffee(tokenId) {
  // 1. Check ownership
  const owner = await coffeeNFT.ownerOf(tokenId);
  if (owner !== userAddress) {
    throw new Error("Not the owner of this NFT");
  }

  // 2. Get coffee info
  const menuId = await coffeeNFT.getTokenMenu(tokenId);
  const tokenURI = await coffeeNFT.tokenURI(tokenId);
  console.log(`Redeeming Menu ID: ${menuId}, URI: ${tokenURI}`);

  // 3. Redeem coffee
  await dripDropCafe.redeemCoffee(tokenId);
}
```

## 📊 Data Fetching Functions

### Get Available Ingredients

```javascript
async function getIngredients() {
  const ingredientIds = await dripDropCafe.getValidIngredients();
  const ingredients = [];

  for (const id of ingredientIds) {
    const name = await dripDropCafe.getIngredientName(id);
    ingredients.push({ id: id.toNumber(), name });
  }

  return ingredients;
  // Returns: [{ id: 0, name: "Coffee Bean" }, { id: 1, name: "Water" }, ...]
}
```

### Get User's Ingredient Balances

```javascript
async function getUserIngredients(userAddress) {
  const ingredientIds = await dripDropCafe.getValidIngredients();
  const balances = await ingredientToken.balanceOfBatch(
    new Array(ingredientIds.length).fill(userAddress),
    ingredientIds
  );

  const userIngredients = [];
  for (let i = 0; i < ingredientIds.length; i++) {
    if (balances[i] > 0) {
      const name = await dripDropCafe.getIngredientName(ingredientIds[i]);
      userIngredients.push({
        id: ingredientIds[i].toNumber(),
        name,
        balance: balances[i].toNumber(),
      });
    }
  }

  return userIngredients;
}
```

### Get Menu Information

```javascript
async function getMenus() {
  const menuIds = [0, 1, 2, 3, 4, 5, 6]; // Known menu IDs
  const menuNames = [
    "ESPRESSO",
    "HOT_AMERICANO",
    "ICE_AMERICANO",
    "HOT_LATTE",
    "ICE_LATTE",
    "HOT_CAPPU",
    "ICE_CAPPU",
  ];

  const menus = [];
  for (let i = 0; i < menuIds.length; i++) {
    try {
      const price = await dripDropCafe.getMenuPrice(menuIds[i]);
      menus.push({
        id: menuIds[i],
        name: menuNames[i],
        price: price.toNumber() / 10 ** 6, // Convert to USDC
      });
    } catch (error) {
      // Menu price not set
    }
  }

  return menus;
}
```

### Get Available Recipes

```javascript
async function getRecipes() {
  const menuIds = await dripDropCafe.getMenusWithRecipes();
  const recipes = [];

  for (const menuId of menuIds) {
    const pattern = await dripDropCafe.getRecipePattern(menuId);
    recipes.push({
      menuId: menuId.toNumber(),
      pattern: pattern.map((p) => p.toNumber()),
    });
  }

  return recipes;
}
```

## 🎯 Key Features for Frontend

### 1. Real-time Pattern Validation

```javascript
// Validate pattern before submitting transaction
const isValid = await dripDropCafe.validatePattern(menuId, pattern);
```

### 2. Ingredient Sufficiency Check

```javascript
// Check if user has enough ingredients before crafting
const canCraft = await dripDropCafe.hasRequiredIngredients(
  userAddress,
  pattern
);
```

### 3. Automatic Recipe Matching

```javascript
// Find which menu matches the pattern
const menuId = await dripDropCafe.findMatchingRecipe(pattern);
```

## 💰 Token Information

### USDC (MockPaymentToken)

- **Decimals**: 6
- **Symbol**: USDC
- **Name**: USD Coin
- **Usage**: Payment for menu items

### Ingredient Tokens (ERC1155)

- **Standard**: ERC1155
- **IDs**: 0-5 (Coffee Bean, Water, Milk, Sugar, Cream, Ice)
- **Usage**: Crafting materials

### Coffee NFTs (ERC721)

- **Standard**: ERC721
- **Symbol**: COFFEE
- **Name**: CoffeeNFT
- **Usage**: Proof of crafted coffee

## 🔒 Security Considerations

1. **Always check balances** before transactions
2. **Validate patterns** before crafting to avoid gas waste
3. **Set appropriate approvals** for token spending
4. **Handle transaction failures** gracefully
5. **Verify ownership** before redeeming NFTs

## 📱 Frontend Development Tips

### Error Handling

```javascript
try {
  await dripDropCafe.orderMenu(menuId);
} catch (error) {
  if (error.message.includes("MenuPriceNotSet")) {
    alert("Menu price not set");
  } else if (error.message.includes("PaymentFailed")) {
    alert("Insufficient USDC balance or approval");
  }
}
```

### Gas Optimization

- Use `validatePattern()` and `hasRequiredIngredients()` before actual transactions
- Batch operations when possible
- Set approvals once and reuse

### User Experience

- Show real-time balance updates
- Provide clear error messages
- Display transaction status
- Cache frequently accessed data

## 🧪 Testing

Run the test suite:

```bash
npx hardhat test
```

Deploy to testnet:

```bash
npx hardhat run scripts/deploy.ts --network worldchain-sepolia
```

Verify deployment:

```bash
npx hardhat run scripts/verify-deployment.ts --network worldchain-sepolia
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

**Happy Brewing! ☕**
