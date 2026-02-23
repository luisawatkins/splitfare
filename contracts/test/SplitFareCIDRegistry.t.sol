// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../src/SplitFareCIDRegistry.sol";

contract SplitFareCIDRegistryTest {
    SplitFareCIDRegistry private registry;

    constructor() {
        registry = new SplitFareCIDRegistry();
    }

    function testAnchorAndLatest() public {
        uint256 groupId = 1;
        string memory cid = "bafy-test-cid-1";
        uint256 recordCount = 3;

        registry.anchorGroupCID(groupId, cid, recordCount);

        SplitFareCIDRegistry.Anchor memory latest = registry.getLatestAnchor(
            groupId
        );

        assert(
            keccak256(bytes(latest.cid)) == keccak256(bytes(cid))
                && latest.recordCount == recordCount
                && latest.timestamp != 0
        );
    }

    function testAnchorHistory() public {
        uint256 groupId = 2;

        registry.anchorGroupCID(groupId, "cid-a", 1);
        registry.anchorGroupCID(groupId, "cid-b", 2);

        SplitFareCIDRegistry.Anchor[] memory history = registry
            .getAnchorHistory(groupId);

        assert(history.length == 2);
        assert(
            keccak256(bytes(history[0].cid)) == keccak256(bytes("cid-a"))
                && history[0].recordCount == 1
        );
        assert(
            keccak256(bytes(history[1].cid)) == keccak256(bytes("cid-b"))
                && history[1].recordCount == 2
        );
    }

    function testVerifyCID() public {
        uint256 groupId = 3;

        registry.anchorGroupCID(groupId, "cid-x", 10);

        bool existsX = registry.verifyCID(groupId, "cid-x");
        bool existsY = registry.verifyCID(groupId, "cid-y");

        assert(existsX);
        assert(!existsY);
    }
}

