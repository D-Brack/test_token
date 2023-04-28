require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18", /**video tutorial is set at 0.8.9 */
  networks: {
    localhost: {}
  },
};
