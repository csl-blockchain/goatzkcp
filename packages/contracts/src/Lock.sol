// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Lock {
    suint private unlockTime;
    saddress private owner;

    event Withdrawal(uint amount, uint when);

    constructor(suint _unlockTime) payable {
        require(
            suint(block.timestamp) < _unlockTime,
            "Unlock time should be in the future"
        );

        unlockTime = _unlockTime;
        owner = saddress(payable(msg.sender));
    }

    function getUnlockTime() external view returns (uint) {
        return uint(unlockTime);
    }

    function getOwner() external view returns (address) {
        return address(owner);
    }

    function withdraw() public {
        // Uncomment this line, and the import of "hardhat/console.sol", to print a log in your terminal
        // console.log("Unlock time is %o and block timestamp is %o", unlockTime, block.timestamp);

        require(suint(block.timestamp) >= unlockTime, "You can't withdraw yet");
        require(saddress(msg.sender) == owner, "You aren't the owner");

        emit Withdrawal(uint(address(this).balance), uint(block.timestamp));

        payable(address(owner)).transfer(address(this).balance);
    }
}
