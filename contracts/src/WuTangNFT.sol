// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WuTangNFT is ERC721URIStorage, Ownable {
    mapping(address => uint256[]) private _mintedTokensByUser;
    mapping(address => bool) public hasMinted;

    uint256 public nextTokenId;
    uint256 public constant MINT_PRICE = 0.002 ether;

    constructor(address initialOwner) ERC721("WuTang Name NFT", "WUTANG") Ownable(initialOwner) {}

    function mintNFT(address to, string memory tokenURI) public payable returns (uint256) {
        require(msg.value == MINT_PRICE, "Incorrect ETH amount sent");
        require(!hasMinted[to], "User has already minted");
        uint256 tokenId = nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        _mintedTokensByUser[to].push(tokenId);
        hasMinted[to] = true;
        nextTokenId++;
        return tokenId;
    }

    function getMintedTokens(address user) external view returns (uint256[] memory) {
        return _mintedTokensByUser[user];
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}