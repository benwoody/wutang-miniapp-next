// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Script.sol";
import "src/WuTangNFT.sol";

contract WuTangNFTScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);

        WuTangNFT nft = new WuTangNFT(deployer);

        vm.stopBroadcast();

        console.log("WuTangNFT deployed to:", address(nft));
        console.log("Owner:", deployer);
    }
}
