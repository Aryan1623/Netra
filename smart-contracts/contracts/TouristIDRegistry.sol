// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/Strings.sol";

/// @title TouristIDRegistry
/// @notice Register trusted issuers, anchor credential hashes (VCs), and link tourists via Aadhar → Passport with full profile & unique ID.
contract TouristIDRegistry {
    using Strings for uint256;

    address public owner;

    // issuer address => trusted (bool)
    mapping(address => bool) public trustedIssuer;

    // anchored credential hash => issuer address
    mapping(bytes32 => address) public credentialAnchor;

    // Store tourist details
    struct Tourist {
        string userId;           // now a string
        string aadhar;
        string passport;
        string name;
        string gender;
        uint8 age;
        bytes32 passwordHash;
        string nationality;
        string destination;
        address issuer; // who registered
    }

    // Aadhar → Tourist
    mapping(string => Tourist) private tourists;

    // UserId → Aadhar (reverse lookup)
    mapping(string => string) private userIdToAadhar;

    // Counter for unique numeric IDs
    uint256 private nextUserNumericId = 1;

    /// Events
    event IssuerTrusted(address issuer, bool trusted);
    event CredentialAnchored(bytes32 credentialHash, address issuer, uint256 timestamp);
    event UserRegistered(
        string userId,
        string aadhar,
        string passport,
        string name,
        string gender,
        uint8 age,
        string nationality,
        string destination,
        address issuer
    );

    /// Modifiers
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

    /// @notice Register a new user by linking Aadhar → Passport with full profile
    function registerUser(
        string memory aadhar,
        string memory passport,
        string memory name,
        string memory gender,
        uint8 age,
        bytes32 passwordHash,
        string memory nationality,
        string memory destination
    ) external onlyTrustedIssuer {
        require(bytes(aadhar).length > 0, "aadhar required");
        require(bytes(passport).length > 0, "passport required");
        require(bytes(tourists[aadhar].aadhar).length == 0, "user already exists");

        string memory userId = nextUserNumericId.toString();
        nextUserNumericId++;

        tourists[aadhar] = Tourist({
            userId: userId,
            aadhar: aadhar,
            passport: passport,
            name: name,
            gender: gender,
            age: age,
            passwordHash: passwordHash,
            nationality: nationality,
            destination: destination,
            issuer: msg.sender
        });

        // store reverse lookup
        userIdToAadhar[userId] = aadhar;

        emit UserRegistered(userId, aadhar, passport, name, gender, age, nationality, destination, msg.sender);
    }

    /// @notice Get user details by Aadhar
    function getUserByAadhar(string memory aadhar)
        external
        view
        returns (
            string memory userId,
            string memory passport,
            string memory name,
            string memory gender,
            uint8 age,
            string memory nationality,
            string memory destination,
            address issuer
        )
    {
        Tourist memory t = tourists[aadhar];
        return (t.userId, t.passport, t.name, t.gender, t.age, t.nationality, t.destination, t.issuer);
    }

    /// @notice Get user details by UserId
    function getUserById(string memory userId)
        external
        view
        returns (
            string memory,
            string memory passport,
            string memory name,
            string memory gender,
            uint8 age,
            string memory nationality,
            string memory destination,
            address issuer
        )
    {
        string memory aadhar = userIdToAadhar[userId];
        Tourist memory t = tourists[aadhar];
        require(bytes(t.userId).length != 0, "user not found");
        return (t.userId, t.passport, t.name, t.gender, t.age, t.nationality, t.destination, t.issuer);
    }

    /// @notice Verify a user's password (hash comparison)
    function verifyPassword(string memory aadhar, bytes32 passwordHash) external view returns (bool) {
        return tourists[aadhar].passwordHash == passwordHash;
    }
}
