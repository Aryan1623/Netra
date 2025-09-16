require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const cors = require("cors")
const app = express();
app.use(cors())
app.use(bodyParser.json());

// Load env vars
const AMOY_RPC = process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/";
const ISSUER_PRIVATE_KEY = process.env.ISSUER_PRIVATE_KEY;
const REGISTRY_ADDRESS = process.env.REGISTRY_CONTRACT_ADDRESS;

if (!ISSUER_PRIVATE_KEY || !REGISTRY_ADDRESS) {
  console.error("❌ Set ISSUER_PRIVATE_KEY and REGISTRY_CONTRACT_ADDRESS in .env");
  process.exit(1);
}

// Load ABI from Hardhat artifacts
const artifactPath = path.join(__dirname, "../smart-contracts/artifacts/contracts/TouristIDRegistry.sol/TouristIDRegistry.json");
if (!fs.existsSync(artifactPath)) {
  console.error("❌ ABI not found. Did you run `npx hardhat compile`?");
  process.exit(1);
}
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
const REGISTRY_ABI = artifact.abi;

// provider and signer
const provider = new ethers.JsonRpcProvider(AMOY_RPC);
const issuerWallet = new ethers.Wallet(ISSUER_PRIVATE_KEY, provider);
const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, issuerWallet);

// helper: sha256 digest -> bytes32
function sha256Bytes32(input) {
  const hash = crypto.createHash("sha256").update(input).digest("hex");
  return "0x" + hash;
}

// sign VC with issuer's key
async function signVC(vcJson) {
  const message = JSON.stringify(vcJson);
  return issuerWallet.signMessage(message);
}

// ---- Routes ----

// Issue VC
app.post("/issue-id", async (req, res) => {
  try {
    const body = req.body || {};
    const touristName = body.touristName || "John Doe";
    const issuingAuthority = body.issuingAuthority || "Ministry of Tourism";
    const documentHash = body.documentHash || sha256Bytes32(body.document || "passport-sample");
    const validFrom = body.validFrom || new Date().toISOString();
    const validUntil = body.validUntil || new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
    const emergencyContact = body.emergencyContact || "+0000000000";
    const issuedAt = new Date().toISOString();

    const vc = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential", "DigitalTouristID"],
      touristName,
      issuingAuthority,
      documentHash,
      validFrom,
      validUntil,
      emergencyContact,
      issuedAt,
    };

    const signature = await signVC(vc);
    vc.signature = signature;

    const anchorHash = sha256Bytes32(JSON.stringify(vc));

    // ⚡ Call real contract ABI function
    const tx = await registry.anchorCredential(anchorHash, { gasLimit: 200000 });
    const receipt = await tx.wait();

    res.json({ vc, anchorHash, txHash: receipt.transactionHash, contract: REGISTRY_ADDRESS });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Verify VC
app.post("/verify-id", async (req, res) => {
  try {
    const vc = req.body.vc;
    if (!vc) return res.status(400).json({ ok: false, reason: "vc missing" });

    const vcCopy = { ...vc };
    const signature = vcCopy.signature;
    delete vcCopy.signature;
    const signedMsg = JSON.stringify(vcCopy);

    const anchorHash = sha256Bytes32(JSON.stringify(vc));
    const anchoredBy = await registry.credentialAnchor(anchorHash);

    const recovered = ethers.verifyMessage(signedMsg, signature);
    const ok = recovered.toLowerCase() === anchoredBy.toLowerCase() && anchoredBy !== ethers.ZeroAddress;

    res.json({ ok, anchoredBy, recovered, anchorHash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Issuer service running on http://localhost:${PORT}`);
});
