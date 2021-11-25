require('dotenv').config();

var HDWalletProvider = require("truffle-hdwallet-provider");
const MNEMONIC = process.env["MNEMONIC"];
const ROPSTEN_PROJECT_ID = process.env["ROPSTEN_PROJECT_ID"];

module.exports = {
  networks: {
   dev: {
     host: "127.0.0.1",
     port: 7545,
     network_id: "5777",
   },
   infura_ropsten: {
      provider: function() {
        return new HDWalletProvider(MNEMONIC, "https://ropsten.infura.io/v3/" + ROPSTEN_PROJECT_ID,0,5)
      },
      network_id: 3,
    },
  },
  compilers: {
    solc: {
      version: "^0.6.2",
      settings: {
        optimizer: {
          "enabled": true,
          "runs": 1000
        }
      }
    }
   },
   plugins: [
      'truffle-contract-size'
    ]
};
