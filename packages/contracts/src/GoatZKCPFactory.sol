// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./utils/Ownable.sol";
import "./GoatZKCPJudge.sol";

/// @title 
/// @author
contract GoatZKCPFactory is Ownable {

    event ExchangeCreate(address indexed judge, address indexed seller, address indexed buyer, uint256 price, uint256 timestamp);

    mapping(address => mapping(address => mapping(suint256 => address))) private getJudgesMap;
    address[] judges;
    
    // Default verifier address that will be used for all exchanges
    saddress private defaultVerifier;

    /// @notice Set the default verifier address
    function setDefaultVerifier(address _verifierAddress) external onlyOwner {
        require(_verifierAddress != address(0), "GoatZKCP: invalid verifier address");
        defaultVerifier = saddress(_verifierAddress);
    }

    /// @notice Getter function for judges mapping
    function getJudges(address party1, address party2, uint256 timestamp) external view returns (address) {
        return getJudgesMap[party1][party2][suint256(timestamp)];
    }

    /// @notice We recommend buyer to create the exchange
    function createExchange(address seller, uint256 price) external returns (address judge) {
        require(seller != address(0), 'GoatZKCP: seller is zero address');
        
        address buyer = msg.sender; // msg.sender is the buyer
        suint256 timestamp = suint256(block.timestamp);
        bytes memory bytecode = abi.encodePacked(
            type(GoatZKCPJudge).creationCode,
            abi.encode(price)
            );
        bytes32 salt = keccak256(abi.encodePacked(seller, buyer, price));
        assembly {
            judge := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IGoatZKCPJudge(judge).initialize(seller, buyer, price);
        
        // Set the verifier address if a default one is available
        if (defaultVerifier != saddress(0)) {
            GoatZKCPJudge(judge).setVerifier(address(defaultVerifier));
        }
        
        getJudgesMap[seller][buyer][timestamp] = judge;
        getJudgesMap[buyer][seller][timestamp] = judge;
        judges.push(judge);
        
        emit ExchangeCreate(judge, seller, buyer, price, uint256(timestamp));
    }

    /// @notice Create exchange with a specific verifier
    function createExchangeWithVerifier(address seller, uint256 price, address verifierAddress) external returns (address judge) {
        require(seller != address(0), 'GoatZKCP: seller is zero address');
        require(verifierAddress != address(0), 'GoatZKCP: verifier is zero address');
        
        address buyer = msg.sender; // msg.sender is the buyer
        suint256 timestamp = suint256(block.timestamp);
        bytes memory bytecode = abi.encodePacked(
            type(GoatZKCPJudge).creationCode,
            abi.encode(price)
            );
        bytes32 salt = keccak256(abi.encodePacked(seller, buyer, price, verifierAddress));
        assembly {
            judge := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IGoatZKCPJudge(judge).initialize(seller, buyer, price);
        GoatZKCPJudge(judge).setVerifier(verifierAddress);
        
        getJudgesMap[seller][buyer][timestamp] = judge;
        getJudgesMap[buyer][seller][timestamp] = judge;
        judges.push(judge);
        
        emit ExchangeCreate(judge, seller, buyer, price, uint256(timestamp));
    }

    function judgesLength() external view returns (uint) {
        return judges.length;
    }

}
