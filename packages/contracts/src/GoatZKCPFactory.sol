// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./utils/Ownable.sol";
import "./GoatZKCPJudge.sol";

/// @title 
/// @author
contract GoatZKCPFactory is Ownable {

    event ExchangeCreate(saddress indexed judge, saddress indexed seller,  saddress indexed buyer, suint256 price, uint256 timestamp);

    mapping(saddress => mapping(saddress => mapping(suint256 => saddress))) public getJudges;
    saddress[] judges;

    /// @notice We recommend buyer to create the exchange
    function createExchange(saddress seller, suint256 price) external returns (saddress judge) {
        require(seller != saddress(0), 'GoatZKCP: seller is zero address');
        saddress buyer = msg.sender; // msg.sender is the buyer
        uint256 timestamp = block.timestamp;
        bytes memory bytecode = type(GoatZKCPJudge).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(seller, buyer, price));
        assembly {
            judge := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IGoatZKCPJudge(judge).initialize(seller, buyer, price);
        getJudges[seller][buyer][timestamp] = judge;
        getJudges[buyer][seller][timestamp] = judge;
        judges.push(judge);
        
        emit ExchangeCreate(judge, seller, buyer, price, timestamp);
    }

    function judgesLength() external view returns (uint) {
        return judges.length;
    }

}
