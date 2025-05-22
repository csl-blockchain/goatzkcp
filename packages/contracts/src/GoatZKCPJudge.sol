// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./IGoatZKCPJudge.sol";
import "./Config.sol";
import "./utils/ReentrancyGuard.sol";
import "./Groth16Core.sol";
import "./Events.sol";
import "./Lock.sol";

contract GoatZKCPJudge is IGoatZKCPJudge, ReentrancyGuard, Config, Events {

    saddress private factory; // factory

    /// @notice variables set by the factory
    saddress private seller; // seller
    saddress private buyer; // buyer
    suint256 private price; // price
    saddress private verifier;

    /// @notice variables set by the buyer
    bytes32 public hashZ;
    Lock public lockContract;

    /// @notice timestamps
    suint256 private t0;
    suint256 private t1;
    suint256 private t2;

    /// @notice status of the exchange
    ExchangeStatus private status;

    /// @notice Contract statuses
    enum ExchangeStatus {
        uninitialized,
        initialized,
        finished,
        expired
    }

    constructor() {
        factory = saddress(msg.sender);
    }

    /// @notice Getter functions for shielded variables
    function getFactory() external view returns (address) {
        return address(factory);
    }

    function getSeller() external view returns (address) {
        return address(seller);
    }

    function getBuyer() external view returns (address) {
        return address(buyer);
    }

    function getPrice() external view returns (uint256) {
        return uint256(price);
    }

    function getStatus() external view returns (string memory) {
        uint8 statusInt = uint8(status);
        if (statusInt == 0) {
            return "uninitialized";
        } else if (statusInt == 1) {
            return "initialized";
        } else if (statusInt == 2) {
            return "finished";
        } else {
            return "expired";
        }
    }

    function getT0() external view returns (uint256) {
        return uint256(t0);
    }

    function getT1() external view returns (uint256) {
        return uint256(t1);
    }

    function getT2() external view returns (uint256) {
        return uint256(t2);
    }

    function getLockContract() external view returns (address) {
        return address(lockContract);
    }

    function getKey() external view returns (bytes32) {
        require(saddress(msg.sender) == buyer, "GoatZKCP: only buyer is allowed to get the key.");
        return lockContract.getKey();
    }

    /// @notice Factory initialize the contract
    function initialize(saddress _seller, saddress _buyer, saddress _verifier, suint256 _price) external {
        require(saddress(msg.sender) == factory, 'GoatZKCP: only GoatZKCPFactory can initialize the contract');
        require(_seller != saddress(0), "GoatZKCP: invalid seller address.");
        require(_buyer != saddress(0), "GoatZKCP: invalid buyer address.");
        require(_verifier != saddress(0), "GoatZKCP: invalid verifier address.");
        factory = saddress(msg.sender);
        buyer = _buyer;
        seller = _seller;
        verifier = _verifier;
        price = _price;

        // initialize contract status
        status = ExchangeStatus.uninitialized;
    }

    /// @notice Buyer initially start the exchange procedure
    function init(bytes32 _hashZ) payable nonReentrant external {
        require(saddress(msg.sender) == buyer, "GoatZKCP: invalid initializer.");
        require(status == ExchangeStatus.uninitialized, "GoatZKCP: invalid contract status.");
        require(suint64(msg.value) >= price, "GoatZKCP: payment not enough.");

        // set Hash of Z
        hashZ = _hashZ;

        // Create a new Lock contract with the payment
        uint lockTime = block.timestamp + LIMIT_TIME_TAU;
        lockContract = new Lock{value: msg.value}(suint256(lockTime), address(seller));
        
        // set initialize timestamp
        t0 = suint256(block.timestamp);
        // update contract state
        status = ExchangeStatus.initialized;

        emit ExchangeInit(uint256(t0), _hashZ);
    }

    /// @notice Seller handout the proof and other information to verify
    function verify(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[2] calldata _pubSignals,
        bytes32 k
    ) nonReentrant external {
        require(saddress(msg.sender) == seller, "GoatZKCP: invalid verify invoker.");
        require(status == ExchangeStatus.initialized, "GoatZKCP: invalid contract status.");
        require(verifier != saddress(0), "GoatZKCP: verifier address not set");
        
        t1 = suint256(block.timestamp);
        require(uint256(t1) <= uint256(t0) + LIMIT_TIME_TAU, "GoatZKCP: invalid verify because of time expired.");

        // Verify the proof using Groth16Core
        bool success = Groth16Core.verifyWithAddress(address(verifier), _pA, _pB, _pC, _pubSignals);
        
        if(success) {
            // Transfer the payment to the seller by using the Lock contract
            lockContract.withdrawByJudge(address(seller));
            
            // Reveal the key k to the buyer through the Lock contract
            lockContract.revealKey(k);

            // update contract state
            status = ExchangeStatus.finished;

            emit ExchangeVerifySuccess(uint256(t1), abi.encode(_pA, _pB, _pC), k);
            return;
        }

        emit ExchangeVerifyFail(uint256(t1));
    }

    /// @notice Contract refunds buyer if the exchange expired without valid proof
    function refund() nonReentrant external {
        require(saddress(msg.sender) == buyer, "GoatZKCP: invalid refund invoker.");
        require(status == ExchangeStatus.initialized, "GoatZKCP: invalid contract status.");

        t2 = suint256(block.timestamp);
        require(uint256(t2) > uint256(t0) + LIMIT_TIME_TAU, "GoatZKCP: invalid refund operation.");

        // refund buyer
        payable(address(buyer)).transfer(uint64(price));

        // update contract state
        status = ExchangeStatus.expired;

        emit ExchangeRefund(uint256(t2));
    }

}
