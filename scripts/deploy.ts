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
    { id: 1, name: "Coffee Bean" },
    { id: 2, name: "Water" },
    { id: 3, name: "Milk" },
    { id: 4, name: "Sugar" },
    { id: 5, name: "Ice" },
    { id: 6, name: "Caramel" },
    { id: 7, name: "Chocolate" },
    { id: 8, name: "Vanilla Syrup" },
    { id: 9, name: "Strawberry" },
    { id: 10, name: "Mint Leaves" },
    { id: 11, name: "Whipped Cream" },
    { id: 12, name: "Ice Cream" },
  ];

  for (const ingredient of ingredients) {
    await dripDropCafe.registerIngredient(ingredient.id, ingredient.name);
    console.log(`재료 등록: ${ingredient.name} (ID: ${ingredient.id})`);
  }

  // 5. 메뉴 가격 설정 (7개 메뉴만)
  console.log("\n4. 메뉴 가격 설정 중...");
  const menuPrices = [
    { id: 1, name: "ESPRESSO", price: 3 * 10 ** 6 }, // Recipe #1
    { id: 2, name: "CAPPUCCINO", price: 4 * 10 ** 6 }, // Recipe #2
    { id: 4, name: "CARAMEL_MACCHIATO_FRAPPE", price: 6 * 10 ** 6 }, // Recipe #4
    { id: 7, name: "AFFOGATO", price: 7 * 10 ** 6 }, // Recipe #7
    { id: 9, name: "MINT_CHOCOLATE_ICECREAM", price: 9 * 10 ** 6 }, // Recipe #9
    { id: 10, name: "STRAWBERRY_JUICE", price: 5 * 10 ** 6 }, // Recipe #10
    { id: 15, name: "ICED_CAFE_LATTE", price: 8 * 10 ** 6 }, // Recipe #15
  ];

  for (const menu of menuPrices) {
    await dripDropCafe.setMenuPrice(menu.id, menu.price);
    console.log(`${menu.name} (ID: ${menu.id}): ${menu.price / 10 ** 6} USDC`);
  }

  // 6. 레시피 설정 (7개 레시피만)
  console.log("\n5. 레시피 설정 중...");

  // Recipe #1: ESPRESSO - 에스프레소: 커커커/커물커/커커커
  const espressoPattern = [1, 1, 1, 1, 2, 1, 1, 1, 1];
  await dripDropCafe.setRecipe(1, espressoPattern, "ipfs://espresso/");
  console.log("ESPRESSO 레시피 설정: [1,1,1,1,2,1,1,1,1]");

  // Recipe #2: CAPPUCCINO - 카푸치노: 휘휘휘/커커커/우우우
  const cappuccinoPattern = [11, 11, 11, 1, 1, 1, 3, 3, 3];
  await dripDropCafe.setRecipe(2, cappuccinoPattern, "ipfs://cappuccino/");
  console.log("CAPPUCCINO 레시피 설정: [11,11,11,1,1,1,3,3,3]");

  // Recipe #4: CARAMEL_MACCHIATO_FRAPPE - 카라멜 마키아토 프라페: 커우커/우얼우/카바카
  const caramelMacchiatoPattern = [1, 3, 1, 3, 5, 3, 6, 8, 6];
  await dripDropCafe.setRecipe(
    4,
    caramelMacchiatoPattern,
    "ipfs://caramel_macchiato_frappe/"
  );
  console.log("CARAMEL_MACCHIATO_FRAPPE 레시피 설정: [1,3,1,3,5,3,6,8,6]");

  // Recipe #7: AFFOGATO - 아포가토: 아아아/커커커/아아아
  const affogatoPattern = [12, 12, 12, 1, 1, 1, 12, 12, 12];
  await dripDropCafe.setRecipe(7, affogatoPattern, "ipfs://affogato/");
  console.log("AFFOGATO 레시피 설정: [12,12,12,1,1,1,12,12,12]");

  // Recipe #9: MINT_CHOCOLATE_ICECREAM - 민트초코 아이스크림: 아초아/아민아/아아아
  const mintChocolatePattern = [12, 7, 12, 12, 10, 12, 12, 12, 12];
  await dripDropCafe.setRecipe(
    9,
    mintChocolatePattern,
    "ipfs://mint_chocolate_icecream/"
  );
  console.log(
    "MINT_CHOCOLATE_ICECREAM 레시피 설정: [12,7,12,12,10,12,12,12,12]"
  );

  // Recipe #10: STRAWBERRY_JUICE - 딸기 주스: 물설물/설얼설/물딸물
  const strawberryJuicePattern = [2, 4, 2, 4, 5, 4, 2, 9, 2];
  await dripDropCafe.setRecipe(
    10,
    strawberryJuicePattern,
    "ipfs://strawberry_juice/"
  );
  console.log("STRAWBERRY_JUICE 레시피 설정: [2,4,2,4,5,4,2,9,2]");

  // Recipe #15: ICED_CAFE_LATTE - 아이스 카페 라떼: 커우커/얼얼얼/우우우
  const icedCafeLattePattern = [1, 3, 1, 5, 5, 5, 3, 3, 3];
  await dripDropCafe.setRecipe(
    15,
    icedCafeLattePattern,
    "ipfs://iced_cafe_latte/"
  );
  console.log("ICED_CAFE_LATTE 레시피 설정: [1,3,1,5,5,5,3,3,3]");

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

  console.log("\n🍽️ 설정된 레시피:");
  console.log("1. ESPRESSO (Recipe #1)");
  console.log("2. CAPPUCCINO (Recipe #2)");
  console.log("3. CARAMEL_MACCHIATO_FRAPPE (Recipe #4)");
  console.log("4. AFFOGATO (Recipe #7)");
  console.log("5. MINT_CHOCOLATE_ICECREAM (Recipe #9)");
  console.log("6. STRAWBERRY_JUICE (Recipe #10)");
  console.log("7. ICED_CAFE_LATTE (Recipe #15)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
