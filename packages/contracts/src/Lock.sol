// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Lock {
    suint private unlockTime;
    saddress private owner;
    saddress private judge;
    bytes32 private keyK;
    sbool private keyRevealed;

    event Withdrawal(uint amount, uint when);
    event KeyRevealed(bytes32 key);

    constructor(suint _unlockTime, address _owner) payable {
        require(
            suint(block.timestamp) < _unlockTime,
            "Unlock time should be in the future"
        );

        unlockTime = _unlockTime;
        owner = saddress(payable(_owner));
        judge = saddress(msg.sender);
        keyRevealed = sbool(false);
    }

    function getUnlockTime() external view returns (uint) {
        return uint(unlockTime);
    }

    function getOwner() external view returns (address) {
        return address(owner);
    }
    
    function getJudge() external view returns (address) {
        return address(judge);
    }

    function transferOwnership(address newOwner) external {
        require(saddress(msg.sender) == judge, "Only judge can transfer ownership");
        owner = saddress(newOwner);
    }

    function revealKey(bytes32 _keyK) external {
        require(saddress(msg.sender) == judge, "Only judge can reveal key");
        keyK = _keyK;
        keyRevealed = sbool(true);
        emit KeyRevealed(_keyK);
    }

    function getKey() external view returns (bytes32) {
        require(keyRevealed, "Key not revealed yet");
        return keyK;
    }

    function withdrawByJudge(address recipient) external {
        require(saddress(msg.sender) == judge, "Only judge can force withdraw");
        require(recipient != address(0), "Invalid recipient address");
        
        emit Withdrawal(address(this).balance, block.timestamp);
        
        payable(recipient).transfer(address(this).balance);
    }
}
