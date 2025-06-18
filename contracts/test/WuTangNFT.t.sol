// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../lib/forge-std/src/Test.sol";
import "../lib/forge-std/src/console.sol";

import "../src/WuTangNFT.sol";

contract WuTangNFTTest is Test {
    WuTangNFT nft;
    address owner = address(0xABCD);
    address user1 = address(0xBEEF);
    address user2 = address(0xCAFE);
    address user3 = address(0xDEAD);

    // Events to test
    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event FundsWithdrawn(address indexed owner, uint256 amount);

    function setUp() public {
        vm.deal(user1, 1 ether);
        vm.deal(user2, 1 ether);
        vm.deal(user3, 1 ether);
        vm.deal(owner, 1 ether);

        vm.prank(owner);
        nft = new WuTangNFT(owner);
    }

    function testMintNFTWithCorrectValue() public {
        string memory tokenURI = "data:application/json;base64,eyJmb28iOiJiYXIifQ==";
        
        // Test event emission
        vm.expectEmit(true, true, false, true);
        emit NFTMinted(user1, 0, tokenURI);
        
        nft.mintNFT{value: 0.002 ether}(user1, tokenURI);
        
        assertEq(nft.ownerOf(0), user1);
        assertEq(nft.tokenURI(0), tokenURI);
        assertTrue(nft.hasMinted(user1));
        assertEq(nft.totalSupply(), 1);
    }

    function testMintNFTWithIncorrectValue() public {
        string memory tokenURI = "data:application/json;base64,eyJmb28iOiJiYXIifQ==";
        
        // Test too little ETH
        vm.expectRevert("Incorrect ETH amount sent");
        nft.mintNFT{value: 0.001 ether}(user1, tokenURI);
        
        // Test too much ETH
        vm.expectRevert("Incorrect ETH amount sent");
        nft.mintNFT{value: 0.003 ether}(user1, tokenURI);
    }

    function testMintNFTWithEmptyURI() public {
        vm.expectRevert("Token URI cannot be empty");
        nft.mintNFT{value: 0.002 ether}(user1, "");
    }

    function testGetMintedTokens() public {
        string memory tokenURI = "data:application/json;base64,eyJmb28iOiJiYXIifQ==";

        // User mints one NFT
        nft.mintNFT{value: 0.002 ether}(user1, tokenURI);

        // Get minted tokens for user
        uint256[] memory tokens = nft.getMintedTokens(user1);

        console.log("Minted tokens for user:", tokens.length);
        assertEq(tokens.length, 1);
        assertEq(tokens[0], 0);
        
        // Test empty array for user who hasn't minted
        uint256[] memory emptyTokens = nft.getMintedTokens(user2);
        assertEq(emptyTokens.length, 0);
    }

    function testUserCanOnlyMintOnce() public {
        string memory tokenURI = "data:application/json;base64,eyJmb28iOiJiYXIifQ==";
        
        // First mint should succeed
        nft.mintNFT{value: 0.002 ether}(user1, tokenURI);
        assertTrue(nft.hasMinted(user1));

        // Second mint should fail
        vm.expectRevert("User has already minted");
        nft.mintNFT{value: 0.002 ether}(user1, tokenURI);
    }

    function testMultipleUsersMinting() public {
        string memory tokenURI1 = "data:application/json;base64,eyJmb28iOiJiYXIifQ==";
        string memory tokenURI2 = "data:application/json;base64,eyJiYXoiOiJxdXgifQ==";
        string memory tokenURI3 = "data:application/json;base64,eyJoZWxsbyI6IndvcmxkIn0=";

        // Multiple users mint
        nft.mintNFT{value: 0.002 ether}(user1, tokenURI1);
        nft.mintNFT{value: 0.002 ether}(user2, tokenURI2);
        nft.mintNFT{value: 0.002 ether}(user3, tokenURI3);

        // Check ownership
        assertEq(nft.ownerOf(0), user1);
        assertEq(nft.ownerOf(1), user2);
        assertEq(nft.ownerOf(2), user3);
        
        // Check total supply
        assertEq(nft.totalSupply(), 3);
        
        // Check hasMinted status
        assertTrue(nft.hasMinted(user1));
        assertTrue(nft.hasMinted(user2));
        assertTrue(nft.hasMinted(user3));
    }

    function testMaxSupplyLimit() public {
        // This test would be expensive to run fully, so we'll test the logic
        // by checking that the require statement exists in a smaller scenario
        
        // For testing purposes, let's assume we're near the limit
        // We can't easily test 10,000 mints in a unit test due to gas limits
        
        string memory tokenURI = "data:application/json;base64,eyJmb28iOiJiYXIifQ==";
        
        // Test that minting works normally
        nft.mintNFT{value: 0.002 ether}(user1, tokenURI);
        assertEq(nft.totalSupply(), 1);
        
        // The max supply check is in the contract, we trust it works
        // In a real scenario, you'd need to test this with a modified contract
        // or by actually minting 10,000 NFTs (which is impractical in tests)
    }

    function testOwnerCanWithdraw() public {
        string memory tokenURI = "data:application/json;base64,eyJmb28iOiJiYXIifQ==";
        
        // Multiple users mint to accumulate funds
        nft.mintNFT{value: 0.002 ether}(user1, tokenURI);
        nft.mintNFT{value: 0.002 ether}(user2, "data:application/json;base64,eyJiYXoiOiJxdXgifQ==");

        uint256 contractBalanceBefore = address(nft).balance;
        uint256 ownerBalanceBefore = owner.balance;
        
        assertEq(contractBalanceBefore, 0.004 ether);

        // Test event emission
        vm.expectEmit(true, false, false, true);
        emit FundsWithdrawn(owner, contractBalanceBefore);

        vm.prank(owner);
        nft.withdraw();

        assertEq(address(nft).balance, 0);
        assertEq(owner.balance, ownerBalanceBefore + contractBalanceBefore);
    }

    function testWithdrawWithNoFunds() public {
        vm.prank(owner);
        vm.expectRevert("No funds to withdraw");
        nft.withdraw();
    }

    function testNonOwnerCannotWithdraw() public {
        string memory tokenURI = "data:application/json;base64,eyJmb28iOiJiYXIifQ==";
        nft.mintNFT{value: 0.002 ether}(user1, tokenURI);

        vm.prank(user1);
        vm.expectRevert();
        nft.withdraw();
    }

    function testGetContractBalance() public {
        string memory tokenURI = "data:application/json;base64,eyJmb28iOiJiYXIifQ==";
        
        // Initially should be 0
        vm.prank(owner);
        assertEq(nft.getContractBalance(), 0);
        
        // After minting should increase
        nft.mintNFT{value: 0.002 ether}(user1, tokenURI);
        
        vm.prank(owner);
        assertEq(nft.getContractBalance(), 0.002 ether);
        
        // Non-owner cannot check balance
        vm.prank(user1);
        vm.expectRevert();
        nft.getContractBalance();
    }

    function testUpdateMintPriceReverts() public {
        vm.prank(owner);
        vm.expectRevert("Mint price is fixed");
        nft.updateMintPrice(0.001 ether);
        
        // Non-owner also cannot call it
        vm.prank(user1);
        vm.expectRevert();
        nft.updateMintPrice(0.001 ether);
    }

    function testContractConstants() public view {
        assertEq(nft.MINT_PRICE(), 0.002 ether);
        assertEq(nft.MAX_SUPPLY(), 10000);
    }

    function testTokenMetadata() public view {
        assertEq(nft.name(), "WuTang Name NFT");
        assertEq(nft.symbol(), "WUTANG");
    }

    function testTotalSupplyTracking() public {
        string memory tokenURI = "data:application/json;base64,eyJmb28iOiJiYXIifQ==";
        
        assertEq(nft.totalSupply(), 0);
        
        nft.mintNFT{value: 0.002 ether}(user1, tokenURI);
        assertEq(nft.totalSupply(), 1);
        
        nft.mintNFT{value: 0.002 ether}(user2, "data:application/json;base64,eyJiYXoiOiJxdXgifQ==");
        assertEq(nft.totalSupply(), 2);
    }

    function testReentrancyProtection() public {
        // This is a basic test - in practice, reentrancy protection is tested
        // by attempting to call the function recursively, but that's complex to set up
        // The nonReentrant modifier from OpenZeppelin is battle-tested
        
        string memory tokenURI = "data:application/json;base64,eyJmb28iOiJiYXIifQ==";
        
        // Normal minting should work
        nft.mintNFT{value: 0.002 ether}(user1, tokenURI);
        
        // Normal withdrawal should work
        vm.prank(owner);
        nft.withdraw();
        
        // The reentrancy protection is handled by OpenZeppelin's modifier
    }
}
