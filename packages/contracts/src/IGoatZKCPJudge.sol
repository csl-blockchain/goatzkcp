// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

/// @title 
/// @author
interface IGoatZKCPJudge {

    function initialize(saddress _seller, saddress _buyer, suint256 _price) external;

    function init(bytes32 _hashZ) payable external;

    function verify(bytes calldata proof, bytes32 k) external;

    function refund() external;

}
