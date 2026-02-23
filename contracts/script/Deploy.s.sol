// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../src/SplitFareCIDRegistry.sol";

interface Vm {
    function envUint(string calldata key) external returns (uint256);
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
}

address constant VM_ADDRESS =
    address(uint160(uint256(keccak256("hevm cheat code"))));
Vm constant vm = Vm(VM_ADDRESS);

contract Deploy {
    function run() external returns (SplitFareCIDRegistry registry) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerKey);
        registry = new SplitFareCIDRegistry();
        vm.stopBroadcast();
    }
}

