import { ethers } from "hardhat";

async function main() {
  console.log("🎁 개발자용 데모 토큰 지급 시작...\n");

  // 배포된 컨트랙트 주소들
  const MOCK_PAYMENT_TOKEN_ADDRESS =
    "0x0303aA26DD3e3eA186af61BCbd0760005bDCbF93";
  const DRIPDROP_CAFE_ADDRESS = "0x3AD2A1cad99819C1d873c735E9386fDd9ff85D2B";
  const INGREDIENT_TOKEN_ADDRESS = "0x09b1621A8534cFf7a4cED78Ce2D15BF758720F00";

  // 컨트랙트 인스턴스 생성
  const mockPaymentToken = await ethers.getContractAt(
    "MockPaymentToken",
    MOCK_PAYMENT_TOKEN_ADDRESS
  );
  const dripDropCafe = await ethers.getContractAt(
    "DripDropCafe",
    DRIPDROP_CAFE_ADDRESS
  );
  const ingredientToken = await ethers.getContractAt(
    "IngredientToken",
    INGREDIENT_TOKEN_ADDRESS
  );

  const [deployer] = await ethers.getSigners();
  console.log(`지급 대상: ${deployer.address}`);

  // 1. USDC 토큰 확인
  console.log("\n💰 USDC 토큰 확인...");
  const currentBalance = await mockPaymentToken.balanceOf(deployer.address);
  console.log(`현재 USDC 잔액: ${ethers.formatUnits(currentBalance, 6)} USDC`);

  // 2. 재료별 목표량 설정 (레시피 분석 기반)
  const targetAmounts = [
    // 자주 사용되는 재료 (많이 지급)
    { id: 1, name: "Coffee Bean", amount: 200 }, // 거의 모든 커피에 사용
    { id: 2, name: "Water", amount: 150 }, // 아메리카노, 딸기주스 등
    { id: 3, name: "Milk", amount: 180 }, // 대부분의 라떼류
    { id: 5, name: "Ice", amount: 120 }, // 아이스 음료들

    // 보통 사용되는 재료 (적당히 지급)
    { id: 4, name: "Sugar", amount: 80 }, // 일부 음료
    { id: 8, name: "Vanilla Syrup", amount: 60 }, // 바닐라 관련
    { id: 7, name: "Chocolate", amount: 70 }, // 초콜릿/모카 관련
    { id: 11, name: "Whipped Cream", amount: 50 }, // 카푸치노 등
    { id: 12, name: "Ice Cream", amount: 40 }, // 아포가토, 밀크쉐이크 등

    // 특이한 재료 (적게 지급)
    { id: 6, name: "Caramel", amount: 30 }, // 카라멜 관련만
    { id: 9, name: "Strawberry", amount: 25 }, // 딸기 관련만
    { id: 10, name: "Mint Leaves", amount: 20 }, // 민트 관련만
  ];

  console.log("\n🧪 재료 토큰 직접 민팅 중...");

  // 배치 민팅을 위한 배열 준비
  const ingredientIds = targetAmounts.map((item) => item.id);
  const amounts = targetAmounts.map((item) => item.amount);

  try {
    // 한 번에 모든 재료 민팅
    await dripDropCafe.mintIngredientsForDev(
      deployer.address,
      ingredientIds,
      amounts
    );
    console.log("✅ 모든 재료 민팅 완료!");

    // 개별 재료 확인
    console.log("\n📊 지급된 재료 확인:");
    let totalIngredients = 0;
    for (const ingredient of targetAmounts) {
      const balance = await ingredientToken.balanceOf(
        deployer.address,
        ingredient.id
      );
      console.log(`${ingredient.name}: ${balance}개`);
      totalIngredients += Number(balance);
    }

    console.log(`\n📈 총 재료 수: ${totalIngredients}개`);
  } catch (error: any) {
    console.log("❌ 재료 민팅 실패:", error.message);
    console.log("대신 개별 민팅을 시도합니다...");

    // 개별 민팅 시도
    let successCount = 0;
    for (const ingredient of targetAmounts) {
      try {
        await dripDropCafe.mintIngredientForDev(
          deployer.address,
          ingredient.id,
          ingredient.amount
        );
        console.log(`✅ ${ingredient.name}: ${ingredient.amount}개 민팅 완료`);
        successCount++;
      } catch (error: any) {
        console.log(`❌ ${ingredient.name} 민팅 실패:`, error.message);
      }
    }

    console.log(
      `\n📊 성공한 재료 민팅: ${successCount}/${targetAmounts.length}`
    );
  }

  // 3. 최종 잔액 확인
  console.log("\n📊 최종 잔액 확인:");

  // USDC 잔액
  const finalUsdcBalance = await mockPaymentToken.balanceOf(deployer.address);
  console.log(`💰 USDC 잔액: ${ethers.formatUnits(finalUsdcBalance, 6)} USDC`);

  // 재료 잔액
  console.log("\n🧪 재료 잔액:");
  let totalIngredients = 0;
  for (const ingredient of targetAmounts) {
    const balance = await ingredientToken.balanceOf(
      deployer.address,
      ingredient.id
    );
    console.log(`${ingredient.name}: ${balance}개`);
    totalIngredients += Number(balance);
  }

  console.log(`\n📈 총 재료 수: ${totalIngredients}개`);

  // 4. 테스트 가능한 레시피 안내
  console.log("\n🍽️ 테스트 가능한 레시피 예시:");
  console.log("1. ESPRESSO (3 USDC) - 패턴: [1,1,1,1,2,1,1,1,1]");
  console.log("2. CAPPUCCINO (4 USDC) - 패턴: [11,11,11,1,1,1,3,3,3]");
  console.log(
    "3. CARAMEL_MACCHIATO_FRAPPE (6 USDC) - 패턴: [1,3,1,3,5,3,6,8,6]"
  );
  console.log("4. AFFOGATO (7 USDC) - 패턴: [12,12,12,1,1,1,12,12,12]");
  console.log(
    "5. MINT_CHOCOLATE_ICECREAM (9 USDC) - 패턴: [12,7,12,12,10,12,12,12,12]"
  );
  console.log("6. STRAWBERRY_JUICE (5 USDC) - 패턴: [2,4,2,4,5,4,2,9,2]");
  console.log("7. ICED_CAFE_LATTE (8 USDC) - 패턴: [1,3,1,5,5,5,3,3,3]");

  // 5. 사용 가이드
  console.log("\n📋 사용 가이드:");
  console.log(
    "1. 재료 승인: ingredientToken.setApprovalForAll(dripDropCafeAddress, true)"
  );
  console.log("2. 커피 제작: dripDropCafe.craftCoffee(menuId, pattern)");
  console.log("3. 커피 리딤: dripDropCafe.redeemCoffee(tokenId)");
  console.log(
    "4. NFT 개수 확인: dripDropCafe.getUserMenuNFTCount(userAddress, menuId)"
  );
  console.log(
    "5. NFT 목록 확인: dripDropCafe.getUserMenuNFTs(userAddress, menuId)"
  );

  console.log("\n✅ 데모 토큰 지급 완료!");
  console.log("🎮 이제 DripDropCafe 게임을 테스트할 수 있습니다!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  });
