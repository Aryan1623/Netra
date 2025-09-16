async function main() {
  const [deployer] = await ethers.getSigners();
  const registry = await ethers.getContractAt("TouristIDRegistry", "0xd1A614B3A7290816B8d3150A38b8CF76DA524fa7");

  const tx = await registry.setTrustedIssuer(deployer.address, true);
  await tx.wait();
  console.log("✅ Trusted issuer added:", deployer.address);
}
main();
