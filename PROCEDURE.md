# Project Roadmap & Operational Procedure
## Blockchain-Based Certificate Verification System

This document provides a comprehensive step-by-step guide on how the system operates, the technologies involved, and the logic behind the core features.

---

### 1. Technology Stack Overview
*   **Frontend:** React (Vite), Tailwind CSS/Vanilla CSS, Lucide Icons.
*   **Backend:** Node.js, Express.js (REST API).
*   **Database:** MongoDB (using Mongoose ODM).
*   **Blockchain:** Solidity (Smart Contracts), Hardhat (Development Environment), Ethers.js (Blockchain Interaction).
*   **Authentication:** JWT (JSON Web Tokens), Passport.js (Google OAuth 2.0).
*   **Storage:** Local storage for student photos and CSVs; Blockchain for certificate hashes.
*   **Communication:** Nodemailer (SMTP for OTP and Registration emails).

---

### 2. Step-by-Step Registration Process (Student)

1.  **Access Portal:** Navigate to the Student Registration page.
2.  **Input Data:** Enter Username, Email, Password, Full Name, Roll Number, Department, and Graduation Year.
3.  **Uniqueness Logic:**
    *   The system checks if the **Email** already exists in the database.
    *   The system checks if the **Roll Number** already exists.
    *   *Note: Names do not have to be unique; multiple students can have the same name.*
4.  **Data Persistence:** Once validated, the password is encrypted using **bcrypt** and the user record is created in MongoDB.
5.  **Automatic Email Notification:**
    *   An email is sent to the registered address.
    *   The email contains the student's **Email ID** and **Initial Password**.
    *   A **Verification Link** is provided to activate the account.
6.  **Verification:** The student clicks the link in their email, which updates their status in the database to `isEmailVerified: true`.

---

### 3. Certificate Issuance Process (Admin)

1.  **Login:** Admin logs into the Admin Panel.
2.  **Fill Form:** Admin enters student details (Name, Roll Number, Percentage, Division).
3.  **Hash Generation:**
    *   The system takes the certificate details and creates a unique **SHA-256 Hash**.
    *   This hash acts as a digital fingerprint of the certificate.
4.  **Blockchain Registration:**
    *   The Admin triggers the "Issue" action.
    *   The **Smart Contract** (deployed on a blockchain like Sepolia or local Hardhat) is called via MetaMask.
    *   The certificate hash is stored permanently on the blockchain.
5.  **Data Sync:** The Transaction Hash (TxHash) from the blockchain is saved back to the MongoDB record for future reference.

---

### 4. How to Verify a Certificate (Verifier)

The verification process does **not** require a login, making it accessible to third-party employers.

1.  **Enter Hash:** The verifier pastes the Certificate Hash into the Verifier Portal.
2.  **Blockchain Check:**
    *   The system queries the Smart Contract on the blockchain using the provided hash.
    *   The blockchain confirms if this specific hash was ever "Issued" by the authorized university address.
3.  **Database Lookup:**
    *   Simultaneously, the system fetches the student details associated with that hash from MongoDB.
4.  **Result Display:**
    *   **Success:** If the hash exists on the blockchain, the system displays "Verified" along with the student's name, roll number, and degree details.
    *   **Failure:** If the hash is modified by even one character, the blockchain will return "Not Found," indicating the certificate is fraudulent.

---

### 5. Security Logics Implemented

*   **Immutability:** Once a certificate hash is on the blockchain, it cannot be edited or deleted by anyone, including the Admin.
*   **2FA (Two-Factor Authentication):** Students can enable Google Authenticator (TOTP) for an extra layer of security.
*   **JWT Protection:** All sensitive API routes (like issuing certificates) are protected by JWT middleware. Only authorized Admins can access them.
*   **Secure Password Hashing:** Passwords are never stored in plain text; they are salted and hashed using `bcrypt`.

---

### 6. Development Workflow (Roadmap)
1.  **Environment Setup:** Configure `.env` files for both Backend (DB URLs, SMTP, JWT) and Frontend (API URLs).
2.  **Smart Contract Deployment:** Use Hardhat to deploy `Certificate.sol` and save the contract address.
3.  **Backend Services:** Build RESTful routes for Auth, Student Management, and Certificate storage.
4.  **Frontend Integration:** Connect React components to the Backend API and Blockchain provider (MetaMask).
---

### 7. Execution Commands (How to Run)

To run the project locally, follow these steps in order. Open a separate terminal for each service.

#### **Step 1: Blockchain (Smart Contract)**
Navigate to the blockchain folder to compile and deploy the contract.
```bash
cd blockchain
# Compile the smart contract
npx hardhat compile
npx hardhat node
# Deploy to a local network (or testnet)
npx hardhat run scripts/deploy.js --network localhost
```
*Note: Ensure you update the contract address in the frontend `.env` after deployment.*

#### **Step 2: Backend (Server)**
Navigate to the backend folder and start the server.
```bash
cd backend
# Install dependencies (first time only)
npm install
# Start in development mode (with nodemon)
npm run dev
# OR start normally
npm start
```
*Verification: You should see "MongoDB Connected" and "Server running on port 5000".*

#### **Step 3: Frontend (React Application)**
Navigate to the frontend folder and start the development server.
```bash
cd frontend
# Install dependencies (first time only)
npm install
# Start the Vite development server
npm run dev
```
*Access: Open your browser and go to `http://localhost:5173` (or the port shown in your terminal).*

---

### 8. Quick Summary of Commands

| Service | Command | Directory |
| :--- | :--- | :--- |
| **Backend** | `npm run dev` | `/backend` |
| **Frontend** | `npm run dev` | `/frontend` |
| **Blockchain** | `npx hardhat node` | `/blockchain` |
| **Deploy** | `npx hardhat run scripts/deploy.js` | `/blockchain` |






This warning appears because Node.js v23 is a very new "Current" version, and Hardhat is officially tested and optimized for
  Node.js LTS (Long-Term Support) versions like v20 or v22.

  What you should do:

  1. If the deployment still finishes:
  If you see a "Contract deployed to: 0x..." message after the warning, you can ignore it for now. It just means Hardhat hasn't
  officially "certified" v23 yet, but it usually works fine for local development.

  2. If the deployment fails:
  You should switch to a stable Node.js version. Since you are on Windows, I recommend using nvm-windows to switch versions
  easily:
   * Open your terminal and run: nvm install 20.12.2
   * Then run: nvm use 20.12.2

  Important Step for the Local Network:
  If you are using --network localhost, you must have the Hardhat node running in a separate terminal before you run the deploy
  script.

  Terminal 1 (Start the Blockchain):

   1 cd blockchain
   2 npx hardhat node

  Terminal 2 (Deploy the Contract):

   1 cd blockchain
   2 npx hardhat run scripts/deploy.js --network localhost




   same name to avoid   node dropUsernameIndex.js