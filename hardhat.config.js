require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();
const privateKeys = process.env.SEPOLIA_DAPPU_DEV_PRIVATE_KEY || ''

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.18', /**video tutorial is set at 0.8.9 */
  networks: {
    localhost: {},
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_SEPOLIA_API_KEY}`,
      accounts: privateKeys.split(','),
    }
  },

};
