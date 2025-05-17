// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./IGoatZKCPJudge.sol";
import "./Config.sol";
import "./utils/ReentrancyGuard.sol";
import "./Groth16Core.sol";
import "./Events.sol";

contract GoatZKCPJudge is IGoatZKCPJudge, ReentrancyGuard, Config, Events {

    saddress private factory; // factory

    /// @notice variables set by the factory
    saddress private seller; // seller
    saddress private buyer; // buyer
    suint256 private price; // price

    /// @notice variables set by the buyer
    bytes32 public hashZ;

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

    /// @notice Factory initialize the contract
    function initialize(address _seller, address _buyer, uint256 _price) external {
        require(saddress(msg.sender) == factory, 'GoatZKCP: only GoatZKCPFactory can initialize the contract');
        require(_seller != address(0), "GoatZKCP: invalid address.");
        require(_buyer != address(0), "GoatZKCP: invalid address.");
        factory = saddress(msg.sender);
        buyer = saddress(_buyer);
        seller = saddress(_seller);
        price = suint256(_price);

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
        // set initialize timestamp
        t0 = suint256(block.timestamp);
        // update contract state
        status = ExchangeStatus.initialized;

        emit ExchangeInit(uint256(t0), _hashZ);
    }

    /// @notice Seller handout the proof and other information to verify
    function verify(bytes calldata proof, bytes32 k) nonReentrant external {
        require(saddress(msg.sender) == seller, "GoatZKCP: invalid verify invoker.");
        require(status == ExchangeStatus.initialized, "GoatZKCP: invalid contract status.");
        t1 = suint256(block.timestamp);
        require(uint256(t1) <= uint256(t0) + LIMIT_TIME_TAU, "GoatZKCP: invalid verify because of time expired.");

        sbool success = sbool(Groth16Core.verify());
        if(success) {
            // transfer payment to seller
            payable(address(seller)).transfer(uint64(price));
            // update contract state
            status = ExchangeStatus.finished;

            emit ExchangeVerifySuccess(uint256(t1), proof, k);
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

    /// Return unshielded price callable only by seller or buyer
    function checkPrice() external view returns (uint64) {
        require(saddress(msg.sender) == buyer || saddress(msg.sender) == seller, 'GoatZKCP: only the buyer or the seller can check the price.');
        return uint64(price);
    }
}
