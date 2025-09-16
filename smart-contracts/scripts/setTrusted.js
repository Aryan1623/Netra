async function main() {
  const [deployer] = await ethers.getSigners();
  const registry = await ethers.getContractAt("TouristIDRegistry", "0x84ab38139f8D8B7F6e1e030C874EE661A0EF16D6");

  const tx = await registry.setTrustedIssuer(deployer.address, true);
  await tx.wait();
  console.log("✅ Trusted issuer added:", deployer.address);
}
main();
