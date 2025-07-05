import { ethers } from "hardhat";

async function main() {
  console.log("🚀 DripDropCafe 배포 시작...");

  // 1. MockPaymentToken 배포
  console.log("\n1. MockPaymentToken 배포 중...");
  const MockPaymentToken = await ethers.getContractFactory("MockPaymentToken");
  const mockPaymentToken = await MockPaymentToken.deploy();
  await mockPaymentToken.waitForDeployment();

  const mockPaymentTokenAddress = await mockPaymentToken.getAddress();
  console.log(`MockPaymentToken 배포 완료: ${mockPaymentTokenAddress}`);

  // 2. DripDropCafe 배포 (IngredientToken과 CoffeeNFT는 자동 생성)
  console.log("\n2. DripDropCafe 배포 중...");
  const DripDropCafe = await ethers.getContractFactory("DripDropCafe");
  const dripDropCafe = await DripDropCafe.deploy(mockPaymentTokenAddress);
  await dripDropCafe.waitForDeployment();

  const dripDropCafeAddress = await dripDropCafe.getAddress();
  console.log(`DripDropCafe 배포 완료: ${dripDropCafeAddress}`);

  // 3. 자식 컨트랙트 주소 가져오기
  const ingredientTokenAddress = await dripDropCafe.ingredient();
  const coffeeNFTAddress = await dripDropCafe.coffeeNFT();

  console.log(`IngredientToken 주소: ${ingredientTokenAddress}`);
  console.log(`CoffeeNFT 주소: ${coffeeNFTAddress}`);

  // 4. 재료 등록
  console.log("\n3. 재료 등록 중...");

  const ingredients = [
    { id: 0, name: "Coffee Bean" },
    { id: 1, name: "Water" },
    { id: 2, name: "Milk" },
    { id: 3, name: "Sugar" },
    { id: 4, name: "Cream" },
    { id: 5, name: "Ice" },
  ];

  for (const ingredient of ingredients) {
    await dripDropCafe.registerIngredient(ingredient.id, ingredient.name);
    console.log(`재료 등록: ${ingredient.name} (ID: ${ingredient.id})`);
  }

  // 5. 메뉴 가격 설정
  console.log("\n4. 메뉴 가격 설정 중...");
  const menuPrices = [
    { id: 0, name: "ESPRESSO", price: 3 * 10 ** 6 }, // 3 USDC
    { id: 1, name: "HOT_AMERICANO", price: 4 * 10 ** 6 }, // 4 USDC
    { id: 2, name: "ICE_AMERICANO", price: 5 * 10 ** 6 }, // 5 USDC
    { id: 3, name: "HOT_LATTE", price: 6 * 10 ** 6 }, // 6 USDC
    { id: 4, name: "ICE_LATTE", price: 7 * 10 ** 6 }, // 7 USDC
    { id: 5, name: "HOT_CAPPU", price: 8 * 10 ** 6 }, // 8 USDC
    { id: 6, name: "ICE_CAPPU", price: 9 * 10 ** 6 }, // 9 USDC
  ];

  for (const menu of menuPrices) {
    await dripDropCafe.setMenuPrice(menu.id, menu.price);
    console.log(`${menu.name} (ID: ${menu.id}): ${menu.price / 10 ** 6} USDC`);
  }

  // 6. 기본 레시피 설정
  console.log("\n5. 레시피 설정 중...");

  // ICE_AMERICANO 레시피: [0,1,0,1,0,1,0,5,0] (정확한 패턴)
  const iceAmericanoPattern = [0, 1, 0, 1, 0, 1, 0, 5, 0];
  await dripDropCafe.setRecipe(
    2, // ICE_AMERICANO
    iceAmericanoPattern,
    "ipfs://ice_americano/"
  );
  console.log("ICE_AMERICANO 레시피 설정: [0,1,0,1,0,1,0,5,0]");

  // ESPRESSO 레시피: [0,0,0,0,0,0,0,0,0] (커피원두만)
  const espressoPattern = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  await dripDropCafe.setRecipe(
    0, // ESPRESSO
    espressoPattern,
    "ipfs://espresso/"
  );
  console.log("ESPRESSO 레시피 설정: [0,0,0,0,0,0,0,0,0]");

  // HOT_LATTE 레시피: [0,1,0,0,2,0,0,3,0] (정확한 패턴)
  const hotLattePattern = [0, 1, 0, 0, 2, 0, 0, 3, 0];
  await dripDropCafe.setRecipe(
    3, // HOT_LATTE
    hotLattePattern,
    "ipfs://hot_latte/"
  );
  console.log("HOT_LATTE 레시피 설정: [0,1,0,0,2,0,0,3,0]");

  console.log("\n✅ 배포 완료!");
  console.log("\n📋 요약:");
  console.log("MockPaymentToken:", mockPaymentTokenAddress);
  console.log("DripDropCafe:", dripDropCafeAddress);
  console.log("IngredientToken:", ingredientTokenAddress);
  console.log("CoffeeNFT:", coffeeNFTAddress);

  console.log("\n🧪 등록된 재료:");
  for (const ingredient of ingredients) {
    console.log(`${ingredient.name} (ID: ${ingredient.id})`);
  }

  console.log("\n💰 메뉴 가격:");
  for (const menu of menuPrices) {
    const price = await dripDropCafe.getMenuPrice(menu.id);
    console.log(
      `${menu.name} (ID: ${menu.id}): ${Number(price) / 10 ** 6} USDC`
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
