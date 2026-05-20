import { ethers } from "ethers";
import contractArtifact from "../../../blockchain/artifacts/contracts/Certificate.sol/Certificate.json";

// In a real application, you would store this address in .env
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";


const abi = contractArtifact.abi;

export async function connectWallet() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      console.log("Connected to wallet:", address);
      return { provider, signer, address };
    } catch (error) {
      console.error("Wallet connection failed:", error);
      throw error;
    }
  } else {
    alert("Please install MetaMask to use blockchain features!");
    throw new Error("MetaMask not installed");
  }
}

export async function getContract() {
  try {
    const { signer } = await connectWallet();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    return contract;
  } catch (error) {
    console.error("Failed to get contract:", error);
    throw error;
  }
}

export async function getReadOnlyContract() {
  // If we just need to verify without asking user to connect wallet/sign, we can use a default provider
  // But for MetaMask injected browser, window.ethereum is available
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);
    return contract;
  } else {
    // Fallback to a public provider or localhost if needed
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const contract = new ethers.Contract(contractAddress, abi, provider);
    return contract;
  }
}

export async function issueCertificateOnBlockchain(hash) {
  try {
    const contract = await getContract();
    // Assuming the hash is passed as a string representing bytes32, e.g., "0x123..."
    // Ensure the hash is formatted as bytes32
    const formattedHash = ethers.zeroPadValue(ethers.getBytes(hash), 32);
    
    const tx = await contract.issueCertificate(formattedHash);
    console.log("Transaction sent to blockchain, waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("Certificate issued on blockchain:", receipt.hash);
    return receipt.hash;
  } catch (error) {
    console.error("Error issuing certificate on blockchain:", error);
    throw error;
  }
}

export async function verifyCertificateOnBlockchain(hash) {
  try {
    const contract = await getReadOnlyContract();
    const formattedHash = ethers.zeroPadValue(ethers.getBytes(hash), 32);
    const isValid = await contract.verifyCertificate(formattedHash);
    console.log("Blockchain verification result for hash", hash, ":", isValid);
    return isValid;
  } catch (error) {
    console.error("Error verifying certificate on blockchain:", error);
    throw error;
  }
}
