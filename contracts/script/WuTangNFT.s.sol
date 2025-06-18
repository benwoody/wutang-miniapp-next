// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Script.sol";
import "src/WuTangNFT.sol";

contract WuTangNFTScript is Script {
    function setUp() public {}

    function run() public {
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey;
        
        // Handle private key with or without 0x prefix
        if (bytes(privateKeyStr).length == 64) {
            // No 0x prefix, add it
            deployerPrivateKey = vm.parseUint(string(abi.encodePacked("0x", privateKeyStr)));
        } else {
            // Has 0x prefix
            deployerPrivateKey = vm.parseUint(privateKeyStr);
        }
        
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);

        WuTangNFT nft = new WuTangNFT(deployer);

        vm.stopBroadcast();

        console.log("WuTangNFT deployed to:", address(nft));
        console.log("Owner:", deployer);
    }
}
