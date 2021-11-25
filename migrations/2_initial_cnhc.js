const CNHCToken = artifacts.require("CNHCToken");

module.exports = function (deployer) {
  deployer.deploy(CNHCToken, 1000000000000, 6);
};
