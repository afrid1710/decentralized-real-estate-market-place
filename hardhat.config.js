require("@nomiclabs/hardhat-waffle");

module.exports = {
    solidity: {
        version: "0.8.1", // Match the version used in your contracts
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
        },
    },
};
