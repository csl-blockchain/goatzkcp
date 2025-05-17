// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

/// @title 
/// @author
interface IGoatZKCPJudge {

    function initialize(address _seller, address _buyer, uint256 _price) external;

    function setVerifier(address _verifierAddress) external;

    function init(bytes32 _hashZ) payable external;

    function verify(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[2] calldata _pubSignals,
        bytes32 k
    ) external;

    function refund() external;

    function checkPrice() external view returns (uint64);

    function getLockContract() external view returns (address);
}
