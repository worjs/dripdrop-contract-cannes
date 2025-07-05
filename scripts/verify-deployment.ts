import { ethers } from "hardhat";

async function main() {
  console.log("🔍 배포된 컨트랙트 확인 시작...\n");

  // 배포된 컨트랙트 주소들
  const mockPaymentTokenAddress = "0x0e1E1787d384992064958B49f8D20f305D12D7a1";
  const dripDropCafeAddress = "0x2fc1c9B3a3B089Cd4f5FB9E2Ca008Af8FF8C8C31";
  const ingredientTokenAddress = "0x620545FDad6Bc3091A8f5ee32824d25DC31BC9fa";
  const coffeeNFTAddress = "0x6570D3EB9CC5740dcE8918C69Ffe7E6C69501206";

  // 컨트랙트 인스턴스 생성
  const MockPaymentToken = await ethers.getContractFactory("MockPaymentToken");
  const mockPaymentToken = MockPaymentToken.attach(mockPaymentTokenAddress);

  const DripDropCafe = await ethers.getContractFactory("DripDropCafe");
  const dripDropCafe = DripDropCafe.attach(dripDropCafeAddress);

  const IngredientToken = await ethers.getContractFactory("IngredientToken");
  const ingredientToken = IngredientToken.attach(ingredientTokenAddress);

  const CoffeeNFT = await ethers.getContractFactory("CoffeeNFT");
  const coffeeNFT = CoffeeNFT.attach(coffeeNFTAddress);

  console.log("📊 MockPaymentToken (USDC) 확인:");
  console.log("- 이름:", await mockPaymentToken.name());
  console.log("- 심볼:", await mockPaymentToken.symbol());
  console.log("- 데시말:", await mockPaymentToken.decimals());
  const totalSupply = await mockPaymentToken.totalSupply();
  console.log("- 총 공급량:", Number(totalSupply) / 10 ** 6, "USDC");

  console.log("\n🧪 IngredientToken 재료 확인:");
  const validIngredients = await dripDropCafe.getValidIngredients();
  console.log(
    "- 등록된 재료 ID들:",
    validIngredients.map((id) => Number(id))
  );

  for (const id of validIngredients) {
    const name = await dripDropCafe.getIngredientName(Number(id));
    console.log(`  ID ${Number(id)}: ${name}`);
  }

  console.log("\n☕ CoffeeNFT 확인:");
  console.log("- 이름:", await coffeeNFT.name());
  console.log("- 심볼:", await coffeeNFT.symbol());
  console.log("- 오너:", await coffeeNFT.owner());

  console.log("\n💰 메뉴 가격 확인:");
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
    try {
      const price = await dripDropCafe.getMenuPrice(i);
      console.log(
        `- ${menuNames[i]} (ID: ${i}): ${Number(price) / 10 ** 6} USDC`
      );
    } catch (error) {
      console.log(`- ${menuNames[i]} (ID: ${i}): 가격 미설정`);
    }
  }

  console.log("\n🍺 레시피 확인:");
  const recipesToCheck = [
    { id: 0, name: "ESPRESSO" },
    { id: 2, name: "ICE_AMERICANO" },
    { id: 3, name: "HOT_LATTE" },
  ];

  for (const recipe of recipesToCheck) {
    try {
      const menuId = await dripDropCafe.findMatchingRecipe([
        0, 0, 0, 0, 0, 0, 0, 0, 0,
      ]); // ESPRESSO 패턴
      if (recipe.id === 0) {
        console.log(
          `- ${recipe.name}: 레시피 설정됨 (매칭 결과: ${Number(menuId)})`
        );
      }

      if (recipe.id === 2) {
        const iceAmericanoMatch = await dripDropCafe.findMatchingRecipe([
          0, 1, 0, 1, 0, 1, 0, 5, 0,
        ]);
        console.log(
          `- ${recipe.name}: 레시피 설정됨 (매칭 결과: ${Number(
            iceAmericanoMatch
          )})`
        );
      }

      if (recipe.id === 3) {
        const hotLatteMatch = await dripDropCafe.findMatchingRecipe([
          0, 1, 0, 0, 2, 0, 0, 3, 0,
        ]);
        console.log(
          `- ${recipe.name}: 레시피 설정됨 (매칭 결과: ${Number(
            hotLatteMatch
          )})`
        );
      }
    } catch (error) {
      console.log(`- ${recipe.name}: 레시피 미설정 또는 오류`);
    }
  }

  console.log("\n🔧 패턴 검증 함수 테스트:");

  // ESPRESSO 패턴 검증
  const espressoPattern = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const espressoValid = await dripDropCafe.validatePattern(0, espressoPattern);
  console.log("- ESPRESSO 패턴 검증:", espressoValid);

  // ICE_AMERICANO 패턴 검증
  const iceAmericanoPattern = [0, 1, 0, 1, 0, 1, 0, 5, 0];
  const iceAmericanoValid = await dripDropCafe.validatePattern(
    2,
    iceAmericanoPattern
  );
  console.log("- ICE_AMERICANO 패턴 검증:", iceAmericanoValid);

  // 잘못된 패턴 검증
  const wrongPattern = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const wrongPatternMatch = await dripDropCafe.findMatchingRecipe(wrongPattern);
  console.log(
    "- 잘못된 패턴 매칭 결과:",
    Number(wrongPatternMatch),
    "(0이면 정상)"
  );

  console.log("\n✅ 모든 확인 완료!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
