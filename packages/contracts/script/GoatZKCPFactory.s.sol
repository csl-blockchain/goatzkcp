// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {Script, console} from "forge-std/Script.sol";
import {GoatZKCPFactory} from "../src/GoatZKCPFactory.sol";
import {GoatZKCPJudge} from "../src/GoatZKCPJudge.sol";

contract GoatZKCPFactoryScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVKEY"); // Load deployer's private key

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the Factory contract first
        GoatZKCPFactory factory = new GoatZKCPFactory();
        console.log("GoatZKCPFactory deployed at:", address(factory));
        
        vm.stopBroadcast();
    }
} 