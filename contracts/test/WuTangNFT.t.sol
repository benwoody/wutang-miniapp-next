// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../lib/forge-std/src/Test.sol";
import "../lib/forge-std/src/console.sol";

import "../src/WuTangNFT.sol";

contract WuTangNFTTest is Test {
    WuTangNFT nft;
    address owner = address(0xABCD);
    address user = address(0xBEEF);

    function setUp() public {
        vm.deal(user, 1 ether);
        vm.deal(owner, 1 ether);

        vm.prank(owner);
        nft = new WuTangNFT(owner);
    }

    function testMintNFTWithCorrectValue() public {
        string memory tokenURI = "data:application/json;base64,eyJmb28iOiJiYXIifQ==";
        nft.mintNFT{value: 0.002 ether}(user, tokenURI);
        vm.prank(user);
        assertEq(nft.ownerOf(0), user);
    }

    function testMintNFTWithIncorrectValue() public {
        string memory tokenURI = "data:application/json;base64,eyJmb28iOiJiYXIifQ==";
        vm.prank(user);
        vm.expectRevert("Incorrect ETH amount sent");
        nft.mintNFT{value: 0.001 ether}(user, tokenURI);
    }

    function testOwnerCanWithdraw() public {
        string memory tokenURI = "data:application/json;base64,eyJmb28iOiJiYXIifQ==";
        vm.prank(user);
        nft.mintNFT{value: 0.002 ether}(user, tokenURI);

        uint256 contractBalanceBefore = address(nft).balance;
        uint256 ownerBalanceBefore = owner.balance;

        vm.prank(owner);
        nft.withdraw();

        assertEq(address(nft).balance, 0);
        assertEq(owner.balance, ownerBalanceBefore + contractBalanceBefore);
    }

    function testNonOwnerCannotWithdraw() public {
        vm.prank(user);
        vm.expectRevert();
        nft.withdraw();
    }
}