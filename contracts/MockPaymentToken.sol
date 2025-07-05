// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockPaymentToken
 * @dev Mock USDC for DripDropCafe payments
 */
contract MockPaymentToken is ERC20, Ownable {
    constructor() ERC20("USD Coin", "USDC") Ownable(msg.sender) {
        // Mint initial supply to deployer (1M USDC with 6 decimals)
        _mint(msg.sender, 1000000 * 10**6);
    }

    /**
     * @dev Override decimals to return 6 (like real USDC)
     */
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    /**
     * @dev Mint new tokens (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (in wei, considering 6 decimals)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
} 