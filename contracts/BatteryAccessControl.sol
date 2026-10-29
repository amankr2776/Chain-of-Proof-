// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BatteryAccessControl
 * @dev EU Battery Directive Role-Based Access Control & QpiAI Quantum Nonce Verified Ledger
 */
contract BatteryAccessControl {
    enum Role { None, Manufacturer, Recycler, Auditor }

    struct BatteryUpdate {
        bytes32 dataHash;
        string qpiaiNonce;
        uint256 timestamp;
    }

    mapping(address => Role) public roles;
    mapping(string => BatteryUpdate[]) public batteryHistory;

    event SOHUpdated(string indexed batteryId, bytes32 indexed dataHash, string qpiaiNonce);
    event RoleAssigned(address indexed account, Role role);

    address public owner;

    constructor() {
        owner = msg.sender;
        roles[msg.sender] = Role.Manufacturer;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "UNAUTHORIZED: NOT OWNER");
        _;
    }

    modifier onlyRole(Role _role) {
        require(roles[msg.sender] == _role, "UNAUTHORIZED: INVALID ROLE");
        _;
    }

    modifier onlyAuthorized() {
        require(
            roles[msg.sender] == Role.Manufacturer || roles[msg.sender] == Role.Recycler,
            "UNAUTHORIZED: INVALID ROLE"
        );
        _;
    }

    function grantRole(address account, Role role) external onlyOwner {
        roles[account] = role;
        emit RoleAssigned(account, role);
    }

    /**
     * @dev Updates SOH state with SHA-256 telemetry hash and required QpiAI QCloud QRNG nonce.
     */
    function updateBatterySOH(
        string memory batteryId,
        bytes32 _dataHash,
        string memory _qpiaiNonce
    ) external onlyAuthorized {
        // Deep Security Feature: Require non-empty QpiAI QCloud QRNG Quantum Nonce
        require(bytes(_qpiaiNonce).length > 0, "SECURITY: MISSING QRNG NONCE");

        batteryHistory[batteryId].push(BatteryUpdate({
            dataHash: _dataHash,
            qpiaiNonce: _qpiaiNonce,
            timestamp: block.timestamp
        }));

        emit SOHUpdated(batteryId, _dataHash, _qpiaiNonce);
    }

    function getUpdateCount(string memory batteryId) external view returns (uint256) {
        return batteryHistory[batteryId].length;
    }
}
