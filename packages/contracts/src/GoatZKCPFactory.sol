// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./utils/Ownable.sol";
import "./GoatZKCPJudge.sol";

/// @title 
/// @author
contract GoatZKCPFactory is Ownable {

    event ExchangeCreate(address indexed judge, address indexed seller, address indexed buyer, uint256 price, uint256 timestamp);

    mapping(saddress => mapping(saddress => mapping(suint256 => saddress))) private getJudgesMap;
    saddress[] judges;

    mapping(saddress => mapping(saddress => mapping(suint256 => saddress))) private getVerifiersMap;
    saddress[] verifiers;
    
    /// @notice Getter function for judges mapping
    function getJudges(saddress party1, saddress party2, suint256 timestamp) external view returns (address) {
        return address(getJudgesMap[party1][party2][suint256(timestamp)]);
    }

    /// @notice We recommend buyer to create the exchange
    function createExchange(address seller, address verifier, suint256 timestamp, suint256 price) external returns (address judge) {
        require(seller != address(0), 'GoatZKCP: seller address is invalid');
        require(verifier != address(0), 'GoatZKCP: verifier address is invalid');
        
        address buyer = msg.sender; // msg.sender is the buyer
        bytes memory bytecode = abi.encodePacked(
            type(GoatZKCPJudge).creationCode,
            abi.encode(price)
            );
        bytes32 salt = keccak256(abi.encodePacked(seller, buyer, price));
        assembly {
            judge := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IGoatZKCPJudge(judge).initialize(saddress(seller), saddress(buyer), saddress(verifier), price);
        
        getJudgesMap[saddress(seller)][saddress(buyer)][timestamp] = saddress(judge);
        getJudgesMap[saddress(buyer)][saddress(seller)][timestamp] = saddress(judge);
        judges.push(saddress(judge));

        getVerifiersMap[saddress(seller)][saddress(buyer)][timestamp] = saddress(verifier);
        getVerifiersMap[saddress(buyer)][saddress(seller)][timestamp] = saddress(verifier);
        verifiers.push(saddress(verifier));
        
        emit ExchangeCreate(judge, address(seller), buyer, uint256(price), uint256(timestamp));

        return judge;
    }

    function getJudge(address seller, address buyer, suint256 timestamp) external view returns (address) {
        return address(getJudgesMap[saddress(seller)][saddress(buyer)][timestamp]);
    }

    function getVerifier(address seller, address buyer, suint256 timestamp) external view returns (address) {
        return address(getVerifiersMap[saddress(seller)][saddress(buyer)][timestamp]);
    }

    function judgesLength() external view returns (uint) {
        return uint(judges.length);
    }

}
