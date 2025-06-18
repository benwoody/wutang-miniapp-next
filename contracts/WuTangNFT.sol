// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract WuTangNFT is ERC721 {
    // Mapping from user address to array of minted token IDs
    mapping(address => uint256[]) private _mintedTokensByUser;

    uint256 private _tokenIdCounter;

    constructor() ERC721("WuTangNFT", "WTNFT") {}

    function mint() external {
        uint256 tokenId = _tokenIdCounter + 1;
        _mint(msg.sender, tokenId);
        _mintedTokensByUser[msg.sender].push(tokenId);
        _tokenIdCounter = tokenId;
    }

    // View function to get all minted token IDs by a user
    function getMintedTokens(address user) external view returns (uint256[] memory) {
        return _mintedTokensByUser[user];
    }
}