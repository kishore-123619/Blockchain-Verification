// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Certificate {
    address public owner;
    mapping(bytes32 => bool) private certificateHashes;

    event CertificateIssued(bytes32 indexed certificateHash);
    event CertificateRevoked(bytes32 indexed certificateHash);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    function issueCertificate(bytes32 certificateHash) public onlyOwner {
        require(!certificateHashes[certificateHash], "Certificate already issued.");
        certificateHashes[certificateHash] = true;
        emit CertificateIssued(certificateHash);
    }

    function verifyCertificate(bytes32 certificateHash) public view returns (bool) {
        return certificateHashes[certificateHash];
    }

    function revokeCertificate(bytes32 certificateHash) public onlyOwner {
        require(certificateHashes[certificateHash], "Certificate not found.");
        certificateHashes[certificateHash] = false;
        emit CertificateRevoked(certificateHash);
    }
}
