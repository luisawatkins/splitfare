// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SplitFareCIDRegistry {
    struct Anchor {
        string cid;
        uint64 timestamp;
        uint256 recordCount;
    }

    event CIDAchored(
        uint256 indexed groupId,
        string cid,
        uint256 recordCount,
        uint64 timestamp
    );

    mapping(uint256 => Anchor[]) private _anchors;
    mapping(uint256 => mapping(bytes32 => bool)) private _cidExists;

    function anchorGroupCID(
        uint256 groupId,
        string calldata cid,
        uint256 recordCount
    ) external {
        bytes memory cidBytes = bytes(cid);
        require(cidBytes.length != 0, "CIDEmpty");

        uint64 ts = uint64(block.timestamp);
        Anchor memory anchor = Anchor({
            cid: cid,
            timestamp: ts,
            recordCount: recordCount
        });

        _anchors[groupId].push(anchor);
        _cidExists[groupId][keccak256(cidBytes)] = true;

        emit CIDAchored(groupId, cid, recordCount, ts);
    }

    function getLatestAnchor(
        uint256 groupId
    ) external view returns (Anchor memory) {
        Anchor[] storage list = _anchors[groupId];
        uint256 length = list.length;
        require(length != 0, "NoAnchors");
        return list[length - 1];
    }

    function getAnchorHistory(
        uint256 groupId
    ) external view returns (Anchor[] memory) {
        return _anchors[groupId];
    }

    function verifyCID(
        uint256 groupId,
        string calldata cid
    ) external view returns (bool) {
        return _cidExists[groupId][keccak256(bytes(cid))];
    }

    function getAnchorCount(
        uint256 groupId
    ) external view returns (uint256) {
        return _anchors[groupId].length;
    }
}

