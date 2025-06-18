// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract WuTangNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    mapping(address => uint256[]) private _mintedTokensByUser;
    mapping(address => bool) public hasMinted;

    uint256 public nextTokenId;
    uint256 public constant MINT_PRICE = 0.002 ether;
    uint256 public constant MAX_SUPPLY = 10000; // Optional: set max supply
    
    // Events for better tracking
    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event FundsWithdrawn(address indexed owner, uint256 amount);

    constructor(address initialOwner) ERC721("WuTang Name NFT", "WUTANG") Ownable(initialOwner) {}

    function mintNFT(address to, string memory tokenURI) public payable nonReentrant returns (uint256) {
        require(msg.value == MINT_PRICE, "Incorrect ETH amount sent");
        require(!hasMinted[to], "User has already minted");
        require(nextTokenId < MAX_SUPPLY, "Max supply reached");
        require(bytes(tokenURI).length > 0, "Token URI cannot be empty");
        
        uint256 tokenId = nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        _mintedTokensByUser[to].push(tokenId);
        hasMinted[to] = true;
        nextTokenId++;
        
        emit NFTMinted(to, tokenId, tokenURI);
        return tokenId;
    }

    function getMintedTokens(address user) external view returns (uint256[] memory) {
        return _mintedTokensByUser[user];
    }

    function totalSupply() external view returns (uint256) {
        return nextTokenId;
    }

    function withdraw() public onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(owner(), balance);
    }

    function updateMintPrice(uint256) external view onlyOwner {
        revert("Mint price is fixed");
    }

    function getContractBalance() external view onlyOwner returns (uint256) {
        return address(this).balance;
    }
}
