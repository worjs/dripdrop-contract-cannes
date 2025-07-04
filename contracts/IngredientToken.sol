// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IngredientToken
 * @dev ERC1155 token for coffee ingredients with dynamic ingredient management
 */
contract IngredientToken is ERC1155, ERC1155Supply, Ownable {
    // Dynamic ingredient management
    mapping(uint256 => bool) public validIngredients;
    mapping(uint256 => string) public ingredientNames;
    uint256 public maxIngredientId;
    
    // Events
    event IngredientRegistered(uint256 indexed id, string name);
    event IngredientRemoved(uint256 indexed id);
    
    // Custom Errors
    error InvalidIngredientID();
    error IngredientAlreadyExists();
    error IngredientNotExists();

    constructor() ERC1155("") Ownable(msg.sender) {}

    /**
     * @dev Register a new ingredient type
     * @param id Ingredient ID
     * @param name Ingredient name
     */
    function registerIngredient(uint256 id, string memory name) external onlyOwner {
        if (validIngredients[id]) revert IngredientAlreadyExists();
        
        validIngredients[id] = true;
        ingredientNames[id] = name;
        
        if (id > maxIngredientId) {
            maxIngredientId = id;
        }
        
        emit IngredientRegistered(id, name);
    }

    /**
     * @dev Remove an ingredient type (only if no supply exists)
     * @param id Ingredient ID
     */
    function removeIngredient(uint256 id) external onlyOwner {
        if (!validIngredients[id]) revert IngredientNotExists();
        if (totalSupply(id) > 0) revert("Cannot remove ingredient with existing supply");
        
        validIngredients[id] = false;
        delete ingredientNames[id];
        
        emit IngredientRemoved(id);
    }

    /**
     * @dev Check if ingredient ID is valid
     * @param id Ingredient ID
     * @return True if valid
     */
    function isValidIngredient(uint256 id) external view returns (bool) {
        return validIngredients[id];
    }

    /**
     * @dev Get ingredient name
     * @param id Ingredient ID
     * @return Ingredient name
     */
    function getIngredientName(uint256 id) external view returns (string memory) {
        if (!validIngredients[id]) revert IngredientNotExists();
        return ingredientNames[id];
    }

    /**
     * @dev Get all valid ingredient IDs
     * @return Array of valid ingredient IDs
     */
    function getValidIngredients() external view returns (uint256[] memory) {
        uint256[] memory temp = new uint256[](maxIngredientId + 1);
        uint256 count = 0;
        
        for (uint256 i = 0; i <= maxIngredientId; i++) {
            if (validIngredients[i]) {
                temp[count] = i;
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
     * @dev Mint ingredients to address
     * @param to Address to mint to
     * @param id Ingredient ID
     * @param amount Amount to mint
     * @param data Additional data
     */
    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external onlyOwner {
        if (!validIngredients[id]) revert InvalidIngredientID();
        _mint(to, id, amount, data);
    }

    /**
     * @dev Batch mint ingredients
     * @param to Address to mint to
     * @param ids Array of ingredient IDs
     * @param amounts Array of amounts
     * @param data Additional data
     */
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) external onlyOwner {
        for (uint256 i = 0; i < ids.length; i++) {
            if (!validIngredients[ids[i]]) revert InvalidIngredientID();
        }
        _mintBatch(to, ids, amounts, data);
    }

    /**
     * @dev Burn ingredients from address
     * @param from Address to burn from
     * @param id Ingredient ID
     * @param amount Amount to burn
     */
    function burn(
        address from,
        uint256 id,
        uint256 amount
    ) external onlyOwner {
        if (!validIngredients[id]) revert InvalidIngredientID();
        _burn(from, id, amount);
    }

    /**
     * @dev Burn ingredients from address
     * @param from Address to burn from
     * @param ids Array of ingredient IDs
     * @param amounts Array of amounts
     */
    function burnBatch(
        address from,
        uint256[] memory ids,
        uint256[] memory amounts
    ) external onlyOwner {
        _burnBatch(from, ids, amounts);
    }

    // Required override for ERC1155Supply
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }
} 