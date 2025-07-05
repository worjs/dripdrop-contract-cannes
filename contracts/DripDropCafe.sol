// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./MockPaymentToken.sol";
import "./IngredientToken.sol";
import "./CoffeeNFT.sol";

/**
 * @title DripDropCafe
 * @dev Main contract for the DripDrop cafe system
 */
contract DripDropCafe is Ownable, ReentrancyGuard {
    MockPaymentToken public immutable payment;
    IngredientToken public immutable ingredient;
    CoffeeNFT public immutable coffeeNFT;

    uint8 public constant EMPTY = 0;

    struct Recipe3x3 {
        bytes32 hash;        // pattern hash
        uint8[9] pattern;    // exact pattern (read-only)
    }

    mapping(uint256 => Recipe3x3) public recipes;
    mapping(uint256 => uint256) public menuPrices;
    mapping(uint256 => string) public baseURIs;

    // Custom Errors
    error MenuPriceNotSet();
    error PaymentFailed();
    error RecipeNotSet();
    error IncorrectGrid();
    error InvalidIngredientID();
    error NotOwner();
    error TransferFailed();

    // Events
    event MenuOrdered(address indexed user, uint256 indexed menuId, uint8 ingredientId);
    event Crafted(address indexed user, uint256 indexed menuId, uint256 indexed tokenId);
    event Redeemed(address indexed user, uint256 indexed tokenId);
    event MenuPriceSet(uint256 indexed menuId, uint256 price);
    event RecipeSet(uint256 indexed menuId);

    constructor(address _payment) Ownable(msg.sender) {
        payment = MockPaymentToken(_payment);
        ingredient = new IngredientToken();
        coffeeNFT = new CoffeeNFT();
        
        // Transfer ownership of child contracts to this contract
        ingredient.transferOwnership(address(this));
        coffeeNFT.transferOwnership(address(this));
    }

    /**
     * @dev Order a menu item - pay and receive random ingredient
     * @param menuId Menu ID to order
     */
    function orderMenu(uint256 menuId) external nonReentrant {
        uint256 price = menuPrices[menuId];
        if (price == 0) revert MenuPriceNotSet();

        // Payment
        try payment.transferFrom(msg.sender, address(this), price) {
            // Success - continue
        } catch {
            revert PaymentFailed();
        }

        // Get random ingredient and mint to user
        uint8 ingredientId = _randomIngredient(menuId);
        ingredient.mint(msg.sender, ingredientId, 1, "");

        emit MenuOrdered(msg.sender, menuId, ingredientId);
    }

    /**
     * @dev Craft coffee using ingredients
     * @param menuId Menu ID to craft
     * @param pattern 3x3 pattern array
     */
    function craftCoffee(uint256 menuId, uint8[9] memory pattern) external nonReentrant {
        Recipe3x3 memory recipe = recipes[menuId];
        if (recipe.hash == 0) revert RecipeNotSet();

        // Validate pattern matches recipe
        bytes32 patternHash = keccak256(abi.encodePacked(pattern));
        if (patternHash != recipe.hash) revert IncorrectGrid();

        // Validate all non-empty ingredients are valid
        for (uint256 i = 0; i < 9; i++) {
            if (pattern[i] != EMPTY && !ingredient.isValidIngredient(pattern[i])) {
                revert InvalidIngredientID();
            }
        }

        // Burn ingredients from user
        for (uint256 i = 0; i < 9; i++) {
            if (pattern[i] != EMPTY) {
                ingredient.burn(msg.sender, pattern[i], 1);
            }
        }

        // Set base URI for the menu if not already set
        if (bytes(baseURIs[menuId]).length > 0) {
            coffeeNFT.setBaseURI(menuId, baseURIs[menuId]);
        }
        
        // Mint coffee NFT
        uint256 tokenId = coffeeNFT.mint(msg.sender, menuId);

        emit Crafted(msg.sender, menuId, tokenId);
    }

    /**
     * @dev Burn coffee NFT (wrapper for CoffeeNFT.burn)
     * @param tokenId Coffee NFT token ID
     */
    function burnCoffeeNFT(uint256 tokenId) external nonReentrant {
        if (coffeeNFT.ownerOf(tokenId) != msg.sender) revert NotOwner();
        
        coffeeNFT.burn(tokenId);
        emit Redeemed(msg.sender, tokenId);
    }

    /**
     * @dev Redeem coffee NFT
     * @param tokenId Coffee NFT token ID
     */
    function redeemCoffee(uint256 tokenId) external nonReentrant {
        if (coffeeNFT.ownerOf(tokenId) != msg.sender) revert NotOwner();
        
        coffeeNFT.burn(tokenId);
        emit Redeemed(msg.sender, tokenId);
    }

    /**
     * @dev Set menu price (onlyOwner)
     * @param menuId Menu ID
     * @param price Price in payment tokens
     */
    function setMenuPrice(uint256 menuId, uint256 price) external onlyOwner {
        menuPrices[menuId] = price;
        emit MenuPriceSet(menuId, price);
    }

    /**
     * @dev Set recipe for menu (onlyOwner)
     * @param menuId Menu ID
     * @param pattern 3x3 pattern array
     * @param uriPrefix URI prefix for NFT metadata
     */
    function setRecipe(uint256 menuId, uint8[9] memory pattern, string memory uriPrefix) external onlyOwner {
        // Validate all non-empty ingredients are valid
        for (uint256 i = 0; i < 9; i++) {
            if (pattern[i] != EMPTY && !ingredient.isValidIngredient(pattern[i])) {
                revert InvalidIngredientID();
            }
        }

        bytes32 hash = keccak256(abi.encodePacked(pattern));
        recipes[menuId] = Recipe3x3({
            hash: hash,
            pattern: pattern
        });
        baseURIs[menuId] = uriPrefix;
        
        emit RecipeSet(menuId);
    }

    /**
     * @dev Get menu price
     * @param menuId Menu ID
     * @return Price in payment tokens
     */
    function getMenuPrice(uint256 menuId) external view returns (uint256) {
        return menuPrices[menuId];
    }

    /**
     * @dev Get recipe hash for menu
     * @param menuId Menu ID
     * @return Recipe hash
     */
    function getRecipeHash(uint256 menuId) external view returns (bytes32) {
        return recipes[menuId].hash;
    }

    /**
     * @dev Get recipe pattern for menu
     * @param menuId Menu ID
     * @return pattern 3x3 pattern array
     */
    function getRecipePattern(uint256 menuId) external view returns (uint8[9] memory) {
        return recipes[menuId].pattern;
    }

    /**
     * @dev Register a new ingredient type (onlyOwner)
     * @param id Ingredient ID
     * @param name Ingredient name
     */
    function registerIngredient(uint256 id, string memory name) external onlyOwner {
        ingredient.registerIngredient(id, name);
    }

    /**
     * @dev Remove an ingredient type (onlyOwner)
     * @param id Ingredient ID
     */
    function removeIngredient(uint256 id) external onlyOwner {
        ingredient.removeIngredient(id);
    }

    /**
     * @dev Get all valid ingredient IDs
     * @return Array of valid ingredient IDs
     */
    function getValidIngredients() external view returns (uint256[] memory) {
        return ingredient.getValidIngredients();
    }

    /**
     * @dev Get ingredient name
     * @param id Ingredient ID
     * @return Ingredient name
     */
    function getIngredientName(uint256 id) external view returns (string memory) {
        return ingredient.getIngredientName(id);
    }

    /**
     * @dev Validate pattern against recipe (for FE pre-validation)
     * @param menuId Menu ID to validate against
     * @param pattern 3x3 pattern array
     * @return isValid True if pattern matches recipe
     */
    function validatePattern(uint256 menuId, uint8[9] memory pattern) external view returns (bool) {
        Recipe3x3 memory recipe = recipes[menuId];
        if (recipe.hash == 0) return false;
        
        bytes32 patternHash = keccak256(abi.encodePacked(pattern));
        return patternHash == recipe.hash;
    }

    /**
     * @dev Check if pattern matches recipe and return menuId if valid, 0 if invalid
     * @param pattern 3x3 pattern array
     * @return menuId Menu ID if pattern matches any recipe, 0 if no match
     */
    function findMatchingRecipe(uint8[9] memory pattern) external view returns (uint256) {
        bytes32 patternHash = keccak256(abi.encodePacked(pattern));
        
        // Check against known menu IDs (you might want to track these)
        // For now, we'll check common menu IDs (1-10)
        for (uint256 menuId = 1; menuId <= 10; menuId++) {
            if (recipes[menuId].hash == patternHash) {
                return menuId;
            }
        }
        
        return 0; // No matching recipe found
    }

    /**
     * @dev Get all menu IDs that have recipes set
     * @return Array of menu IDs with recipes
     */
    function getMenusWithRecipes() external view returns (uint256[] memory) {
        uint256[] memory temp = new uint256[](10); // Assuming max 10 menus
        uint256 count = 0;
        
        for (uint256 menuId = 1; menuId <= 10; menuId++) {
            if (recipes[menuId].hash != 0) {
                temp[count] = menuId;
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = temp[i];
        }
        
        return result;
    }

    /**
     * @dev Check if user has sufficient ingredients for a pattern
     * @param user User address
     * @param pattern 3x3 pattern array
     * @return hasSufficient True if user has all required ingredients
     */
    function hasRequiredIngredients(address user, uint8[9] memory pattern) external view returns (bool) {
        // Count required ingredients using arrays (max 10 different ingredient types)
        uint256[10] memory ingredientIds;
        uint256[10] memory requiredCounts;
        uint256 uniqueCount = 0;
        
        // Count required ingredients
        for (uint256 i = 0; i < 9; i++) {
            if (pattern[i] != EMPTY) {
                bool found = false;
                // Check if ingredient already counted
                for (uint256 j = 0; j < uniqueCount; j++) {
                    if (ingredientIds[j] == pattern[i]) {
                        requiredCounts[j]++;
                        found = true;
                        break;
                    }
                }
                // If not found, add new ingredient
                if (!found && uniqueCount < 10) {
                    ingredientIds[uniqueCount] = pattern[i];
                    requiredCounts[uniqueCount] = 1;
                    uniqueCount++;
                }
            }
        }
        
        // Check if user has sufficient balance for each ingredient
        for (uint256 i = 0; i < uniqueCount; i++) {
            if (ingredient.balanceOf(user, ingredientIds[i]) < requiredCounts[i]) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * @dev Withdraw payment tokens (onlyOwner)
     * @param to Address to withdraw to
     * @param amount Amount to withdraw
     */
    function withdrawPayments(address to, uint256 amount) external onlyOwner {
        try payment.transfer(to, amount) {
            // Success - continue
        } catch {
            revert TransferFailed();
        }
    }

    /**
     * @dev Get random ingredient from recipe pool
     * @param menuId Menu ID
     * @return Random ingredient ID
     */
    function _randomIngredient(uint256 menuId) internal view returns (uint8) {
        uint8[9] memory p = recipes[menuId].pattern;
        uint8[9] memory pool;
        uint256 poolLen;
        
        // Build pool of valid ingredients
        for (uint256 i = 0; i < 9; i++) {
            uint8 v = p[i];
            if (v != EMPTY) {
                pool[poolLen++] = v;
            }
        }
        
        if (poolLen == 0) revert RecipeNotSet();
        
        // Pseudo-random selection
        uint256 r = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender, block.prevrandao))
        ) % poolLen;
        
        return pool[r];
    }
} 