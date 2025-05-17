// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Lock} from "../src/Lock.sol";

contract LockScript is Script {
    uint256 currentTimestampInSeconds = block.timestamp / 1000 + (block.timestamp % 1000 == 0 ? 0 : 1);
    uint256 ONE_DAY_IN_SECS = 1 * 24 * 60 * 60;
    uint256 unlockTime = currentTimestampInSeconds + ONE_DAY_IN_SECS;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVKEY"); // Load deployer's private key

        vm.startBroadcast(deployerPrivateKey);

        Lock lock = new Lock(suint256(unlockTime));
        
        console.log("Lock deployed at:", address(lock));

        vm.stopBroadcast();
    }
}
