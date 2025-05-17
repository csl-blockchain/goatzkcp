// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./Groth16Verifier.sol";

/// @title Groth16Core
/// @author GoatZKCP
library Groth16Core {
    
    function verify(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[2] calldata _pubSignals
    ) public view returns (bool) {
        Groth16Verifier verifier = Groth16Verifier(address(0)); // This will be replaced with the actual verifier address
        return verifier.verifyProof(_pA, _pB, _pC, _pubSignals);
    }

    // Alternative implementation where the verifier address is passed as a parameter
    function verifyWithAddress(
        address verifierAddress,
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[2] calldata _pubSignals
    ) public view returns (bool) {
        Groth16Verifier verifier = Groth16Verifier(verifierAddress);
        return verifier.verifyProof(_pA, _pB, _pC, _pubSignals);
    }
}
