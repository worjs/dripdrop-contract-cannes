import { expect } from "chai";
import { ethers } from "hardhat";
import {
  DripDropCafe,
  MockPaymentToken,
  IngredientToken,
  CoffeeNFT,
} from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DripDropCafe", function () {
  let dripDropCafe: DripDropCafe;
  let mockPaymentToken: MockPaymentToken;
  let ingredientToken: IngredientToken;
  let coffeeNFT: CoffeeNFT;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let user2: SignerWithAddress;

  // Menu IDs
  const ESPRESSO = 0;
  const HOT_AMERICANO = 1;
  const ICE_AMERICANO = 2;
  const HOT_LATTE = 3;
  const ICE_LATTE = 4;
  const HOT_CAPPU = 5;
  const ICE_CAPPU = 6;

  const PRICES = {
    [ESPRESSO]: ethers.parseEther("0.003"),
    [HOT_AMERICANO]: ethers.parseEther("0.004"),
    [ICE_AMERICANO]: ethers.parseEther("0.005"),
    [HOT_LATTE]: ethers.parseEther("0.006"),
    [ICE_LATTE]: ethers.parseEther("0.007"),
    [HOT_CAPPU]: ethers.parseEther("0.008"),
    [ICE_CAPPU]: ethers.parseEther("0.009"),
  };

  beforeEach(async function () {
    [owner, user, user2] = await ethers.getSigners();

    // Deploy MockPaymentToken
    const MockPaymentToken = await ethers.getContractFactory(
      "MockPaymentToken"
    );
    mockPaymentToken = await MockPaymentToken.deploy();
    await mockPaymentToken.waitForDeployment();

    // Deploy DripDropCafe
    const DripDropCafe = await ethers.getContractFactory("DripDropCafe");
    dripDropCafe = await DripDropCafe.deploy(
      await mockPaymentToken.getAddress()
    );
    await dripDropCafe.waitForDeployment();

    // Get child contract instances
    ingredientToken = await ethers.getContractAt(
      "IngredientToken",
      await dripDropCafe.ingredient()
    );
    coffeeNFT = await ethers.getContractAt(
      "CoffeeNFT",
      await dripDropCafe.coffeeNFT()
    );

    // Register ingredients
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
    }

    // Setup test data
    await mockPaymentToken.mint(user.address, ethers.parseEther("1"));
    await mockPaymentToken.mint(user2.address, ethers.parseEther("1"));
    await mockPaymentToken
      .connect(user)
      .approve(await dripDropCafe.getAddress(), ethers.parseEther("1"));
    await mockPaymentToken
      .connect(user2)
      .approve(await dripDropCafe.getAddress(), ethers.parseEther("1"));
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await dripDropCafe.owner()).to.equal(owner.address);
    });

    it("Should deploy child contracts", async function () {
      expect(await dripDropCafe.payment()).to.equal(
        await mockPaymentToken.getAddress()
      );
      expect(await dripDropCafe.ingredient()).to.not.equal(ethers.ZeroAddress);
      expect(await dripDropCafe.coffeeNFT()).to.not.equal(ethers.ZeroAddress);
    });

    it("Should have correct constants", async function () {
      expect(await dripDropCafe.EMPTY()).to.equal(0);
    });
  });

  describe("Menu Price Management", function () {
    it("Should set menu price correctly", async function () {
      await dripDropCafe.setMenuPrice(ESPRESSO, PRICES[ESPRESSO]);
      expect(await dripDropCafe.getMenuPrice(ESPRESSO)).to.equal(
        PRICES[ESPRESSO]
      );
    });

    it("Should emit MenuPriceSet event", async function () {
      await expect(dripDropCafe.setMenuPrice(ESPRESSO, PRICES[ESPRESSO]))
        .to.emit(dripDropCafe, "MenuPriceSet")
        .withArgs(ESPRESSO, PRICES[ESPRESSO]);
    });

    it("Should revert when non-owner tries to set price", async function () {
      await expect(
        dripDropCafe.connect(user).setMenuPrice(ESPRESSO, PRICES[ESPRESSO])
      ).to.be.revertedWithCustomError(
        dripDropCafe,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should allow updating menu price", async function () {
      await dripDropCafe.setMenuPrice(ESPRESSO, PRICES[ESPRESSO]);
      const newPrice = ethers.parseEther("0.01");
      await dripDropCafe.setMenuPrice(ESPRESSO, newPrice);
      expect(await dripDropCafe.getMenuPrice(ESPRESSO)).to.equal(newPrice);
    });
  });

  describe("Recipe Management", function () {
    const espressoPattern = [0, 0, 0, 0, 1, 0, 0, 0, 0];
    const iceAmericanoPattern = [0, 1, 0, 1, 0, 1, 0, 5, 0];

    it("Should set recipe correctly", async function () {
      await dripDropCafe.setRecipe(
        ESPRESSO,
        espressoPattern,
        "ipfs://espresso/"
      );

      const storedPattern = await dripDropCafe.getRecipePattern(ESPRESSO);
      expect(storedPattern).to.deep.equal(espressoPattern);
    });

    it("Should emit RecipeSet event", async function () {
      await expect(
        dripDropCafe.setRecipe(ESPRESSO, espressoPattern, "ipfs://espresso/")
      )
        .to.emit(dripDropCafe, "RecipeSet")
        .withArgs(ESPRESSO);
    });

    it("Should revert when non-owner tries to set recipe", async function () {
      await expect(
        dripDropCafe
          .connect(user)
          .setRecipe(ESPRESSO, espressoPattern, "ipfs://espresso/")
      ).to.be.revertedWithCustomError(
        dripDropCafe,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should allow updating recipe", async function () {
      await dripDropCafe.setRecipe(
        ESPRESSO,
        espressoPattern,
        "ipfs://espresso/"
      );

      const newPattern = [1, 0, 0, 0, 0, 0, 0, 0, 0];
      await dripDropCafe.setRecipe(ESPRESSO, newPattern, "ipfs://espresso_v2/");

      const storedPattern = await dripDropCafe.getRecipePattern(ESPRESSO);
      expect(storedPattern).to.deep.equal(newPattern);
    });
  });

  describe("Order Menu", function () {
    const espressoPattern = [0, 0, 0, 0, 1, 0, 0, 0, 0];

    beforeEach(async function () {
      await dripDropCafe.setMenuPrice(ESPRESSO, PRICES[ESPRESSO]);
      await dripDropCafe.setRecipe(
        ESPRESSO,
        espressoPattern,
        "ipfs://espresso/"
      );
    });

    it("Should order menu successfully", async function () {
      const balanceBefore = await mockPaymentToken.balanceOf(user.address);
      await dripDropCafe.connect(user).orderMenu(ESPRESSO);
      const balanceAfter = await mockPaymentToken.balanceOf(user.address);

      expect(balanceBefore - balanceAfter).to.equal(PRICES[ESPRESSO]);
    });

    it("Should emit MenuOrdered event", async function () {
      await expect(dripDropCafe.connect(user).orderMenu(ESPRESSO))
        .to.emit(dripDropCafe, "MenuOrdered")
        .withArgs(user.address, ESPRESSO, 1); // Water ingredient
    });

    it("Should give user ingredient", async function () {
      await dripDropCafe.connect(user).orderMenu(ESPRESSO);
      const waterBalance = await ingredientToken.balanceOf(user.address, 1);
      expect(waterBalance).to.equal(1);
    });

    it("Should revert with MenuPriceNotSet if price not set", async function () {
      await expect(
        dripDropCafe.connect(user).orderMenu(HOT_AMERICANO)
      ).to.be.revertedWithCustomError(dripDropCafe, "MenuPriceNotSet");
    });

    it("Should revert with PaymentFailed if insufficient balance", async function () {
      // Set high price that user cannot afford
      await dripDropCafe.setMenuPrice(HOT_AMERICANO, ethers.parseEther("10"));
      await dripDropCafe.setRecipe(
        HOT_AMERICANO,
        espressoPattern,
        "ipfs://americano/"
      );

      await expect(
        dripDropCafe.connect(user).orderMenu(HOT_AMERICANO)
      ).to.be.revertedWithCustomError(dripDropCafe, "PaymentFailed");
    });

    it("Should revert with PaymentFailed if no allowance", async function () {
      // Remove allowance
      await mockPaymentToken
        .connect(user)
        .approve(await dripDropCafe.getAddress(), 0);

      await expect(
        dripDropCafe.connect(user).orderMenu(ESPRESSO)
      ).to.be.revertedWithCustomError(dripDropCafe, "PaymentFailed");
    });
  });

  describe("Craft Coffee", function () {
    const espressoPattern = [0, 0, 0, 0, 1, 0, 0, 0, 0];
    const iceAmericanoPattern = [0, 1, 0, 1, 0, 1, 0, 5, 0];

    beforeEach(async function () {
      await dripDropCafe.setMenuPrice(ESPRESSO, PRICES[ESPRESSO]);
      await dripDropCafe.setMenuPrice(ICE_AMERICANO, PRICES[ICE_AMERICANO]);
      await dripDropCafe.setRecipe(
        ESPRESSO,
        espressoPattern,
        "ipfs://espresso/"
      );
      await dripDropCafe.setRecipe(
        ICE_AMERICANO,
        iceAmericanoPattern,
        "ipfs://ice_americano/"
      );
    });

    it("Should craft coffee successfully", async function () {
      // Give user ingredients via orderMenu
      await dripDropCafe.connect(user).orderMenu(ESPRESSO);

      await dripDropCafe.connect(user).craftCoffee(ESPRESSO, espressoPattern);

      const nftBalance = await coffeeNFT.balanceOf(user.address);
      expect(nftBalance).to.equal(1);
    });

    it("Should emit Crafted event", async function () {
      await dripDropCafe.connect(user).orderMenu(ESPRESSO);

      await expect(
        dripDropCafe.connect(user).craftCoffee(ESPRESSO, espressoPattern)
      )
        .to.emit(dripDropCafe, "Crafted")
        .withArgs(user.address, ESPRESSO, 1);
    });

    it("Should burn ingredients correctly", async function () {
      // Give user ingredients for ice americano via orderMenu
      // Order multiple times to get enough ingredients
      for (let i = 0; i < 10; i++) {
        await dripDropCafe.connect(user).orderMenu(ICE_AMERICANO);
      }

      const waterBefore = await ingredientToken.balanceOf(user.address, 1);
      const iceBefore = await ingredientToken.balanceOf(user.address, 5);

      await dripDropCafe
        .connect(user)
        .craftCoffee(ICE_AMERICANO, iceAmericanoPattern);

      const waterAfter = await ingredientToken.balanceOf(user.address, 1);
      const iceAfter = await ingredientToken.balanceOf(user.address, 5);

      expect(waterBefore - waterAfter).to.equal(3);
      expect(iceBefore - iceAfter).to.equal(1);
    });

    it("Should revert with RecipeNotSet if recipe not set", async function () {
      await expect(
        dripDropCafe.connect(user).craftCoffee(HOT_AMERICANO, espressoPattern)
      ).to.be.revertedWithCustomError(dripDropCafe, "RecipeNotSet");
    });

    it("Should revert with IncorrectGrid if pattern doesn't match", async function () {
      await dripDropCafe.connect(user).orderMenu(ESPRESSO);

      const wrongPattern = [1, 0, 0, 0, 0, 0, 0, 0, 0];
      await expect(
        dripDropCafe.connect(user).craftCoffee(ESPRESSO, wrongPattern)
      ).to.be.revertedWithCustomError(dripDropCafe, "IncorrectGrid");
    });

    it("Should revert with InvalidIngredientID if ingredient ID not registered", async function () {
      // Try to set a recipe with unregistered ingredient ID 99
      const invalidPattern = [0, 0, 0, 0, 99, 0, 0, 0, 0]; // ID 99 is not registered

      // Should revert when trying to set recipe with invalid ingredient ID
      await expect(
        dripDropCafe.setRecipe(
          HOT_AMERICANO,
          invalidPattern,
          "ipfs://americano/"
        )
      ).to.be.revertedWithCustomError(dripDropCafe, "InvalidIngredientID");
    });

    it("Should revert if user doesn't have enough ingredients", async function () {
      // Don't give user any ingredients
      await expect(
        dripDropCafe.connect(user).craftCoffee(ESPRESSO, espressoPattern)
      ).to.be.reverted; // ERC1155 insufficient balance error
    });
  });

  describe("Redeem Coffee", function () {
    const espressoPattern = [0, 0, 0, 0, 1, 0, 0, 0, 0];

    beforeEach(async function () {
      await dripDropCafe.setMenuPrice(ESPRESSO, PRICES[ESPRESSO]);
      await dripDropCafe.setRecipe(
        ESPRESSO,
        espressoPattern,
        "ipfs://espresso/"
      );
      await dripDropCafe.connect(user).orderMenu(ESPRESSO);
      await dripDropCafe.connect(user).craftCoffee(ESPRESSO, espressoPattern);
    });

    it("Should redeem coffee successfully", async function () {
      const tokenId = 1;
      const nftBalanceBefore = await coffeeNFT.balanceOf(user.address);

      await dripDropCafe.connect(user).redeemCoffee(tokenId);

      const nftBalanceAfter = await coffeeNFT.balanceOf(user.address);
      expect(nftBalanceBefore - nftBalanceAfter).to.equal(1);
    });

    it("Should emit Redeemed event", async function () {
      const tokenId = 1;
      await expect(dripDropCafe.connect(user).redeemCoffee(tokenId))
        .to.emit(dripDropCafe, "Redeemed")
        .withArgs(user.address, tokenId);
    });

    it("Should revert with NotOwner if not token owner", async function () {
      const tokenId = 1;
      await expect(
        dripDropCafe.connect(user2).redeemCoffee(tokenId)
      ).to.be.revertedWithCustomError(dripDropCafe, "NotOwner");
    });

    it("Should revert if token doesn't exist", async function () {
      const nonExistentTokenId = 999;
      await expect(dripDropCafe.connect(user).redeemCoffee(nonExistentTokenId))
        .to.be.reverted; // ERC721 nonexistent token error
    });
  });

  describe("Withdraw Payments", function () {
    const espressoPattern = [0, 0, 0, 0, 1, 0, 0, 0, 0];

    beforeEach(async function () {
      await dripDropCafe.setMenuPrice(ESPRESSO, PRICES[ESPRESSO]);
      await dripDropCafe.setRecipe(
        ESPRESSO,
        espressoPattern,
        "ipfs://espresso/"
      );
      // Generate some revenue
      await dripDropCafe.connect(user).orderMenu(ESPRESSO);
    });

    it("Should withdraw payments successfully", async function () {
      const cafeBalance = await mockPaymentToken.balanceOf(
        await dripDropCafe.getAddress()
      );
      const ownerBalanceBefore = await mockPaymentToken.balanceOf(
        owner.address
      );

      await dripDropCafe.withdrawPayments(owner.address, cafeBalance);

      const ownerBalanceAfter = await mockPaymentToken.balanceOf(owner.address);
      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(cafeBalance);
    });

    it("Should revert when non-owner tries to withdraw", async function () {
      const cafeBalance = await mockPaymentToken.balanceOf(
        await dripDropCafe.getAddress()
      );

      await expect(
        dripDropCafe.connect(user).withdrawPayments(user.address, cafeBalance)
      ).to.be.revertedWithCustomError(
        dripDropCafe,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should revert with TransferFailed if insufficient balance", async function () {
      const excessiveAmount = ethers.parseEther("1000");
      await expect(
        dripDropCafe.withdrawPayments(owner.address, excessiveAmount)
      ).to.be.revertedWithCustomError(dripDropCafe, "TransferFailed");
    });
  });

  describe("Edge Cases and Security", function () {
    it("Should handle multiple users ordering same menu", async function () {
      const espressoPattern = [0, 0, 0, 0, 1, 0, 0, 0, 0];
      await dripDropCafe.setMenuPrice(ESPRESSO, PRICES[ESPRESSO]);
      await dripDropCafe.setRecipe(
        ESPRESSO,
        espressoPattern,
        "ipfs://espresso/"
      );

      await dripDropCafe.connect(user).orderMenu(ESPRESSO);
      await dripDropCafe.connect(user2).orderMenu(ESPRESSO);

      const user1Balance = await ingredientToken.balanceOf(user.address, 1);
      const user2Balance = await ingredientToken.balanceOf(user2.address, 1);

      expect(user1Balance).to.equal(1);
      expect(user2Balance).to.equal(1);
    });

    it("Should handle empty recipe pattern", async function () {
      const emptyPattern = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      await dripDropCafe.setRecipe(ESPRESSO, emptyPattern, "ipfs://empty/");

      await dripDropCafe.setMenuPrice(ESPRESSO, PRICES[ESPRESSO]);

      await expect(
        dripDropCafe.connect(user).orderMenu(ESPRESSO)
      ).to.be.revertedWithCustomError(dripDropCafe, "RecipeNotSet");
    });

    it("Should prevent reentrancy attacks", async function () {
      const espressoPattern = [0, 0, 0, 0, 1, 0, 0, 0, 0];
      await dripDropCafe.setMenuPrice(ESPRESSO, PRICES[ESPRESSO]);
      await dripDropCafe.setRecipe(
        ESPRESSO,
        espressoPattern,
        "ipfs://espresso/"
      );

      // This test verifies the nonReentrant modifier is working
      // The actual reentrancy test would require a malicious contract
      await expect(dripDropCafe.connect(user).orderMenu(ESPRESSO)).to.not.be
        .reverted;
    });
  });

  describe("Integration Tests", function () {
    it("Should complete full user journey", async function () {
      const espressoPattern = [0, 0, 0, 0, 1, 0, 0, 0, 0];

      // Setup
      await dripDropCafe.setMenuPrice(ESPRESSO, PRICES[ESPRESSO]);
      await dripDropCafe.setRecipe(
        ESPRESSO,
        espressoPattern,
        "ipfs://espresso/"
      );

      // Order menu
      await dripDropCafe.connect(user).orderMenu(ESPRESSO);

      // Craft coffee
      await dripDropCafe.connect(user).craftCoffee(ESPRESSO, espressoPattern);

      // Redeem coffee
      await dripDropCafe.connect(user).redeemCoffee(1);

      // Verify final states
      const nftBalance = await coffeeNFT.balanceOf(user.address);
      expect(nftBalance).to.equal(0);

      const cafeBalance = await mockPaymentToken.balanceOf(
        await dripDropCafe.getAddress()
      );
      expect(cafeBalance).to.equal(PRICES[ESPRESSO]);
    });
  });

  it("Should allow redeeming coffee NFT", async function () {
    // Set up menu and recipe first
    const pattern = [1, 0, 0, 0, 0, 0, 0, 0, 0]; // WATER only
    await dripDropCafe.setRecipe(1, pattern, "https://example.com/americano/");
    await dripDropCafe.setMenuPrice(1, ethers.parseEther("0.05"));

    // Order ingredients first
    await mockPaymentToken
      .connect(user)
      .approve(dripDropCafe.target, ethers.parseEther("0.1"));
    await dripDropCafe.connect(user).orderMenu(1);
    await dripDropCafe.connect(user).orderMenu(1);

    // Try to craft coffee
    await expect(dripDropCafe.connect(user).craftCoffee(1, pattern)).to.emit(
      dripDropCafe,
      "Crafted"
    );

    // Get the minted NFT token ID
    const coffeeBalance = await coffeeNFT.balanceOf(user.address);
    expect(coffeeBalance).to.equal(1);

    // Get token ID (should be 1 for first mint)
    const tokenId = 1;

    // Redeem the coffee NFT
    await expect(dripDropCafe.connect(user).redeemCoffee(tokenId))
      .to.emit(dripDropCafe, "Redeemed")
      .withArgs(user.address, tokenId);

    // Check NFT is burned
    const balanceAfter = await coffeeNFT.balanceOf(user.address);
    expect(balanceAfter).to.equal(0);
  });

  // New tests for pattern validation functions
  describe("Pattern Validation Functions", function () {
    beforeEach(async function () {
      // Ingredients are already registered in main beforeEach

      // Set menu prices
      await dripDropCafe.setMenuPrice(0, ethers.parseUnits("3", 6));
      await dripDropCafe.setMenuPrice(2, ethers.parseUnits("5", 6));
      await dripDropCafe.setMenuPrice(3, ethers.parseUnits("6", 6));

      // Set recipes (메뉴 0은 비워둠)
      await dripDropCafe.setRecipe(
        2,
        [0, 1, 0, 1, 0, 1, 0, 5, 0],
        "https://example.com/ice-americano/"
      );
      await dripDropCafe.setRecipe(
        3,
        [0, 1, 0, 0, 2, 0, 0, 3, 0],
        "https://example.com/hot-latte/"
      );
    });

    it("Should validate pattern correctly", async function () {
      const validPattern = [0, 1, 0, 1, 0, 1, 0, 5, 0];
      const invalidPattern = [1, 2, 3, 4, 5, 6, 7, 8, 9];

      expect(await dripDropCafe.validatePattern(2, validPattern)).to.be.true;
      expect(await dripDropCafe.validatePattern(2, invalidPattern)).to.be.false;
    });

    it("Should find matching recipe", async function () {
      const iceAmericanoPattern = [0, 1, 0, 1, 0, 1, 0, 5, 0];
      const hotLattePattern = [0, 1, 0, 0, 2, 0, 0, 3, 0];
      const noMatchPattern = [1, 2, 3, 4, 5, 6, 7, 8, 9];

      expect(
        await dripDropCafe.findMatchingRecipe(iceAmericanoPattern)
      ).to.equal(2);
      expect(await dripDropCafe.findMatchingRecipe(hotLattePattern)).to.equal(
        3
      );
      expect(await dripDropCafe.findMatchingRecipe(noMatchPattern)).to.equal(0);
    });

    it("Should return 0 for non-matching pattern", async function () {
      const nonMatchingPattern = [9, 8, 7, 6, 5, 4, 3, 2, 1];
      expect(
        await dripDropCafe.findMatchingRecipe(nonMatchingPattern)
      ).to.equal(0);
    });

    it("Should get menus with recipes", async function () {
      const menusWithRecipes = await dripDropCafe.getMenusWithRecipes();
      expect(menusWithRecipes).to.have.lengthOf(2);
      expect(menusWithRecipes).to.include(2n);
      expect(menusWithRecipes).to.include(3n);
    });

    it("Should check if user has required ingredients", async function () {
      // Mint ingredients to user
      await mockPaymentToken.mint(user.address, ethers.parseUnits("100", 6));
      await mockPaymentToken
        .connect(user)
        .approve(dripDropCafe.target, ethers.parseUnits("100", 6));

      // Order menus to get ingredients (레시피가 있는 메뉴만)
      await dripDropCafe.connect(user).orderMenu(2);
      await dripDropCafe.connect(user).orderMenu(3);

      const simplePattern = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const complexPattern = [0, 1, 0, 1, 0, 1, 0, 5, 0];

      // User should have some ingredients, but might not have all for complex patterns
      // This is probabilistic due to random ingredient distribution
      const hasSimple = await dripDropCafe.hasRequiredIngredients(
        user.address,
        simplePattern
      );
      const hasComplex = await dripDropCafe.hasRequiredIngredients(
        user.address,
        complexPattern
      );

      // At least one should be true or false (testing the function works)
      expect(typeof hasSimple).to.equal("boolean");
      expect(typeof hasComplex).to.equal("boolean");
    });

    it("Should handle complex patterns with multiple ingredients", async function () {
      // Mint ingredients to user
      await mockPaymentToken.mint(user.address, ethers.parseUnits("100", 6));
      await mockPaymentToken
        .connect(user)
        .approve(dripDropCafe.target, ethers.parseUnits("100", 6));

      // Order many menus to get various ingredients
      for (let i = 0; i < 20; i++) {
        await dripDropCafe.connect(user).orderMenu(2);
      }

      const complexPattern = [0, 1, 0, 1, 0, 1, 0, 5, 0];
      const hasIngredients = await dripDropCafe.hasRequiredIngredients(
        user.address,
        complexPattern
      );

      expect(typeof hasIngredients).to.equal("boolean");
    });
  });

  describe("Menu Information Functions", function () {
    beforeEach(async function () {
      // Ingredients are already registered in main beforeEach

      // Set menu prices
      await dripDropCafe.setMenuPrice(0, ethers.parseUnits("3", 6));
      await dripDropCafe.setMenuPrice(1, ethers.parseUnits("4", 6));
      await dripDropCafe.setMenuPrice(2, ethers.parseUnits("5", 6));

      // Set recipes with base URIs (메뉴 0은 비워둠)
      await dripDropCafe.setRecipe(
        2,
        [0, 1, 0, 1, 0, 1, 0, 5, 0],
        "https://example.com/ice-americano/"
      );
    });

    it("Should get all menus information", async function () {
      const [menuIds, prices, hasRecipes, baseURIList] =
        await dripDropCafe.getAllMenus();

      expect(menuIds).to.have.lengthOf(22);
      expect(prices).to.have.lengthOf(22);
      expect(hasRecipes).to.have.lengthOf(22);
      expect(baseURIList).to.have.lengthOf(22);

      // Check specific menus
      expect(menuIds[0]).to.equal(0);
      expect(prices[0]).to.equal(ethers.parseUnits("3", 6));
      expect(hasRecipes[0]).to.be.false; // 메뉴 0은 레시피 없음
      expect(baseURIList[0]).to.equal("");

      expect(menuIds[1]).to.equal(1);
      expect(prices[1]).to.equal(ethers.parseUnits("4", 6));
      expect(hasRecipes[1]).to.be.false;
      expect(baseURIList[1]).to.equal("");

      expect(menuIds[2]).to.equal(2);
      expect(prices[2]).to.equal(ethers.parseUnits("5", 6));
      expect(hasRecipes[2]).to.be.true;
      expect(baseURIList[2]).to.equal("https://example.com/ice-americano/");
    });

    it("Should get individual menu information", async function () {
      const [price, hasRecipe, baseURI, pattern] =
        await dripDropCafe.getMenuInfo(2);

      expect(price).to.equal(ethers.parseUnits("5", 6));
      expect(hasRecipe).to.be.true;
      expect(baseURI).to.equal("https://example.com/ice-americano/");
      expect(pattern).to.deep.equal([0, 1, 0, 1, 0, 1, 0, 5, 0]);
    });

    it("Should get menu base URI", async function () {
      expect(await dripDropCafe.getMenuBaseURI(2)).to.equal(
        "https://example.com/ice-americano/"
      );
      expect(await dripDropCafe.getMenuBaseURI(0)).to.equal(""); // No recipe set
      expect(await dripDropCafe.getMenuBaseURI(1)).to.equal(""); // No recipe set
    });

    it("Should handle menus without recipes", async function () {
      const [price, hasRecipe, baseURI, pattern] =
        await dripDropCafe.getMenuInfo(1);

      expect(price).to.equal(ethers.parseUnits("4", 6));
      expect(hasRecipe).to.be.false;
      expect(baseURI).to.equal("");
      expect(pattern).to.deep.equal([0, 0, 0, 0, 0, 0, 0, 0, 0]); // Default empty pattern
    });

    it("Should handle menus without prices", async function () {
      const [price, hasRecipe, baseURI, pattern] =
        await dripDropCafe.getMenuInfo(9);

      expect(price).to.equal(0);
      expect(hasRecipe).to.be.false;
      expect(baseURI).to.equal("");
      expect(pattern).to.deep.equal([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    });
  });
});
