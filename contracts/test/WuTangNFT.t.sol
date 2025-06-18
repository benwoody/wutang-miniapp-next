// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "../lib/forge-std/src/Test.sol";
import "../src/WuTangNFT.sol";

contract WuTangNFTTest is Test {
    WuTangNFT nft;
    address owner = address(0xABCD);
    address user = address(0xBEEF);

    function setUp() public {
        vm.prank(owner);
        nft = new WuTangNFT(owner);
    }

    function testMintNFT() public {
        string memory tokenURI = "data:application/json;base64,eyJmb28iOiJiYXIifQ==";
        vm.prank(owner);
        uint256 tokenId = nft.mintNFT(user, tokenURI);

        assertEq(tokenId, 0);
        assertEq(nft.ownerOf(0), user);
        assertEq(nft.tokenURI(0), tokenURI);
    }

    function testOnlyOwnerCanMint() public {
        string memory tokenURI = "data:application/json;base64,eyJmb28iOiJiYXIifQ==";
        vm.prank(user);
        vm.expectRevert();
        nft.mintNFT(user, tokenURI);
    }
}