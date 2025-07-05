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
