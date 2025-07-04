// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CoffeeNFT
 * @dev ERC721 NFT for coffee tokens
 */
contract CoffeeNFT is ERC721, ERC721URIStorage, Ownable {
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
    function burn(uint256 tokenId) external {
        if (!_isAuthorized(ownerOf(tokenId), msg.sender, tokenId) && msg.sender != owner()) {
            revert NotAuthorized();
        }
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

    // Required overrides
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
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