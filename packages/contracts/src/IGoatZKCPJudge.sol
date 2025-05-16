// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

/// @title 
/// @author
interface IGoatZKCPJudge {

    function initialize(address _seller, address _buyer, uint256 _price) external;

    function init(bytes32 _hashZ) payable external;

    function verify(bytes calldata proof, bytes32 k) external;

    function refund() external;

    function checkPrice() external view returns (uint64);
}
