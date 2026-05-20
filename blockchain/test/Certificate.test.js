import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("Certificate", function () {
  let certificate;
  let owner;
  let addr1;

  beforeEach(async function () {
    const Certificate = await ethers.getContractFactory("Certificate");
    [owner, addr1] = await ethers.getSigners();
    certificate = await Certificate.deploy();
    await certificate.waitForDeployment();
  });

  it("Should deploy with the correct owner", async function () {
    expect(await certificate.owner()).to.equal(owner.address);
  });

  it("Should allow the owner to issue a certificate", async function () {
    const certificateHash = ethers.keccak256(ethers.toUtf8Bytes("test certificate"));
    await expect(certificate.issueCertificate(certificateHash))
      .to.emit(certificate, "CertificateIssued")
      .withArgs(certificateHash);
    expect(await certificate.verifyCertificate(certificateHash)).to.be.true;
  });

  it("Should not allow non-owners to issue a certificate", async function () {
    const certificateHash = ethers.keccak256(ethers.toUtf8Bytes("test certificate"));
    await expect(certificate.connect(addr1).issueCertificate(certificateHash)).to.be.revertedWith("Only the owner can perform this action.");
  });

  it("Should allow the owner to revoke a certificate", async function () {
    const certificateHash = ethers.keccak256(ethers.toUtf8Bytes("test certificate"));
    await certificate.issueCertificate(certificateHash);
    await expect(certificate.revokeCertificate(certificateHash))
      .to.emit(certificate, "CertificateRevoked")
      .withArgs(certificateHash);
    expect(await certificate.verifyCertificate(certificateHash)).to.be.false;
  });

  it("Should not allow non-owners to revoke a certificate", async function () {
    const certificateHash = ethers.keccak256(ethers.toUtf8Bytes("test certificate"));
    await certificate.issueCertificate(certificateHash);
    await expect(certificate.connect(addr1).revokeCertificate(certificateHash)).to.be.revertedWith("Only the owner can perform this action.");
  });

  it("Should return true for a valid certificate and false for an invalid one", async function () {
    const validCertificateHash = ethers.keccak256(ethers.toUtf8Bytes("valid certificate"));
    const invalidCertificateHash = ethers.keccak256(ethers.toUtf8Bytes("invalid certificate"));
    await certificate.issueCertificate(validCertificateHash);
    expect(await certificate.verifyCertificate(validCertificateHash)).to.be.true;
    expect(await certificate.verifyCertificate(invalidCertificateHash)).to.be.false;
  });
});
