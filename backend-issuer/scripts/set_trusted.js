// run with: node scripts/set_trusted.js <registryAddress> <ownerPrivateKey> <issuerAddress>
const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  const [registryAddress, ownerPk, issuerAddress] = process.argv.slice(2);
  if (!registryAddress || !ownerPk || !issuerAddress) {
    console.error("usage: node set_trusted.js <registry> <ownerPk> <issuerAddress>");
    process.exit(1);
  }
  const provider = new ethers.providers.JsonRpcProvider(process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/");
  const owner = new ethers.Wallet(ownerPk, provider);
  const abi = ["function setTrustedIssuer(address issuer, bool trusted) external"];
  const registry = new ethers.Contract(registryAddress, abi, owner);
  const tx = await registry.setTrustedIssuer(issuerAddress, true);
  console.log("txHash:", tx.hash);
  await tx.wait();
  console.log("trusted set");
}
main();
