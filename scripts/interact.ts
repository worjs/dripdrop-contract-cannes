import { ethers } from "hardhat";

async function main() {
  // Contract addresses from deployment
  const MOCK_PAYMENT_TOKEN_ADDRESS =
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const DRIP_DROP_CAFE_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const [deployer, user] = await ethers.getSigners();

  console.log("🍃 DripDropCafe Interaction Demo");
  console.log("================================");
  console.log("Deployer:", deployer.address);
  console.log("User:", user.address);

  // Get contract instances
  const mockPaymentToken = await ethers.getContractAt(
    "MockPaymentToken",
    MOCK_PAYMENT_TOKEN_ADDRESS
  );
  const dripDropCafe = await ethers.getContractAt(
    "DripDropCafe",
    DRIP_DROP_CAFE_ADDRESS
  );
  const ingredientToken = await ethers.getContractAt(
    "IngredientToken",
    await dripDropCafe.ingredient()
  );
  const coffeeNFT = await ethers.getContractAt(
    "CoffeeNFT",
    await dripDropCafe.coffeeNFT()
  );

  // Menu IDs
  const ICE_AMERICANO = 2;

  // Display menu prices
  console.log("\n💰 Menu Prices:");
  const menuNames = [
    "ESPRESSO",
    "HOT_AMERICANO",
    "ICE_AMERICANO",
    "HOT_LATTE",
    "ICE_LATTE",
    "HOT_CAPPU",
    "ICE_CAPPU",
  ];

  for (let i = 0; i < menuNames.length; i++) {
    const price = await dripDropCafe.getMenuPrice(i);
    console.log(`${menuNames[i]} (ID: ${i}): ${ethers.formatEther(price)} MPT`);
  }

  // 1. Setup user with MPT tokens
  console.log("\n1. Setting up user with MPT tokens...");
  const userBalance = await mockPaymentToken.balanceOf(user.address);
  console.log(`User current balance: ${ethers.formatEther(userBalance)} MPT`);

  if (userBalance < ethers.parseEther("0.1")) {
    console.log("Minting 0.1 MPT to user...");
    await mockPaymentToken.mint(user.address, ethers.parseEther("0.1"));
    console.log("✅ Minted 0.1 MPT to user");
  }

  // 2. User approves DripDropCafe to spend MPT
  console.log("\n2. Approving DripDropCafe to spend MPT...");
  await mockPaymentToken
    .connect(user)
    .approve(DRIP_DROP_CAFE_ADDRESS, ethers.parseEther("0.1"));
  console.log("✅ Approved DripDropCafe to spend 0.1 MPT");

  // 3. Get ICE_AMERICANO recipe pattern
  console.log("\n3. Getting ICE_AMERICANO recipe pattern...");
  const recipePattern = await dripDropCafe.getRecipePattern(ICE_AMERICANO);
  const patternArray = [...recipePattern]; // Convert to regular array
  console.log("ICE_AMERICANO recipe pattern:", patternArray.toString());

  // 4. Order ICE_AMERICANO multiple times to collect ingredients
  console.log("\n4. Ordering ICE_AMERICANO to collect ingredients...");
  const orderCount = 20;

  for (let i = 0; i < orderCount; i++) {
    await dripDropCafe.connect(user).orderMenu(ICE_AMERICANO);
  }

  console.log("✅ Ordered 20 ICE_AMERICANO items");
  console.log("Ingredients collected:");

  // Get all valid ingredient IDs and their names
  const validIngredients = await dripDropCafe.getValidIngredients();
  for (const ingredientId of validIngredients) {
    const balance = await ingredientToken.balanceOf(user.address, ingredientId);
    const name = await dripDropCafe.getIngredientName(ingredientId);
    console.log(`  ${name} (ID: ${ingredientId}): ${balance.toString()}`);
  }

  // 5. Check if we have enough ingredients for the recipe
  console.log("\n5. Checking ingredients for ICE_AMERICANO recipe...");
  const neededIngredients = new Map<number, number>();

  for (let i = 0; i < 9; i++) {
    const ingredientId = Number(patternArray[i]);
    if (ingredientId !== 0) {
      // 0 is EMPTY
      neededIngredients.set(
        ingredientId,
        (neededIngredients.get(ingredientId) || 0) + 1
      );
    }
  }

  console.log("Required ingredients:");
  let canCraft = true;
  for (const [ingredientId, needed] of neededIngredients) {
    const balance = await ingredientToken.balanceOf(user.address, ingredientId);
    const name = await dripDropCafe.getIngredientName(ingredientId);
    console.log(
      `  ${name} (ID: ${ingredientId}): need ${needed}, have ${balance.toString()}`
    );
    if (balance < needed) {
      canCraft = false;
    }
  }

  if (!canCraft) {
    console.log("❌ Not enough ingredients to craft ICE_AMERICANO");
    return;
  }

  // 6. Craft ICE_AMERICANO using exact pattern
  console.log("\n6. Crafting ICE_AMERICANO...");
  const craftTx = await dripDropCafe
    .connect(user)
    .craftCoffee(ICE_AMERICANO, patternArray);
  const craftReceipt = await craftTx.wait();
  console.log("✅ Crafted ICE_AMERICANO");

  // Get tokenId from event
  const craftEvent = craftReceipt?.logs.find((log) => {
    try {
      const parsed = dripDropCafe.interface.parseLog(log);
      return parsed?.name === "Crafted";
    } catch {
      return false;
    }
  });

  let tokenId = 0;
  if (craftEvent) {
    const parsed = dripDropCafe.interface.parseLog(craftEvent);
    tokenId = parsed?.args.tokenId;
    console.log(`Coffee NFT minted with ID: ${tokenId}`);
  }

  // 7. Check NFT ownership
  console.log("\n7. Checking NFT ownership...");
  const coffeeOwner = await coffeeNFT.ownerOf(tokenId);
  console.log(`Coffee NFT owner: ${coffeeOwner}`);
  console.log(`User address: ${user.address}`);
  console.log(`Ownership correct: ${coffeeOwner === user.address}`);

  // 8. Redeem coffee NFT
  console.log("\n8. Redeeming coffee NFT...");
  await coffeeNFT.connect(user).approve(DRIP_DROP_CAFE_ADDRESS, tokenId);
  await dripDropCafe.connect(user).redeemCoffee(tokenId);
  console.log("✅ Redeemed coffee NFT");

  // 9. Final balances
  console.log("\n9. Final balances:");
  const finalMPTBalance = await mockPaymentToken.balanceOf(user.address);
  const cafeBalance = await mockPaymentToken.balanceOf(DRIP_DROP_CAFE_ADDRESS);

  console.log(`User MPT balance: ${ethers.formatEther(finalMPTBalance)} MPT`);
  console.log(`Cafe MPT balance: ${ethers.formatEther(cafeBalance)} MPT`);

  console.log("\n🎉 Demo completed successfully!");
  console.log(
    "Total spent:",
    ethers.formatEther(ethers.parseEther("0.1") - finalMPTBalance),
    "MPT"
  );
  console.log("Cafe revenue:", ethers.formatEther(cafeBalance), "MPT");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
