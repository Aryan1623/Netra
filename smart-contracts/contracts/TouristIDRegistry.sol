// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title TouristIDRegistry
/// @notice Register trusted issuers and anchor credential hashes (verifiable credentials).
contract TouristIDRegistry {
    address public owner;

    // issuer address => trusted (bool)
    mapping(address => bool) public trustedIssuer;

    // anchored credential hash => issuer address
    mapping(bytes32 => address) public credentialAnchor;

    event IssuerTrusted(address indexed issuer, bool trusted);
    event CredentialAnchored(bytes32 indexed credentialHash, address indexed issuer, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    modifier onlyTrustedIssuer() {
        require(trustedIssuer[msg.sender], "not a trusted issuer");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Add or remove a trusted issuer
    function setTrustedIssuer(address issuer, bool trusted) external onlyOwner {
        trustedIssuer[issuer] = trusted;
        emit IssuerTrusted(issuer, trusted);
    }

    /// @notice Anchor a credential hash on-chain. Only trusted issuers may call.
    /// @param credentialHash sha256 hash (bytes32) of the credential JSON.
    function anchorCredential(bytes32 credentialHash) external onlyTrustedIssuer {
        require(credentialHash != bytes32(0), "invalid hash");
        require(credentialAnchor[credentialHash] == address(0), "already anchored");
        credentialAnchor[credentialHash] = msg.sender;
        emit CredentialAnchored(credentialHash, msg.sender, block.timestamp);
    }

    /// @notice Get issuer who anchored a credential
    function getCredentialIssuer(bytes32 credentialHash) external view returns (address) {
        return credentialAnchor[credentialHash];
    }
}
