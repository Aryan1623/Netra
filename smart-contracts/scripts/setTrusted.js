async function main() {
  const [deployer] = await ethers.getSigners();
  const registry = await ethers.getContractAt("TouristIDRegistry", "0xc871E36AF38E3157EA0dA4c20D2fcF430DEC40A5");

  const tx = await registry.setTrustedIssuer(deployer.address, true);
  await tx.wait();
  console.log("✅ Trusted issuer added:", deployer.address);
}
main();
