// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {Script, console} from "forge-std/Script.sol";
import {Groth16Verifier} from "../src/Groth16Verifier.sol";

contract Groth16VerifierScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVKEY"); // Load deployer's private key

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the GoatZKCPJudge contract
        Groth16Verifier verifier = new Groth16Verifier();
        
        console.log("Verifier deployed at:", address(verifier));

        vm.stopBroadcast();
    }
}
