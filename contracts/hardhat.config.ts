import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://127.0.0.1:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0xbb8e8933f7765b4b55dcba953dcd30ea91afc5952a7371ff7fa2e9845ed2ccc8',
        '0x37cfc99f1fe24976df51e2e71fab10efec71aacaf18b881ac3ad9ef748888260',
        '0xcd5eab8cdd78d247a5de62a30914934d46c4cbb3ecccc09297629bae58000d52'
      ]
    },
  },
};

export default config;
