import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import fs from "fs";
import hre, { ethers } from "hardhat";

export const keypress = async (
  text: string = "Press any key to continue..."
) => {
  process.stdout.write(text);
  process.stdin.setRawMode(true);
  return new Promise((resolve) =>
    process.stdin.once("data", (data) => {
      const byteArray = [...data];
      if (byteArray.length > 0 && byteArray[0] === 3) {
        console.log("\n^C");
        process.exit(1);
      }
      process.stdin.setRawMode(false);
      process.stdout.write("\r" + " ".repeat(text.length) + "\r");
      resolve(() => {});
    })
  );
};

export function writeContractData(dir: string, filename: string, value: any) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let fileContent = Buffer.from("{}");
  try {
    fileContent = fs.readFileSync(`${dir}/${filename}`);
  } catch {}

  let details = JSON.parse(fileContent.toString());
  details = { ...details, ...value };
  fs.writeFileSync(`${dir}/${filename}`, JSON.stringify(details));
}

export async function contractDeployment(
  contractDeployer: SignerWithAddress,
  contractName: string,
  title: string,
  constructorArguments: any[] = []
): Promise<Contract> {
  console.log(`${title} Contract`);
  process.stdout.write("Deploying...     " + "\r");
  const contractFactory = await ethers.getContractFactory(contractName);
  const contract = await contractFactory
    .connect(contractDeployer)
    .deploy(...constructorArguments);
  console.log("Tx hash:", contract.deployTransaction.hash);
  process.stdout.write("Deploying..." + "\r");
  await contract.deployed();
  console.log(`${title} Contract address`, contract.address);
  console.log("");

  return contract;
}

export async function etherscanVerification(
  address: string,
  constructorArguments: any[] = [],
  contract: string | null = null
) {
  console.log("Verifing contract on etherscan");
  try {
    await hre.run("verify:verify", {
      address,
      constructorArguments,
      contract,
    });

    console.log("Verification successful");
  } catch (e) {
    console.log("Manual verification required");
  }
  console.log("");
}
