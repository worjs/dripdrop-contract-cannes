// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CoffeeNFT
 * @dev ERC721 NFT for coffee tokens
 */
contract CoffeeNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    uint256 private _nextTokenId;
    
    // Base URI for each menu ID
    mapping(uint256 => string) public baseURIs;
    
    // Token ID to menu mapping
    mapping(uint256 => uint256) public tokenMenus;
    
    // Menu specific counters for serial numbers
    mapping(uint256 => uint256) public menuCounters;

    // Custom Errors
    error InvalidMenuID();
    error TokenNotExists();
    error NotAuthorized();

    constructor() ERC721("CoffeeNFT", "COFFEE") Ownable(msg.sender) {
        _nextTokenId = 1;
    }

    /**
     * @dev Mint coffee NFT
     * @param to Address to mint to
     * @param menuId Menu ID
     * @return tokenId Minted token ID
     */
    function mint(address to, uint256 menuId) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        tokenMenus[tokenId] = menuId;
        menuCounters[menuId]++;
        
        _safeMint(to, tokenId);
        
        // Set token URI if baseURI exists
        string memory baseURI = baseURIs[menuId];
        if (bytes(baseURI).length > 0) {
            _setTokenURI(tokenId, string(abi.encodePacked(baseURI, _toString(menuCounters[menuId]))));
        }
        
        return tokenId;
    }

    /**
     * @dev Burn coffee NFT
     * @param tokenId Token ID to burn
     */
    function burn(uint256 tokenId) external onlyOwner {
        _burn(tokenId);
    }

    /**
     * @dev Set base URI for menu ID
     * @param menuId Menu ID
     * @param baseURI Base URI string
     */
    function setBaseURI(uint256 menuId, string memory baseURI) external onlyOwner {
        baseURIs[menuId] = baseURI;
    }

    /**
     * @dev Get menu ID of token
     * @param tokenId Token ID
     * @return Menu ID
     */
    function getTokenMenu(uint256 tokenId) external view returns (uint256) {
        if (_ownerOf(tokenId) == address(0)) revert TokenNotExists();
        return tokenMenus[tokenId];
    }

    /**
     * @dev Get count of NFTs owned by user for specific menu
     * @param user User address
     * @param menuId Menu ID
     * @return count Number of NFTs owned by user for the menu
     */
    function getUserMenuNFTCount(address user, uint256 menuId) external view returns (uint256) {
        uint256 count = 0;
        uint256 balance = balanceOf(user);
        
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            if (tokenMenus[tokenId] == menuId) {
                count++;
            }
        }
        
        return count;
    }

    /**
     * @dev Get all NFT token IDs owned by user for specific menu
     * @param user User address
     * @param menuId Menu ID
     * @return tokenIds Array of token IDs owned by user for the menu
     */
    function getUserMenuNFTs(address user, uint256 menuId) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory temp = new uint256[](balance);
        uint256 count = 0;
        
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            if (tokenMenus[tokenId] == menuId) {
                temp[count] = tokenId;
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = temp[i];
        }
        
        return result;
    }

    // Required overrides
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    // Helper function to convert uint to string
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
} 