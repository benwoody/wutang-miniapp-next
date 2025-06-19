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
    uint256 public constant MAX_SUPPLY = 5000; // Matches unique Wu-Tang name combinations
    
    // Events for better tracking
    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event NFTBurned(address indexed from, uint256 indexed tokenId);
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

    /**
     * @dev Burns a token. Only the contract owner can burn tokens.
     * This function removes the token from existence and updates the user's mint status.
     * @param tokenId The ID of the token to burn
     */
    function burnNFT(uint256 tokenId) public onlyOwner nonReentrant {
        address tokenOwner = ownerOf(tokenId);
        require(tokenOwner != address(0), "Token does not exist");
        
        // Remove token from user's minted tokens array
        uint256[] storage userTokens = _mintedTokensByUser[tokenOwner];
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (userTokens[i] == tokenId) {
                // Move the last element to the current position and remove the last element
                userTokens[i] = userTokens[userTokens.length - 1];
                userTokens.pop();
                break;
            }
        }
        
        // If user has no more tokens, reset their mint status
        if (userTokens.length == 0) {
            hasMinted[tokenOwner] = false;
        }
        
        // Burn the token
        _burn(tokenId);
        
        emit NFTBurned(tokenOwner, tokenId);
    }

    /**
     * @dev Burns multiple tokens in a single transaction. Only the contract owner can burn tokens.
     * @param tokenIds Array of token IDs to burn
     */
    function burnMultipleNFTs(uint256[] calldata tokenIds) external onlyOwner nonReentrant {
        require(tokenIds.length > 0, "No tokens to burn");
        require(tokenIds.length <= 50, "Too many tokens to burn at once"); // Gas limit protection
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            burnNFT(tokenIds[i]);
        }
    }
}
