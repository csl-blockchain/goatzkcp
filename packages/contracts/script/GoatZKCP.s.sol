// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Lock} from "../src/Lock.sol";

contract GoatZKCPScript is Script {
    uint256 currentTimestampInSeconds = block.timestamp / 1000 + (block.timestamp % 1000 == 0 ? 0 : 1);
    uint256 ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    uint256 unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;
    Lock public lock;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVKEY");

        vm.startBroadcast(deployerPrivateKey);
        lock = new Lock(unlockTime);
        vm.stopBroadcast();
    }
}
