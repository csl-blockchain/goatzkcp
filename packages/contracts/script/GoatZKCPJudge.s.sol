// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {Script, console} from "forge-std/Script.sol";
import {GoatZKCPJudge} from "../src/GoatZKCPJudge.sol";

contract GoatZKCPJudgeScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVKEY"); // Load deployer's private key

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the GoatZKCPJudge contract
        GoatZKCPJudge judge = new GoatZKCPJudge();
        
        console.log("GoatZKCPJudge deployed at:", address(judge));

        vm.stopBroadcast();
    }
}
