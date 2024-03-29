import React from "react";
import { useEffect, useState } from "react";
import "./App.css";

import { BigNumber, utils, providers, Contract } from "ethers";
import { useCookies } from "react-cookie";
import CountUp from "react-countup";
import { evaluate } from "mathjs";
import { Toast } from "bootstrap";
import ReactTooltip from "react-tooltip";
import { toBn, fromBn } from "evm-bn";
import moment from "moment";

function App() {
  // constants
  const zeroBN = BigNumber.from("0");
  const decimal10 = utils.parseUnits("10000000000", 0);
  const decimal18 = utils.parseEther("1");
  const decimal1Million = utils.parseEther("1000000");
  const decimal1Billion = utils.parseEther("1000000000");
  const KING_LEVEL = 10;
  const MIN_DEBT = utils.parseUnits("200000000000000000000", 0);
  const MCR = utils.parseUnits("1100000000000000000", 0);
  const CCR = utils.parseUnits("1300000000000000000", 0);
  const ACCEPTED_MIN_ICR = utils.parseUnits("1350000000000000000", 0);
  const REASONABLE_SAFE_ICR = utils.parseUnits("2200000000000000000", 0);
  const ZERO_ADDR = "0x0000000000000000000000000000000000000000";
  const FRONTEND_TAG = ZERO_ADDR;
  const SP_WITHDRAW_LOCK = 1800;
  const SP_WITHDRAW_WINDOW = 3600;
  const SP_WITHDRAW_INTERVAL = 43200;
  const STAKING_PREMIUM = utils.parseEther("1024");
  const SP_SATO_REWARD_CAP = utils.parseEther("32000000");
  const SP_SATO_REWARD_PER_SECOND = utils.parseUnits("999998681227695000", 0);

  const SATO_SYMBOL = "SATO";
  const SATO_IMG_URL = "https://www.satofi.app/SATO.png";
  const btUSD_SYMBOL = "btUSD";
  const btUSD_IMG_URL = "https://www.satofi.app/btUSD.png";
  const TOKEN_DECIMAL = 18;
  const BNB_ORACLE_BASE_TOKEN = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
  const BNB_ORACLE_QUOTE_TOKEN = "0x0000000000000000000000000000000000000348";

  /////////////////////////////////////////////////
  // Smart Contracts addresses
  /////////////////////////////////////////////////
  const testnet = false;
  const contractsAddressesTestnet = {
    collateralTokenAddr: "0x5E1Be8984a9E382f0e432bec93d8d245532Bf493",
    activePoolAddr: "0x7084E5aB49b79c6cEA2CA9e30DB065CC1488aA8c",
    borrowerOperationsAddr: "0x5dC5EA2066b6881B85ED07f26295b3f1495eaD52",
    btUSDAddr: "0x6fBcd75977E15DA60fb3746cBa9f96097276734B",
    collSurplusPoolAddr: "0x8Cf3Ff050b6894D61B7C8A9440d0FA3e5E61CD9D",
    defaultPoolAddr: "0x56e34FC7B3B8639AE6F8E5779450792677B79d6B",
    priceFeedAddr: "0x28D2137b60ebFd44a7CB9297345197bfc0C1e898",
    stabilityPoolAddr: "0x0Aa3e0b1c3133EDDf5E4CB49F8FBef02D0dfD0bb",
    troveManagerAddr: "0x57b447e55E965Bba4786f92a7c49C7524BDA6aEB",
    satoTokenAddr: "0xEBdC7a41588D2e9dCE3F1C1212dDC77Db8d7f236",
    satoStakingAddr: "0x3E74eb17f342F39F7f730f2557102E97b3662dae",
    satoCommunityIssuanceAddr: "0x435572Fef1fE1423e02e2d68dcEc03F7eaeFfbEA",
    satoLockupFactoryAddr: "0x220454641035B7cf1C4BDCeA47308b1D94DA6b53",
    uniPoolAddr: "0x6E741cEfDAd573919714A890f542b77A4c9A5057",
    lpTokenAddr: "0x5E1Be8984a9E382f0e432bec93d8d245532Bf493",
  };
  const contractsAddressesMainnet = {
    collateralTokenAddr: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
    activePoolAddr: "0x3B0750926f04cB9b8C01dfc02dc6E29524d00e8c",
    borrowerOperationsAddr: "0x5E1Be8984a9E382f0e432bec93d8d245532Bf493",
    btUSDAddr: "0xCEa3f851A89F3071b2570a27392f069f4097a8dC",
    collSurplusPoolAddr: "0x9068298cB437E6fbDfb35c1F6e3561e68C01Fc87",
    defaultPoolAddr: "0x75c72883A6Dea319E0Cf4b553d2bFf00E1c06a96",
    priceFeedAddr: "0x14eBf8b6bDc973DedC4716644a7ecB56717497d5",
    stabilityPoolAddr: "0x82fDfaDC2644cB9c8103e2ED9280338F1B55AA1C",
    troveManagerAddr: "0x3cd34afeba07c02443BECBb2840506F4230f84cB",
    satoTokenAddr: "0x708bAac4B235d3F62bD18e58c0594b8B20b2ED5B",
    satoStakingAddr: "0x28c0e5160AB7B821A98745A3236aD2414F5dC041",
    satoCommunityIssuanceAddr: "0xb64EE0d54EA724753db319771791474C2EED6575",
    satoLockupFactoryAddr: "0x9DeFF442F3837797C7F4783393A9eFe3d5e4FDd9",
    uniPoolAddr: "0x24691F205f3E15915DBecBf97DD6593A0B9528c5",
    lpTokenAddr: "0x677fce0d985e870785ce63e07ae49d2d27358b78",
    chainlinkFeedAddr: "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf",
    bnbOracleRegistryAddr: "0x55328A2dF78C5E379a3FeE693F47E6d4279C2193",
  };
  const contractsAddresses = testnet
    ? contractsAddressesTestnet
    : contractsAddressesMainnet;

  /////////////////////////////////////////////////
  // Smart Contracts ABIs
  /////////////////////////////////////////////////
  const borrowerOperations_abi =
    '[{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_activePoolAddress","type":"address"}],"name":"ActivePoolAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_borrower","type":"address"},{"indexed":false,"internalType":"uint256","name":"_debtFee","type":"uint256"}],"name":"BTUSDBorrowingFeePaid","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_debtTokenAddress","type":"address"}],"name":"BTUSDTokenAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_collSurplusPoolAddress","type":"address"}],"name":"CollSurplusPoolAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_defaultPoolAddress","type":"address"}],"name":"DefaultPoolAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newPriceFeedAddress","type":"address"}],"name":"PriceFeedAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_satoStakingAddress","type":"address"}],"name":"SATOStakingAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_stabilityPoolAddress","type":"address"}],"name":"StabilityPoolAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_borrower","type":"address"},{"indexed":false,"internalType":"uint256","name":"arrayIndex","type":"uint256"}],"name":"TroveCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newTroveManagerAddress","type":"address"}],"name":"TroveManagerAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_borrower","type":"address"},{"indexed":false,"internalType":"uint256","name":"_debt","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_coll","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"stake","type":"uint256"},{"indexed":false,"internalType":"uint8","name":"operation","type":"uint8"}],"name":"TroveUpdated","type":"event"},{"inputs":[{"internalType":"uint256","name":"_collAmount","type":"uint256"}],"name":"addColl","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_maxFee","type":"uint256"},{"internalType":"uint256","name":"_collChange","type":"uint256"},{"internalType":"bool","name":"isCollIncrease","type":"bool"},{"internalType":"uint256","name":"_debtChange","type":"uint256"},{"internalType":"bool","name":"isDebtIncrease","type":"bool"}],"name":"adjustTrove","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimCollateral","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"closeTrove","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"},{"internalType":"uint256","name":"_collAmount","type":"uint256"}],"name":"moveCollGainToTrove","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_maxFee","type":"uint256"},{"internalType":"uint256","name":"_debtAmount","type":"uint256"},{"internalType":"uint256","name":"_collAmount","type":"uint256"}],"name":"openTrove","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"repayDebt","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_troveManagerAddress","type":"address"},{"internalType":"address","name":"_activePoolAddress","type":"address"},{"internalType":"address","name":"_defaultPoolAddress","type":"address"},{"internalType":"address","name":"_stabilityPoolAddress","type":"address"},{"internalType":"address","name":"_collSurplusPoolAddress","type":"address"},{"internalType":"address","name":"_priceFeedAddress","type":"address"},{"internalType":"address","name":"_debtTokenAddress","type":"address"},{"internalType":"address","name":"_satoStakingAddress","type":"address"},{"internalType":"address","name":"_collAddress","type":"address"}],"name":"setAddresses","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdrawColl","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_maxFee","type":"uint256"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdrawDebt","outputs":[],"stateMutability":"nonpayable","type":"function"}]';
  const priceFeed_abi =
    '[{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_lastGoodPrice","type":"uint256"}],"name":"LastGoodPriceUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"enum PriceFeed.Status","name":"newStatus","type":"uint8"}],"name":"PriceFeedStatusChanged","type":"event"},{"inputs":[],"name":"BTCUSD_BNO_BASE","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"BTCUSD_BNO_QUOTE","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DECIMAL_PRECISION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_PRICE_DEVIATION_FROM_PREVIOUS_ROUND","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_PRICE_DIFFERENCE_BETWEEN_ORACLES","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"NAME","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TARGET_DIGITS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TIMEOUT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"backupFeed","outputs":[{"internalType":"contract IBinanceOracle","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fetchPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGoodPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"priceAggregator","outputs":[{"internalType":"contract AggregatorV3Interface","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_priceAggregatorAddress","type":"address"},{"internalType":"address","name":"_bnOracleAddress","type":"address"},{"internalType":"address","name":"_bnOracleBTCAddress","type":"address"},{"internalType":"address","name":"_bnOracleUSDAddress","type":"address"}],"name":"setAddresses","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"status","outputs":[{"internalType":"enum PriceFeed.Status","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}]';
  const troveManager_abi =
    '[{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_activePoolAddress","type":"address"}],"name":"ActivePoolAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newDebtTokenAddress","type":"address"}],"name":"BTUSDTokenAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_baseRate","type":"uint256"}],"name":"BaseRateUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newBorrowerOperationsAddress","type":"address"}],"name":"BorrowerOperationsAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_collSurplusPoolAddress","type":"address"}],"name":"CollSurplusPoolAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_defaultPoolAddress","type":"address"}],"name":"DefaultPoolAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_L_ETH","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_L_Debt","type":"uint256"}],"name":"LTermsUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_lastFeeOpTime","type":"uint256"}],"name":"LastFeeOpTimeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_liquidatedDebt","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_liquidatedColl","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_collGasCompensation","type":"uint256"}],"name":"Liquidation","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newPriceFeedAddress","type":"address"}],"name":"PriceFeedAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_R_Coll","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_R_Debt","type":"uint256"}],"name":"RTermsUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_attemptedDebtAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_actualDebtAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_ETHSent","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_ETHFee","type":"uint256"}],"name":"Redemption","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_satoStakingAddress","type":"address"}],"name":"SATOStakingAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_satoTokenAddress","type":"address"}],"name":"SATOTokenAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_borrower","type":"address"},{"indexed":true,"internalType":"address","name":"_scavenger","type":"address"},{"indexed":false,"internalType":"uint256","name":"_collSurplus","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_collToScavenger","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_debt","type":"uint256"}],"name":"ScavengeBelowMinimum","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_borrower","type":"address"},{"indexed":true,"internalType":"address","name":"_scavenger","type":"address"},{"indexed":false,"internalType":"uint256","name":"_freeDebt","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_collSurplus","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_reward","type":"uint256"}],"name":"ScavengeFreeDebt","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_stabilityPoolAddress","type":"address"}],"name":"StabilityPoolAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_totalStakesSnapshot","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_totalCollateralSnapshot","type":"uint256"}],"name":"SystemSnapshotsUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_newTotalStakes","type":"uint256"}],"name":"TotalStakesUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_borrower","type":"address"},{"indexed":false,"internalType":"uint256","name":"_newIndex","type":"uint256"}],"name":"TroveIndexUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_borrower","type":"address"},{"indexed":false,"internalType":"uint256","name":"_debt","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_coll","type":"uint256"},{"indexed":false,"internalType":"enum TroveManager.TroveManagerOperation","name":"_operation","type":"uint8"}],"name":"TroveLiquidated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_borrower","type":"address"},{"indexed":false,"internalType":"uint256","name":"_R_Coll","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_R_Debt","type":"uint256"}],"name":"TroveRedemptionSnapshotsUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_L_ETH","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_L_Debt","type":"uint256"}],"name":"TroveSnapshotsUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_borrower","type":"address"},{"indexed":false,"internalType":"uint256","name":"_debt","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_coll","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_stake","type":"uint256"},{"indexed":false,"internalType":"enum TroveManager.TroveManagerOperation","name":"_operation","type":"uint8"}],"name":"TroveUpdated","type":"event"},{"inputs":[],"name":"BETA","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"BOOTSTRAP_PERIOD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"BORROWING_FEE_FLOOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"BORROWING_FEE_FLOOR_PREMIUM","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"CCR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DECIMAL_PRECISION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"LIQBATCH_SIZE_LIMIT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"L_ETH","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"L_LUSDDebt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_BORROWING_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MCR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MINUTE_DECAY_FACTOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MIN_NET_DEBT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"NAME","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERCENT_DIVISOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PREMIUM_LIQ_RATIO","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"REDEMPTION_FEE_FLOOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"REDEMPTION_FEE_FLOOR_PREMIUM","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"R_Coll","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"R_Debt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SCAVENGER_REWARD_DEBT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SECONDS_IN_ONE_MINUTE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"TroveOwners","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"Troves","outputs":[{"internalType":"uint256","name":"debt","type":"uint256"},{"internalType":"uint256","name":"coll","type":"uint256"},{"internalType":"uint256","name":"stake","type":"uint256"},{"internalType":"enum TroveManager.Status","name":"status","type":"uint8"},{"internalType":"uint128","name":"arrayIndex","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_100pct","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"activePool","outputs":[{"internalType":"contract IActivePool","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"addTroveOwnerToArray","outputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"applyPendingRewards","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"baseRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"_troveArray","type":"address[]"}],"name":"batchLiquidateTroves","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"borrowerOperationsAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_price","type":"uint256"}],"name":"checkRecoveryMode","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"closeTrove","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"collateral","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"debtToken","outputs":[{"internalType":"contract IBTUSDToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decayBaseRateFromBorrowing","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"},{"internalType":"uint256","name":"_collDecrease","type":"uint256"}],"name":"decreaseTroveColl","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"},{"internalType":"uint256","name":"_debtDecrease","type":"uint256"}],"name":"decreaseTroveDebt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"defaultPool","outputs":[{"internalType":"contract IDefaultPool","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"},{"internalType":"uint256","name":"_debt","type":"uint256"}],"name":"getBorrowingFeeForBorrower","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"},{"internalType":"uint256","name":"_debt","type":"uint256"}],"name":"getBorrowingFeeWithDecayForBorrower","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"getBorrowingRateForBorrower","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"getBorrowingRateWithDecayForBorrower","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"},{"internalType":"uint256","name":"_price","type":"uint256"}],"name":"getCurrentICR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"getEntireDebtAndColl","outputs":[{"internalType":"uint256","name":"debt","type":"uint256"},{"internalType":"uint256","name":"coll","type":"uint256"},{"internalType":"uint256","name":"pendingDebtReward","type":"uint256"},{"internalType":"uint256","name":"pendingETHReward","type":"uint256"},{"internalType":"uint256","name":"pendingRedemptionDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRedemptionColl","type":"uint256"},{"internalType":"uint256","name":"pendingFreeDebt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getEntireSystemColl","outputs":[{"internalType":"uint256","name":"entireSystemColl","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getEntireSystemDebt","outputs":[{"internalType":"uint256","name":"entireSystemDebt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"getPendingCollRedemption","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"getPendingDebtRedemption","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"getPendingETHReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"getPendingLUSDDebtReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_redeemer","type":"address"},{"internalType":"uint256","name":"_collDrawn","type":"uint256"}],"name":"getRedemptionFeeWithDecayForRedeemer","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_redeemer","type":"address"}],"name":"getRedemptionRateForRedeemer","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_redeemer","type":"address"}],"name":"getRedemptionRateWithDecayForRedeemer","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_price","type":"uint256"}],"name":"getTCR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"getTroveColl","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"getTroveDebt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"getTroveFromTroveOwnersArray","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTroveOwnersCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"getTroveStake","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"getTroveStatus","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_collDrawn","type":"uint256"},{"internalType":"uint256","name":"_price","type":"uint256"},{"internalType":"uint256","name":"_debtTotalSupply","type":"uint256"}],"name":"getUpdatedRedemptionBaseRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"hasPendingRedemptionShare","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"hasPendingRewards","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"},{"internalType":"uint256","name":"_collIncrease","type":"uint256"}],"name":"increaseTroveColl","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"},{"internalType":"uint256","name":"_debtIncrease","type":"uint256"}],"name":"increaseTroveDebt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastCollError_RedemptionShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastDebtError_RedemptionShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastETHError_Redistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastFeeOperationTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastLUSDDebtError_Redistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"liquidate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"priceFeed","outputs":[{"internalType":"contract IPriceFeed","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_debtAmount","type":"uint256"},{"internalType":"uint256","name":"_maxFeePercentage","type":"uint256"}],"name":"redeemCollateral","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"redemptionSnapshots","outputs":[{"internalType":"uint256","name":"rColl","type":"uint256"},{"internalType":"uint256","name":"rDebt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"removeStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"rewardSnapshots","outputs":[{"internalType":"uint256","name":"ETH","type":"uint256"},{"internalType":"uint256","name":"Debt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"satoStaking","outputs":[{"internalType":"contract ISATOStaking","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"satoToken","outputs":[{"internalType":"contract ISATOToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"scavengeTrove","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_borrowerOperationsAddress","type":"address"},{"internalType":"address","name":"_activePoolAddress","type":"address"},{"internalType":"address","name":"_defaultPoolAddress","type":"address"},{"internalType":"address","name":"_stabilityPoolAddress","type":"address"},{"internalType":"address","name":"_collSurplusPoolAddress","type":"address"},{"internalType":"address","name":"_priceFeedAddress","type":"address"},{"internalType":"address","name":"_debtTokenAddress","type":"address"},{"internalType":"address","name":"_satoTokenAddress","type":"address"},{"internalType":"address","name":"_satoStakingAddress","type":"address"},{"internalType":"address","name":"_collAddress","type":"address"}],"name":"setAddresses","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"},{"internalType":"uint256","name":"_num","type":"uint256"}],"name":"setTroveStatus","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"stabilityPool","outputs":[{"internalType":"contract IStabilityPool","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalCollateralSnapshot","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStakes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStakesSnapshot","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"updateStakeAndTotalStakes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"updateTroveRedemptionSnapshots","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"}],"name":"updateTroveRewardSnapshots","outputs":[],"stateMutability":"nonpayable","type":"function"}]';
  const activePool_abi =
    '[{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newActivePoolAddress","type":"address"}],"name":"ActivePoolAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_debt","type":"uint256"}],"name":"ActivePoolBTUSDDebtUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_ETH","type":"uint256"}],"name":"ActivePoolETHBalanceUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_redeemedDebt","type":"uint256"}],"name":"ActivePoolRedeemedDebtUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newBorrowerOperationsAddress","type":"address"}],"name":"BorrowerOperationsAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newDefaultPoolAddress","type":"address"}],"name":"DefaultPoolAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"EtherSent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newStabilityPoolAddress","type":"address"}],"name":"StabilityPoolAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newTroveManagerAddress","type":"address"}],"name":"TroveManagerAddressChanged","type":"event"},{"inputs":[],"name":"NAME","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"borrowerOperationsAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"collSurplusPoolAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"collateral","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"debtToken","outputs":[{"internalType":"contract IBTUSDToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"decreaseLUSDDebt","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"decreaseRedemptionDebt","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"defaultPoolAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getETH","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getLUSDDebt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRedeemedDebt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"increaseLUSDDebt","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"increaseRedemptionDebt","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"receiveCollateral","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_borrower","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"sendDebtFromRedemption","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"sendETH","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_borrowerOperationsAddress","type":"address"},{"internalType":"address","name":"_troveManagerAddress","type":"address"},{"internalType":"address","name":"_stabilityPoolAddress","type":"address"},{"internalType":"address","name":"_defaultPoolAddress","type":"address"},{"internalType":"address","name":"_collSurplusPoolAddress","type":"address"},{"internalType":"address","name":"_collAddress","type":"address"},{"internalType":"address","name":"_debtTokenAddress","type":"address"}],"name":"setAddresses","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"stabilityPoolAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"troveManagerAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]';
  const stabilityPool_abi =
    '[{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newActivePoolAddress","type":"address"}],"name":"ActivePoolAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newDebtTokenAddress","type":"address"}],"name":"BTUSDTokenAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newBorrowerOperationsAddress","type":"address"}],"name":"BorrowerOperationsAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newCommunityIssuanceAddress","type":"address"}],"name":"CommunityIssuanceAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newDefaultPoolAddress","type":"address"}],"name":"DefaultPoolAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_depositor","type":"address"},{"indexed":false,"internalType":"uint256","name":"_P","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_S","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_G","type":"uint256"}],"name":"DepositSnapshotUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_depositor","type":"address"},{"indexed":false,"internalType":"uint256","name":"_ETH","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_debtLoss","type":"uint256"}],"name":"ETHGainWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint128","name":"_currentEpoch","type":"uint128"}],"name":"EpochUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"EtherSent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_frontEnd","type":"address"},{"indexed":false,"internalType":"uint256","name":"_kickbackRate","type":"uint256"}],"name":"FrontEndRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_frontEnd","type":"address"},{"indexed":false,"internalType":"uint256","name":"_P","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_G","type":"uint256"}],"name":"FrontEndSnapshotUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_frontEnd","type":"address"},{"indexed":false,"internalType":"uint256","name":"_newFrontEndStake","type":"uint256"},{"indexed":false,"internalType":"address","name":"_depositor","type":"address"}],"name":"FrontEndStakeChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_depositor","type":"address"},{"indexed":true,"internalType":"address","name":"_frontEnd","type":"address"}],"name":"FrontEndTagSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_G","type":"uint256"},{"indexed":false,"internalType":"uint128","name":"_epoch","type":"uint128"},{"indexed":false,"internalType":"uint128","name":"_scale","type":"uint128"}],"name":"G_Updated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_P","type":"uint256"}],"name":"P_Updated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newPriceFeedAddress","type":"address"}],"name":"PriceFeedAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_depositor","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amt","type":"uint256"}],"name":"SATOPaidToDepositor","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_frontEnd","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amt","type":"uint256"}],"name":"SATOPaidToFrontEnd","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_S","type":"uint256"},{"indexed":false,"internalType":"uint128","name":"_epoch","type":"uint128"},{"indexed":false,"internalType":"uint128","name":"_scale","type":"uint128"}],"name":"S_Updated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint128","name":"_currentScale","type":"uint128"}],"name":"ScaleUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_newBalance","type":"uint256"}],"name":"StabilityPoolBTUSDBalanceUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_newBalance","type":"uint256"}],"name":"StabilityPoolETHBalanceUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newTroveManagerAddress","type":"address"}],"name":"TroveManagerAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_depositor","type":"address"},{"indexed":false,"internalType":"uint256","name":"_newDeposit","type":"uint256"}],"name":"UserDepositChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_depositor","type":"address"},{"indexed":false,"internalType":"uint256","name":"_time","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"WithdrawRequest","type":"event"},{"inputs":[],"name":"BORROWING_FEE_FLOOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"BORROWING_FEE_FLOOR_PREMIUM","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"CCR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DECIMAL_PRECISION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MCR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MIN_NET_DEBT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"NAME","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"P","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERCENT_DIVISOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PREMIUM_LIQ_RATIO","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SCALE_FACTOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SCAVENGER_REWARD_DEBT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"WITHDRAWAL_DELAY_SECONDS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"WITHDRAWAL_INTERVAL_SECONDS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"WITHDRAWAL_WINDOW_SECONDS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_100pct","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"activePool","outputs":[{"internalType":"contract IActivePool","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"borrowerOperations","outputs":[{"internalType":"contract IBorrowerOperations","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"collateral","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"communityIssuance","outputs":[{"internalType":"contract ICommunityIssuance","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentEpoch","outputs":[{"internalType":"uint128","name":"","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentScale","outputs":[{"internalType":"uint128","name":"","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"debtToken","outputs":[{"internalType":"contract IBTUSDToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"defaultPool","outputs":[{"internalType":"contract IDefaultPool","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"depositSnapshots","outputs":[{"internalType":"uint256","name":"S","type":"uint256"},{"internalType":"uint256","name":"P","type":"uint256"},{"internalType":"uint256","name":"G","type":"uint256"},{"internalType":"uint128","name":"scale","type":"uint128"},{"internalType":"uint128","name":"epoch","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"deposits","outputs":[{"internalType":"uint256","name":"initialValue","type":"uint256"},{"internalType":"address","name":"frontEndTag","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint128","name":"","type":"uint128"},{"internalType":"uint128","name":"","type":"uint128"}],"name":"epochToScaleToG","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint128","name":"","type":"uint128"},{"internalType":"uint128","name":"","type":"uint128"}],"name":"epochToScaleToSum","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_depositor","type":"address"}],"name":"existWithdrawalRequest","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"frontEndSnapshots","outputs":[{"internalType":"uint256","name":"S","type":"uint256"},{"internalType":"uint256","name":"P","type":"uint256"},{"internalType":"uint256","name":"G","type":"uint256"},{"internalType":"uint128","name":"scale","type":"uint128"},{"internalType":"uint128","name":"epoch","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"frontEndStakes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"frontEnds","outputs":[{"internalType":"uint256","name":"kickbackRate","type":"uint256"},{"internalType":"bool","name":"registered","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_depositor","type":"address"}],"name":"getCompoundedDebtDeposit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_frontEnd","type":"address"}],"name":"getCompoundedFrontEndStake","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_depositor","type":"address"}],"name":"getDepositorETHGain","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_depositor","type":"address"}],"name":"getDepositorSATOGain","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getETH","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getEntireSystemColl","outputs":[{"internalType":"uint256","name":"entireSystemColl","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getEntireSystemDebt","outputs":[{"internalType":"uint256","name":"entireSystemDebt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_depositor","type":"address"}],"name":"getExpectedSATO","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_frontEnd","type":"address"}],"name":"getFrontEndSATOGain","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDebtDeposits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastETHError_Offset","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastLUSDLossError_Offset","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastSATOError","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"lastWithdrawTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_debtToOffset","type":"uint256"},{"internalType":"uint256","name":"_collToAdd","type":"uint256"}],"name":"offset","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"priceFeed","outputs":[{"internalType":"contract IPriceFeed","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"address","name":"_frontEndTag","type":"address"}],"name":"provideToSP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"receiveCollateral","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_kickbackRate","type":"uint256"}],"name":"registerFrontEnd","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"requestWithdrawFromSP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_borrowerOperationsAddress","type":"address"},{"internalType":"address","name":"_troveManagerAddress","type":"address"},{"internalType":"address","name":"_activePoolAddress","type":"address"},{"internalType":"address","name":"_debtTokenAddress","type":"address"},{"internalType":"address","name":"_priceFeedAddress","type":"address"},{"internalType":"address","name":"_communityIssuanceAddress","type":"address"},{"internalType":"address","name":"_collAddress","type":"address"}],"name":"setAddresses","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"troveManager","outputs":[{"internalType":"contract ITroveManager","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawETHGainToTrove","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdrawFromSP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"withdrawReqAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"withdrawReqTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]';
  const satoStaking_abi =
    '[{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_activePoolAddress","type":"address"}],"name":"ActivePoolAddressSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_debtTokenAddress","type":"address"}],"name":"BTUSDTokenAddressSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_borrowerOperationsAddress","type":"address"}],"name":"BorrowerOperationsAddressSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_account","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"EtherSent","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_F_BTUSD","type":"uint256"}],"name":"F_BTUSDUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_F_ETH","type":"uint256"}],"name":"F_ETHUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_staker","type":"address"}],"name":"PremiumStaking","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_satoTokenAddress","type":"address"}],"name":"SATOTokenAddressSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"staker","type":"address"},{"indexed":false,"internalType":"uint256","name":"newStake","type":"uint256"}],"name":"StakeChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_staker","type":"address"},{"indexed":false,"internalType":"uint256","name":"_F_ETH","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_F_BTUSD","type":"uint256"}],"name":"StakerSnapshotsUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"staker","type":"address"},{"indexed":false,"internalType":"uint256","name":"debtGain","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"ETHGain","type":"uint256"}],"name":"StakingGainsWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_totalSATOStaked","type":"uint256"}],"name":"TotalSATOStakedUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_troveManager","type":"address"}],"name":"TroveManagerAddressSet","type":"event"},{"inputs":[],"name":"DECIMAL_PRECISION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"F_ETH","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"F_LUSD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"NAME","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PREMIUM_STAKING","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"activePoolAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"borrowerOperationsAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"collateral","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"debtToken","outputs":[{"internalType":"contract IBTUSDToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"getPendingETHGain","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"getPendingLUSDGain","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_staker","type":"address"}],"name":"getStakes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"goPremiumStaking","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_staker","type":"address"}],"name":"ifPremiumStaking","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_collRedemptionFee","type":"uint256"}],"name":"increaseF_ETH","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_debtMintFee","type":"uint256"}],"name":"increaseF_LUSD","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"premiumStakers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"satoToken","outputs":[{"internalType":"contract ISATOToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_satoTokenAddress","type":"address"},{"internalType":"address","name":"_debtTokenAddress","type":"address"},{"internalType":"address","name":"_troveManagerAddress","type":"address"},{"internalType":"address","name":"_borrowerOperationsAddress","type":"address"},{"internalType":"address","name":"_activePoolAddress","type":"address"},{"internalType":"address","name":"_collAddress","type":"address"}],"name":"setAddresses","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"snapshots","outputs":[{"internalType":"uint256","name":"F_ETH_Snapshot","type":"uint256"},{"internalType":"uint256","name":"F_BTUSD_Snapshot","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"stakes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSATOStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"troveManagerAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"}]';
  const communityIssuance_abi =
    '[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_satoTokenAddress","type":"address"}],"name":"SATOTokenAddressSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_stabilityPoolAddress","type":"address"}],"name":"StabilityPoolAddressSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_totalSATOIssued","type":"uint256"}],"name":"TotalSATOIssuedUpdated","type":"event"},{"inputs":[],"name":"DECIMAL_PRECISION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ISSUANCE_FACTOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"NAME","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SATOSupplyCap","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SECONDS_IN_ONE_MINUTE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"deploymentTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"issueSATO","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"satoToken","outputs":[{"internalType":"contract ISATOToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"sendSATO","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_satoTokenAddress","type":"address"},{"internalType":"address","name":"_stabilityPoolAddress","type":"address"}],"name":"setAddresses","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"stabilityPoolAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSATOIssued","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]';
  const uniPool_abi =
    '[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"}],"name":"RewardAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"}],"name":"RewardPaid","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_satoTokenAddress","type":"address"}],"name":"SATOTokenAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_uniTokenAddress","type":"address"}],"name":"UniTokenAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"NAME","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimReward","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"duration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"earned","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastTimeRewardApplicable","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastUpdateTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"periodFinish","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rewardPerToken","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rewardPerTokenStored","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rewardRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"rewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"satoToken","outputs":[{"internalType":"contract ISATOToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_satoTokenAddress","type":"address"},{"internalType":"address","name":"_uniTokenAddress","type":"address"},{"internalType":"uint256","name":"_duration","type":"uint256"}],"name":"setParams","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"uniToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userRewardPerTokenPaid","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawAndClaim","outputs":[],"stateMutability":"nonpayable","type":"function"}]';
  const collSurplus_abi =
    '[{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newActivePoolAddress","type":"address"}],"name":"ActivePoolAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newBorrowerOperationsAddress","type":"address"}],"name":"BorrowerOperationsAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_account","type":"address"},{"indexed":false,"internalType":"uint256","name":"_newBalance","type":"uint256"}],"name":"CollBalanceUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"EtherSent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newTroveManagerAddress","type":"address"}],"name":"TroveManagerAddressChanged","type":"event"},{"inputs":[],"name":"NAME","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"accountSurplus","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"activePoolAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"borrowerOperationsAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"claimColl","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"collateral","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"getCollateral","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getETH","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"receiveCollateral","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_borrowerOperationsAddress","type":"address"},{"internalType":"address","name":"_troveManagerAddress","type":"address"},{"internalType":"address","name":"_activePoolAddress","type":"address"},{"internalType":"address","name":"_collAddress","type":"address"}],"name":"setAddresses","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"troveManagerAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]';
  const erc20_abi =
    '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"receivers","type":"address[]"},{"name":"amounts","type":"uint256[]"}],"name":"multiTransfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"account","type":"address"},{"name":"amount","type":"uint256"}],"name":"burnFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"value","type":"uint256"}],"name":"findOnePercent","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"basePercent","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":true,"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}]';
  const chainlink_feed_abi =
    '[{"inputs":[{"internalType":"address","name":"_aggregator","type":"address"},{"internalType":"address","name":"_accessController","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"int256","name":"current","type":"int256"},{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"updatedAt","type":"uint256"}],"name":"AnswerUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"roundId","type":"uint256"},{"indexed":true,"internalType":"address","name":"startedBy","type":"address"},{"indexed":false,"internalType":"uint256","name":"startedAt","type":"uint256"}],"name":"NewRound","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"OwnershipTransferRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"accessController","outputs":[{"internalType":"contract AccessControllerInterface","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"aggregator","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_aggregator","type":"address"}],"name":"confirmAggregator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"description","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_roundId","type":"uint256"}],"name":"getAnswer","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint80","name":"_roundId","type":"uint80"}],"name":"getRoundData","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_roundId","type":"uint256"}],"name":"getTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"latestAnswer","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"latestRound","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"latestRoundData","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"latestTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16","name":"","type":"uint16"}],"name":"phaseAggregators","outputs":[{"internalType":"contract AggregatorV2V3Interface","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"phaseId","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_aggregator","type":"address"}],"name":"proposeAggregator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"proposedAggregator","outputs":[{"internalType":"contract AggregatorV2V3Interface","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint80","name":"_roundId","type":"uint80"}],"name":"proposedGetRoundData","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"proposedLatestRoundData","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_accessController","type":"address"}],"name":"setController","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]';
  const bnb_oracle_registry_abi =
    '[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"asset","type":"address"},{"indexed":true,"internalType":"address","name":"denomination","type":"address"},{"indexed":true,"internalType":"address","name":"latestAggregator","type":"address"},{"indexed":false,"internalType":"address","name":"previousAggregator","type":"address"},{"indexed":false,"internalType":"uint16","name":"nextPhaseId","type":"uint16"},{"indexed":false,"internalType":"address","name":"sender","type":"address"}],"name":"FeedConfirmed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"asset","type":"address"},{"indexed":true,"internalType":"address","name":"denomination","type":"address"},{"indexed":true,"internalType":"address","name":"proposedAggregator","type":"address"},{"indexed":false,"internalType":"address","name":"currentAggregator","type":"address"},{"indexed":false,"internalType":"address","name":"sender","type":"address"}],"name":"FeedProposed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"OwnershipTransferRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"accessController","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"PairAccessControllerSet","type":"event"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"},{"internalType":"address","name":"aggregator","type":"address"}],"name":"confirmFeed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"}],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"base","type":"string"},{"internalType":"string","name":"quote","type":"string"}],"name":"decimalsByName","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"}],"name":"description","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"base","type":"string"},{"internalType":"string","name":"quote","type":"string"}],"name":"descriptionByName","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"base","type":"string"},{"internalType":"string","name":"quote","type":"string"}],"name":"exists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAccessController","outputs":[{"internalType":"contract PairReadAccessControllerInterface","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllPairs","outputs":[{"components":[{"internalType":"string","name":"baseAsset","type":"string"},{"internalType":"string","name":"quoteAsset","type":"string"}],"internalType":"struct EnumerableTradingPairMap.Pair[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"},{"internalType":"uint256","name":"roundId","type":"uint256"}],"name":"getAnswer","outputs":[{"internalType":"int256","name":"answer","type":"int256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"}],"name":"getCurrentPhaseId","outputs":[{"internalType":"uint16","name":"currentPhaseId","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"}],"name":"getFeed","outputs":[{"internalType":"contract AggregatorV2V3Interface","name":"aggregator","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string[]","name":"bases","type":"string[]"},{"internalType":"string[]","name":"quotes","type":"string[]"}],"name":"getMultipleLatestRoundData","outputs":[{"components":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"internalType":"struct FeedRegistryInterface.RoundData[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"},{"internalType":"uint80","name":"roundId","type":"uint80"}],"name":"getNextRoundId","outputs":[{"internalType":"uint80","name":"nextRoundId","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"},{"internalType":"uint16","name":"phaseId","type":"uint16"}],"name":"getPhase","outputs":[{"components":[{"internalType":"uint16","name":"phaseId","type":"uint16"},{"internalType":"uint80","name":"startingAggregatorRoundId","type":"uint80"},{"internalType":"uint80","name":"endingAggregatorRoundId","type":"uint80"}],"internalType":"struct FeedRegistryInterface.Phase","name":"phase","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"},{"internalType":"uint16","name":"phaseId","type":"uint16"}],"name":"getPhaseFeed","outputs":[{"internalType":"contract AggregatorV2V3Interface","name":"aggregator","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"},{"internalType":"uint16","name":"phaseId","type":"uint16"}],"name":"getPhaseRange","outputs":[{"internalType":"uint80","name":"startingRoundId","type":"uint80"},{"internalType":"uint80","name":"endingRoundId","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"},{"internalType":"uint80","name":"roundId","type":"uint80"}],"name":"getPreviousRoundId","outputs":[{"internalType":"uint80","name":"previousRoundId","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"}],"name":"getProposedFeed","outputs":[{"internalType":"contract AggregatorV2V3Interface","name":"proposedAggregator","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"},{"internalType":"uint80","name":"_roundId","type":"uint80"}],"name":"getRoundData","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"},{"internalType":"uint80","name":"roundId","type":"uint80"}],"name":"getRoundFeed","outputs":[{"internalType":"contract AggregatorV2V3Interface","name":"aggregator","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"},{"internalType":"uint256","name":"roundId","type":"uint256"}],"name":"getTimestamp","outputs":[{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"base","type":"string"},{"internalType":"string","name":"quote","type":"string"}],"name":"getTradingPairDetails","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"base","type":"string"},{"internalType":"string","name":"quote","type":"string"},{"internalType":"address","name":"baseAssetAddress","type":"address"},{"internalType":"address","name":"quoteAssetAddress","type":"address"},{"internalType":"address","name":"feedAdapterAddress","type":"address"}],"name":"insertPair","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"aggregator","type":"address"}],"name":"isFeedEnabled","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"}],"name":"latestAnswer","outputs":[{"internalType":"int256","name":"answer","type":"int256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"base","type":"string"},{"internalType":"string","name":"quote","type":"string"}],"name":"latestAnswerByName","outputs":[{"internalType":"int256","name":"answer","type":"int256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"}],"name":"latestRound","outputs":[{"internalType":"uint256","name":"roundId","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"}],"name":"latestRoundData","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"base","type":"string"},{"internalType":"string","name":"quote","type":"string"}],"name":"latestRoundDataByName","outputs":[{"internalType":"uint80","name":"roundId","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"}],"name":"latestTimestamp","outputs":[{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"},{"internalType":"address","name":"aggregator","type":"address"}],"name":"proposeFeed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"},{"internalType":"uint80","name":"roundId","type":"uint80"}],"name":"proposedGetRoundData","outputs":[{"internalType":"uint80","name":"id","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"}],"name":"proposedLatestRoundData","outputs":[{"internalType":"uint80","name":"id","type":"uint80"},{"internalType":"int256","name":"answer","type":"int256"},{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"uint80","name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"base","type":"string"},{"internalType":"string","name":"quote","type":"string"}],"name":"removePair","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract PairReadAccessControllerInterface","name":"_accessController","type":"address"}],"name":"setAccessController","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"totalPairsAvailable","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"typeAndVersion","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"base","type":"address"},{"internalType":"address","name":"quote","type":"address"}],"name":"version","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"base","type":"string"},{"internalType":"string","name":"quote","type":"string"}],"name":"versionByName","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]';

  /////////////////////////////////////////////////
  // Cookies
  /////////////////////////////////////////////////
  const ckMaxAgeInSeconds = 120;

  /////////////////////////////////////////////////
  // Effects
  /////////////////////////////////////////////////

  // initial loadup for website
  const [mySatoshi, setMySatoshi] = useState(null);
  useEffect(() => {
    async function getMySatoshi() {
      ///////////////////////////////////////////////////////////////////////////
      // web3 requests
      ///////////////////////////////////////////////////////////////////////////
      const connectWalletButton = document.querySelector("#connectWalletBtn");
      removeAddListener(connectWalletButton, "click", connectToMetaMask);

      if (typeof window.ethereum !== "undefined") {
        const _chainIdHex = await window.ethereum.request({
          method: "eth_chainId",
        });
        await checkConnectedChain(_chainIdHex);
        await checkTroveExistence();
        await getGasPrice();

        ///////////////////////////////////////////////////////////////////////////
        // metamask events listeners
        ///////////////////////////////////////////////////////////////////////////
        ethereum.on("accountsChanged", handleMetaMaskAccounts);

        ethereum.on("chainChanged", (chainId: string) => {
          checkConnectedChain(chainId);
          checkTroveExistence();
          getGasPrice();
        });
      }
    }

    getMySatoshi();
  }, []);

  ///////////////////////////////////////////////////////////////////////////
  // Satoshi utility methods
  ///////////////////////////////////////////////////////////////////////////

  async function handleMetaMaskAccounts(accounts) {
    console.log("accountsChangedEvt=" + accounts[0]);
    if (!checkIfNull(accounts[0])) {
      await showConnectedAddress(accounts[0]);
      await checkTroveExistence();
      await getGasPrice();
    }
    reloadPage();
  }

  async function addTokenInfo(tokenAddr, tokenSymbol, tokenImgUrl) {
    const wasAdded = await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: tokenAddr, // The address of the token.
          symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 characters.
          decimals: TOKEN_DECIMAL, // The number of decimals in the token.
          image: tokenImgUrl, // A string URL of the token logo.
        },
      },
    });
  }

  async function getGasPrice() {
    const _gasPriceHex = await window.ethereum.request({
      method: "eth_gasPrice",
    });
    let _gasPrice = parseInt(_gasPriceHex, 16);
    console.log("Gas Price=" + _gasPrice);
    return _gasPrice;
  }

  function icrToPercentageStr(_icr) {
    return (Number(fromBn(_icr)) * 100).toFixed(2) + "%";
  }

  function crToColorDisplay(_cr) {
    if (_cr.lt(CCR)) {
      return "red";
    } else if (_cr.lt(REASONABLE_SAFE_ICR)) {
      return "orange";
    } else {
      return "#167347";
    }
  }

  function inputValToBN(_input) {
    if (checkIfNull(_input)) {
      return zeroBN;
    } else {
      return toBn("" + _input);
    }
  }

  function checkAdjustICRIfValid(_newICR, _oldICR, _newTCR, _recoveryMode) {
    if (_recoveryMode) {
      return _newICR.gt(CCR) && _newICR.gt(_oldICR);
    } else {
      return _newICR.gt(MCR) && _newTCR.gt(CCR);
    }
  }

  function baseCheckAdjustIfValid(
    _debt,
    _coll,
    _collChange,
    _isCollIncrease,
    _debtChange,
    _isDebtIncrease,
  ) {
    if (_collChange.eq(zeroBN) && _debtChange.eq(zeroBN)) {
      //return false
    }
    if (!_isCollIncrease && _collChange.gte(_coll)) {
      return false;
    }
    if (!_isDebtIncrease && _debtChange.gt(_debt.sub(MIN_DEBT))) {
      return false;
    }
    return true;
  }

  function getNewCRForAdjustTrove(
    _debt,
    _coll,
    _collChange,
    _isCollIncrease,
    _debtChange,
    _isDebtIncrease,
    _price,
  ) {
    let _newColl = _coll;
    if (_isCollIncrease) {
      _newColl = _newColl.add(_collChange);
    } else {
      _newColl = _newColl.sub(_collChange);
    }
    let _newDebt = _debt;
    if (_isDebtIncrease) {
      _newDebt = _newDebt.add(_debtChange);
    } else {
      _newDebt = _newDebt.sub(_debtChange);
    }
    return [
      _newColl,
      _newDebt,
      _newDebt.gt(zeroBN) ? _newColl.mul(_price).div(_newDebt) : zeroBN,
    ];
  }

  ///////////////////////////////////////////////////////////////////////////
  // General UI check methods
  ///////////////////////////////////////////////////////////////////////////

  async function checkTroveExistence() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    if (!checkIfNull(connectedAddr)) {
      await showConnectedAddress(connectedAddr);

      const _collSurplusPoolContract = getCollSurplusPoolSignerContract();
      const _troveManagerContract = getTroveManagerSignerContract();
      const _activePoolContract = getActivePoolSignerContract();
      const _collateralTokenContract = getCollateralTokenSignerContract();
      let _stabilityPoolContract = getStabilityPoolSignerContract();
      let _satoStakingContract = getSatoStakingSignerContract();
      const _priceFeedContract = getPriceFeedSignerContract();
      const _communityIssuanceContract = getCommunityIssuanceSignerContract();
      const _lpTokenContract = getLpTokenSignerContract();
      const _uniPoolContract = getUniPoolSignerContract();
      const _btUSDContract = getBTUSDSignerContract();
      const _satoTokenContract = getSATOTokenSignerContract();
      let _collPrice = utils.parseUnits(
        (await _priceFeedContract.callStatic.fetchPrice()).toString(),
        0,
      );

      ////	Global Stats initialization
      let _troveSystemStatus = await getSystemStatusCall(
        _collPrice,
        _troveManagerContract,
        _activePoolContract,
      );
      let _systemTotalDebt = _troveSystemStatus["totalDebt"].sub(
        _troveSystemStatus["redeemedDebt"],
      );
      document.querySelector("#statsTotalTrove").textContent =
        _troveSystemStatus["troveCount"];
      document.querySelector("#statsSystemTCR").textContent =
        icrToPercentageStr(_troveSystemStatus["TCR"]);
      document.querySelector("#statsSystemTCR").style["color"] =
        crToColorDisplay(_troveSystemStatus["TCR"]);
      document.querySelector("#statsSystemTCR").style["font-weight"] = "bold";
      document.querySelector("#statsTotalCollateral").textContent = fromBn(
        _troveSystemStatus["totalColl"],
      );
      document.querySelector("#statsTotalDebt").textContent =
        fromBn(_systemTotalDebt);
      document.querySelector("#statsCollateralPrice").textContent =
        "$" + fromBn(_collPrice);
      let _underlyingPrices = await getUnderlyingPrices();
      document.querySelector("#chainlinkPrice").textContent =
        "$" + fromBn(_underlyingPrices["chainlink"]);
      document.querySelector("#bnbOraclePrice").textContent =
        "$" + fromBn(_underlyingPrices["bnbOracle"]);

      let _satoStakingStatus =
        await getSatoStakingStatusCall(_satoStakingContract);
      document.querySelector("#statsTotalSATOStaked").textContent = fromBn(
        _satoStakingStatus["totalStaked"],
      );
      let _stabilityPoolStatus = await getStabilityPoolStatusCall(
        _stabilityPoolContract,
      );
      let _spTotalDeposit = _stabilityPoolStatus["totalDeposit"];
      let _spTotalDepositPercentage = _systemTotalDebt.gt(zeroBN)
        ? _spTotalDeposit.mul(decimal18).div(_systemTotalDebt)
        : zeroBN;
      document.querySelector("#statsTotalSPDeposit").textContent =
        fromBn(_stabilityPoolStatus["totalDeposit"]) +
        " (" +
        icrToPercentageStr(_spTotalDepositPercentage) +
        " of btUSD supply)";
      let _satoRewardStatus = await getSATORewardStatusCall(
        _communityIssuanceContract,
      );
      let _timeElapsed = toBn("" + getNowTime()).sub(
        _satoRewardStatus["communityIssuanceDeployTime"],
      );
      //let _remainingSATOFromCommunityIssuance = SP_SATO_REWARD_CAP.mul(SP_SATO_REWARD_PER_SECOND.pow(_timeElapsed))
      //document.querySelector('#statsTotalSATOToBeMined').textContent = fromBn(_remainingSATOFromCommunityIssuance)

      //// Trove UI initialization setup
      let _myTroveDebtAndColl = await getEntireDebtAndCollCall(
        _troveManagerContract,
        connectedAddr,
      );
      let _myCollSurplus = await getCollSurplusBalanceCall(
        _collSurplusPoolContract,
        connectedAddr,
      );
      let _alreadyHasTrove = _myTroveDebtAndColl["coll"].gt(zeroBN); //check Trove's collateral
      if (_alreadyHasTrove) {
        document.querySelector("#openTroveForm").style["display"] = "none";
        document.querySelector("#existTroveForm").style["display"] = "block";

        document.querySelector("#showTroveColl").value = fromBn(
          _myTroveDebtAndColl["coll"],
        );
        document.querySelector("#showTroveDebt").value = fromBn(
          _myTroveDebtAndColl["debt"],
        );

        if (_myTroveDebtAndColl["debt"].gt(zeroBN)) {
          let _icr = _myTroveDebtAndColl["coll"]
            .mul(_collPrice)
            .div(_myTroveDebtAndColl["debt"]);
          document.querySelector("#showTroveICR").value =
            icrToPercentageStr(_icr);
          document.querySelector("#showTroveICR").style["color"] =
            crToColorDisplay(_icr);
          document.querySelector("#showTroveICR").style["font-weight"] = "bold";
        }

        console.log(
          connectedAddr +
            " already got Trove with debt=" +
            _myTroveDebtAndColl["debt"] +
            ",coll=" +
            _myTroveDebtAndColl["coll"] +
            ",freeDebt=" +
            _myTroveDebtAndColl["freeDebt"],
        );
        if (_myCollSurplus.gt(zeroBN)) {
          document.querySelector("#claimCollSurplusAdjustTroveBtn").style[
            "display"
          ] = "inline-block";
        } else {
          document.querySelector("#claimCollSurplusAdjustTroveBtn").style[
            "display"
          ] = "none";
        }
      } else {
        document.querySelector("#openTroveForm").style["display"] =
          "inline-block";
        document.querySelector("#existTroveForm").style["display"] = "none";
        let _needToApprove = await checkOpenTroveCollApproval(
          connectedAddr,
          _collateralTokenContract,
          _collPrice,
        );
        showApproveOpenTroveBtn(_needToApprove[0], connectedAddr);
        if (_myCollSurplus.gt(zeroBN)) {
          document.querySelector("#claimCollSurplusOpenTroveBtn").style[
            "display"
          ] = "inline-block";
        } else {
          document.querySelector("#claimCollSurplusOpenTroveBtn").style[
            "display"
          ] = "none";
        }
      }

      //// Stability Pool UI initialization setup
      let _btUSDBalance = await _btUSDContract.balanceOf(connectedAddr);
      let _existSPDepoist = await getStabilityPoolDepositCall(
        _stabilityPoolContract,
        connectedAddr,
      );
      console.log(
        connectedAddr +
          " got StabilityPool deposit=" +
          JSON.stringify(_existSPDepoist),
      );
      if (_existSPDepoist["deposit"].gt(zeroBN)) {
        document.querySelector("#spDepositedInput").value = fromBn(
          _existSPDepoist["deposit"],
        );
        document.querySelector("#satoEarnedInput").value = fromBn(
          _existSPDepoist["satoGain"],
        );
        document.querySelector("#collEarnedInput").value = fromBn(
          _existSPDepoist["collGain"],
        );
        document.querySelector("#withdrawRequestSPBtn").disabled = false;
        document.querySelector("#withdrawRequestSPBtn").style["display"] =
          "inline-block";
        document.querySelector("#btUSDSPInput").placeholder =
          "deposit " +
          (_btUSDBalance.gt(zeroBN) ? fromBn(_btUSDBalance) : "more") +
          " or request to withdraw max " +
          fromBn(_existSPDepoist["deposit"]);
      } else {
        document.querySelector("#spDepositedInput").value = zeroBN;
        document.querySelector("#satoEarnedInput").value = zeroBN;
        document.querySelector("#collEarnedInput").value = zeroBN;
        document.querySelector("#withdrawRequestSPBtn").disabled = true;
        document.querySelector("#withdrawRequestSPBtn").style["display"] =
          "none";
        document.querySelector("#btUSDSPInput").placeholder =
          "deposit " +
          (_btUSDBalance.gt(zeroBN) ? fromBn(_btUSDBalance) : "more") +
          " or request to withdraw";
      }
      let _lastWithdrawReqTs = _existSPDepoist["withdrawReqTime"].toNumber();
      let _lastWithdrawTs = (
        await _stabilityPoolContract.lastWithdrawTime(connectedAddr)
      ).toNumber();
      let _now = getNowTime();
      let _tsSinceLastWithdrawReq = _now - _lastWithdrawReqTs;
      let _tsSinceLastWithdraw = _now - _lastWithdrawTs;
      if (
        _existSPDepoist["withdrawReq"].gt(zeroBN) &&
        _existSPDepoist["withdrawReqValid"] &&
        (_lastWithdrawTs == 0 ||
          _tsSinceLastWithdraw > SP_WITHDRAW_INTERVAL + SP_WITHDRAW_LOCK)
      ) {
        document.querySelector("#withdrawRequestSPBtn").style["display"] =
          "none";
        document.querySelector("#withdrawSPPendingBtn").style["display"] =
          "inline-block";
      } else if (
        !_existSPDepoist["withdrawReqValid"] &&
        (_lastWithdrawReqTs == 0 ||
          _tsSinceLastWithdrawReq > SP_WITHDRAW_INTERVAL)
      ) {
        document.querySelector("#withdrawRequestSPBtn").style["display"] =
          "inline-block";
        document.querySelector("#withdrawSPPendingBtn").style["display"] =
          "none";
      } else {
        document.querySelector("#withdrawRequestSPBtn").style["display"] =
          "none";
        document.querySelector("#withdrawSPPendingBtn").style["display"] =
          "none";
      }

      //// SATO Staking UI initialization setup
      let _mySATOBalance = await _satoTokenContract.balanceOf(connectedAddr);
      let _existStakingPremium = await getSatoStakingPremiumCall(
        _satoStakingContract,
        connectedAddr,
      );
      console.log(
        connectedAddr +
          " got SATO Staking premium=" +
          JSON.stringify(_existStakingPremium),
      );
      if (_existStakingPremium["premium"]) {
        document.querySelector("#satoPremiumBtn").style["display"] = "none";
        document.querySelector("#premiumBadge").style["display"] =
          "inline-block";
      } else {
        document.querySelector("#premiumBadge").style["display"] = "none";
        document.querySelector("#satoPremiumBtn").style["display"] =
          "inline-block";
      }
      if (_existStakingPremium["stake"].gt(zeroBN)) {
        document.querySelector("#satoStakedInput").value = fromBn(
          _existStakingPremium["stake"],
        );
        document.querySelector("#redemptionEarnedInput").value = fromBn(
          _existStakingPremium["collGain"],
        );
        document.querySelector("#borrowingEarnedInput").value = fromBn(
          _existStakingPremium["debtGain"],
        );
        let _maxToUnstake = _existStakingPremium["stake"].sub(
          _existStakingPremium["premium"] ? STAKING_PREMIUM : zeroBN,
        );
        document.querySelector("#satoUnstakeBtn").style["display"] =
          "inline-block";
        document.querySelector("#satoStakeInput").placeholder =
          "stake " +
          (_mySATOBalance.gt(zeroBN) ? fromBn(_mySATOBalance) : "more") +
          " or unstake max " +
          fromBn(_maxToUnstake);
      } else {
        document.querySelector("#satoStakedInput").value = zeroBN;
        document.querySelector("#redemptionEarnedInput").value = zeroBN;
        document.querySelector("#borrowingEarnedInput").value = zeroBN;
        document.querySelector("#satoUnstakeBtn").style["display"] = "none";
        document.querySelector("#satoStakeInput").placeholder =
          "stake " +
          (_mySATOBalance.gt(zeroBN) ? fromBn(_mySATOBalance) : "more");
      }

      //// LP Mining UI initialization setup
      let _stakeLPNeedToApprove = await checkStakeLPApproval(
        connectedAddr,
        _lpTokenContract,
      );
      if (_stakeLPNeedToApprove.gt(zeroBN)) {
        document.querySelector("#approveStakeLPBtn").style["display"] =
          "inline-block";
      } else {
        document.querySelector("#approveStakeLPBtn").style["display"] = "none";
      }
      let _stakeLPEarning = await getLPRewardCall(
        connectedAddr,
        _uniPoolContract,
      );
      if (_stakeLPEarning.gt(zeroBN)) {
        document.querySelector("#claimLPRewardBtn").style["display"] =
          "inline-block";
      } else {
        document.querySelector("#claimLPRewardBtn").style["display"] = "none";
      }
    } // end connectedAddr not null
  }

  async function checkConnectedChain(_chainIdHex) {
    let _chainId = parseInt(_chainIdHex, 16);
    const _chainConnected = await window.ethereum.isConnected();
    console.log(
      (_chainConnected ? "Connected" : "DisConnected") +
        " to chainid=" +
        _chainId,
    );

    let _correctChain = true;
    if (!testnet) {
      _correctChain = _chainId == 56 ? true : false;
    } else {
      _correctChain = _chainId == 97 ? true : false;
    }
    if (!_correctChain) {
      showToastMessage("Please connect to BNB Smart Chain.");
    }
  }

  async function connectToMetaMask() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
      params: [],
    });
    console.log("accounts=" + accounts);
    await showConnectedAddress(accounts[0]);
    await checkTroveExistence();
    await getGasPrice();
    return accounts[0];
  }

  ///////////////////////////////////////////////////////////////////////////
  // UI listener methods for peripherals
  ///////////////////////////////////////////////////////////////////////////

  function removeAddListener(_element, _event, _func) {
    _element.removeEventListener(_event, _func);
    _element.addEventListener(_event, _func);
  }

  window.addTokenSATOListener = async function addTokenSATOListener() {
    await addTokenInfo(
      contractsAddresses.satoTokenAddr,
      SATO_SYMBOL,
      SATO_IMG_URL,
    );
  };

  window.addTokenBTUSDListener = async function addTokenBTUSDListener() {
    await addTokenInfo(
      contractsAddresses.btUSDAddr,
      btUSD_SYMBOL,
      btUSD_IMG_URL,
    );
  };

  ///////////////////////////////////////////////////////////////////////////
  // UI listener methods for Trove operations
  ///////////////////////////////////////////////////////////////////////////

  window.approveCollListener = async function approveCollListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const collateralContract = getCollateralTokenSignerContract();
    const priceFeedContract = getPriceFeedSignerContract();
    let _collPrice = utils.parseUnits(
      (await priceFeedContract.callStatic.fetchPrice()).toString(),
      0,
    );

    let _needToApproveAndColl = await checkOpenTroveCollApproval(
      connectedAddr,
      collateralContract,
      _collPrice,
    );
    let _approveSuccess = await approveTokenSpender(
      collateralContract,
      contractsAddresses.borrowerOperationsAddr,
      decimal1Billion.add(_needToApproveAndColl[0]),
    );
    if (_approveSuccess) {
      document.querySelector("#approveCollBtn").style["display"] = "none";
      document.querySelector("#txSuccessToastCloseBtn").click();
    }
  };

  window.approveDebtCloseListener = async function approveDebtCloseListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const btUSDContract = getBTUSDSignerContract();
    let _approveSuccess = await approveTokenSpender(
      btUSDContract,
      contractsAddresses.borrowerOperationsAddr,
      decimal1Billion,
    );
    if (_approveSuccess) {
      document.querySelector("#approveDebtCloseBtn").style["display"] = "none";
      document.querySelector("#txSuccessToastCloseBtn").click();
    }
  };

  window.approveDebtAdjustListener =
    async function approveDebtAdjustListener() {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      let connectedAddr = accounts[0];

      const btUSDContract = getBTUSDSignerContract();
      let _approveSuccess = await approveTokenSpender(
        btUSDContract,
        contractsAddresses.borrowerOperationsAddr,
        decimal1Billion,
      );
      if (_approveSuccess) {
        document.querySelector("#approveDebtAdjustBtn").style["display"] =
          "none";
        document.querySelector("#txSuccessToastCloseBtn").click();
      }
    };

  window.checkOpenTroveDebtOnChange =
    async function checkOpenTroveDebtOnChange() {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      let connectedAddr = accounts[0];

      const collateralContract = getCollateralTokenSignerContract();
      const priceFeedContract = getPriceFeedSignerContract();
      let _collPrice = utils.parseUnits(
        (await priceFeedContract.callStatic.fetchPrice()).toString(),
        0,
      );

      await checkOpenTroveDebtInputOnChange(
        connectedAddr,
        collateralContract,
        _collPrice,
      );
    };

  window.openTroveModalListener = async function openTroveModalListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const troveManagerContract = getTroveManagerSignerContract();
    let _troveCollAndDebt = await getOpenTroveParamsFromInput(connectedAddr);
    await showOpenTroveSummary(
      connectedAddr,
      troveManagerContract,
      _troveCollAndDebt[0],
      _troveCollAndDebt[1],
      _troveCollAndDebt[2],
    );
  };

  window.openTroveListener = async function openTroveListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const borrowerOperationsContract = getBorrowerOperationsSignerContract();
    let _troveCollAndDebt = await getOpenTroveParamsFromInput(connectedAddr);

    let _openTroveSuccess = await openTroveCall(
      borrowerOperationsContract,
      _troveCollAndDebt[0],
      _troveCollAndDebt[1],
    );
    if (_openTroveSuccess) {
      reloadPage();
    }
  };

  window.closeTroveModalListener = async function closeTroveModalListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const troveManagerContract = getTroveManagerSignerContract();
    const btUSDContract = getBTUSDSignerContract();
    let _troveCollAndDebt = await getEntireDebtAndCollCall(
      troveManagerContract,
      connectedAddr,
    );
    let _debtToApprove = await checkRepayDebtApproval(
      connectedAddr,
      _troveCollAndDebt["debt"],
      btUSDContract,
    );
    if (_debtToApprove.gt(zeroBN)) {
      document.querySelector("#approveDebtCloseBtn").style["display"] = "none";
    } else {
      document.querySelector("#approveDebtCloseBtn").style["display"] = "none";
    }
    document.querySelector("#closeTroveSummaryColl").textContent = fromBn(
      _troveCollAndDebt["coll"],
    );
    document.querySelector("#closeTroveSummaryDebt").textContent = fromBn(
      _troveCollAndDebt["debt"],
    );
  };

  window.closeTroveListener = async function openTroveListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const borrowerOperationsContract = getBorrowerOperationsSignerContract();
    let _closeTroveSuccess = await closeTroveCall(borrowerOperationsContract);
    if (_closeTroveSuccess) {
      reloadPage();
    }
  };

  window.adjustTroveModalListener = async function adjustTroveModalListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const troveManagerContract = getTroveManagerSignerContract();
    const btUSDContract = getBTUSDSignerContract();
    let _troveCollAndDebt = await getEntireDebtAndCollCall(
      troveManagerContract,
      connectedAddr,
    );
    let _debtToApprove = await checkRepayDebtApproval(
      connectedAddr,
      _troveCollAndDebt["debt"],
      btUSDContract,
    );
    if (_debtToApprove.gt(zeroBN)) {
      document.querySelector("#approveDebtAdjustBtn").style["display"] = "none";
    } else {
      document.querySelector("#approveDebtAdjustBtn").style["display"] = "none";
    }
    document.querySelector("#adjustTroveSummaryColl").textContent = fromBn(
      _troveCollAndDebt["coll"],
    );
    document.querySelector("#adjustTroveSummaryDebt").textContent = fromBn(
      _troveCollAndDebt["debt"],
    );

    const priceFeedContract = getPriceFeedSignerContract();
    let price = utils.parseUnits(
      (await priceFeedContract.callStatic.fetchPrice()).toString(),
      0,
    );
    if (_troveCollAndDebt["debt"].gt(zeroBN)) {
      let _icr = _troveCollAndDebt["coll"]
        .mul(price)
        .div(_troveCollAndDebt["debt"]);
      document.querySelector("#adjustTroveSummaryICR").textContent =
        icrToPercentageStr(_icr);
      document.querySelector("#adjustTroveSummaryICR").style["color"] =
        crToColorDisplay(_icr);
    }
  };

  window.adjustTroveInputListener = async function adjustTroveInputListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    let _switch = document.querySelector("#adjustTroveAddCollSwitch");
    let _switchHint = document.querySelector(
      "#adjustTroveCollChangeSwitchHint",
    );
    if (_switch.checked) {
      _switchHint.textContent = "Add Collateral";
    } else {
      _switchHint.textContent = "Withdraw Collateral";
    }
    let _switchDebt = document.querySelector("#adjustTroveAddDebtSwitch");
    let _switchHintDebt = document.querySelector(
      "#adjustTroveDebtChangeSwitchHint",
    );
    if (_switchDebt.checked) {
      _switchHintDebt.textContent = "Add Debt";
    } else {
      _switchHintDebt.textContent = "Repay Debt";
    }

    const troveManagerContract = getTroveManagerSignerContract();
    let _troveCollAndDebt = await getEntireDebtAndCollCall(
      troveManagerContract,
      connectedAddr,
    );

    const priceFeedContract = getPriceFeedSignerContract();
    let price = utils.parseUnits(
      (await priceFeedContract.callStatic.fetchPrice()).toString(),
      0,
    );
    let _icr = 0;
    if (_troveCollAndDebt["debt"].gt(zeroBN)) {
      _icr = _troveCollAndDebt["coll"]
        .mul(price)
        .div(_troveCollAndDebt["debt"]);
    }

    await calculateAdjustTroveSummary(
      connectedAddr,
      troveManagerContract,
      _troveCollAndDebt["debt"],
      _troveCollAndDebt["coll"],
      _icr,
      price,
    );
  };

  window.adjustTroveConfirmListener =
    async function adjustTroveConfirmListener() {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      let connectedAddr = accounts[0];

      const troveManagerContract = getTroveManagerSignerContract();
      let _troveCollAndDebt = await getEntireDebtAndCollCall(
        troveManagerContract,
        connectedAddr,
      );

      const priceFeedContract = getPriceFeedSignerContract();
      let price = utils.parseUnits(
        (await priceFeedContract.callStatic.fetchPrice()).toString(),
        0,
      );
      let _icr = _troveCollAndDebt["coll"]
        .mul(price)
        .div(_troveCollAndDebt["debt"]);

      let _adjustCheckAndParams = await calculateAdjustTroveSummary(
        connectedAddr,
        troveManagerContract,
        _troveCollAndDebt["debt"],
        _troveCollAndDebt["coll"],
        _icr,
        price,
      );
      if (_adjustCheckAndParams["checkAdjustValid"]) {
        const borrowerOperationsContract =
          getBorrowerOperationsSignerContract();
        let _adjustTroveSuccess = await adjustTroveCall(
          borrowerOperationsContract,
          _adjustCheckAndParams["finalAdjust"]["collChange"],
          _adjustCheckAndParams["finalAdjust"]["collIncrease"],
          _adjustCheckAndParams["finalAdjust"]["debtChange"],
          _adjustCheckAndParams["finalAdjust"]["debtIncrease"],
        );
        if (_adjustTroveSuccess) {
          reloadPage();
        }
      }
    };

  window.claimCollSurplusListener = async function claimCollSurplusListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const borrowerOperationsContract = getBorrowerOperationsSignerContract();
    let _claimCollSurplusSuccess = await claimCollSurplusCall(
      connectedAddr,
      borrowerOperationsContract,
    );
    if (_claimCollSurplusSuccess) {
      reloadPage();
    }
  };

  window.registerNotificationListener =
    async function registerNotificationListener() {
      let _msgToSign = document.querySelector(
        "#registerNotificationMsgToSign",
      ).textContent;
      await requestPersonalSign(_msgToSign);
    };

  ///////////////////////////////////////////////////////////////////////////
  // UI listener methods for btUSD Stability Pool
  ///////////////////////////////////////////////////////////////////////////

  window.depositSPListener = async function depositSPListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const stabilityPoolContract = getStabilityPoolSignerContract();
    let _depositAmt = inputValToBN(
      document.querySelector("#btUSDSPInput").value,
    );
    if (_depositAmt.gt(zeroBN)) {
      let _depositSuccess = await depositSPCall(
        connectedAddr,
        stabilityPoolContract,
        _depositAmt,
      );
      if (_depositSuccess) {
        reloadPage();
      }
    } else {
      showToastMessage("Amount to deposit should be above zero");
    }
  };

  window.claimSPListener = async function claimSPListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const stabilityPoolContract = getStabilityPoolSignerContract();
    let _claimSPSuccess = await withdrawSPCall(
      connectedAddr,
      stabilityPoolContract,
      zeroBN,
    );
    if (_claimSPSuccess) {
      reloadPage();
    }
  };

  window.withdrawSPConfirmListener =
    async function withdrawSPConfirmListener() {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      let connectedAddr = accounts[0];

      const stabilityPoolContract = getStabilityPoolSignerContract();
      let _amtToWithdraw = toBn(
        document.querySelector("#withdrawSPSummaryAmount").textContent,
      );
      let _withdrawSPSuccess = await withdrawSPCall(
        connectedAddr,
        stabilityPoolContract,
        _amtToWithdraw,
      );
      if (_withdrawSPSuccess) {
        reloadPage();
      }
    };

  window.withdrawRequestSPListener =
    async function withdrawRequestSPListener() {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      let connectedAddr = accounts[0];

      const stabilityPoolContract = getStabilityPoolSignerContract();
      let _maxAmtToWithdraw = toBn(
        document.querySelector("#spDepositedInput").value,
      );
      let _withdrawReqAmt = inputValToBN(
        document.querySelector("#btUSDSPInput").value,
      );
      if (
        _withdrawReqAmt.gt(zeroBN) &&
        _withdrawReqAmt.lte(_maxAmtToWithdraw)
      ) {
        let _withdrawReqSPSuccess = await withdrawRequestSPCall(
          connectedAddr,
          stabilityPoolContract,
          _withdrawReqAmt,
        );
        if (_withdrawReqSPSuccess) {
          reloadPage();
        }
      } else {
        showToastMessage(
          "Withdraw request should be above zero and below deposited amount",
        );
      }
    };

  window.withdrawSPModalListener = async function withdrawSPModalListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const _stabilityPoolContract = getStabilityPoolSignerContract();
    let _existSPDepoist = await getStabilityPoolDepositCall(
      _stabilityPoolContract,
      connectedAddr,
    );
    if (
      _existSPDepoist["withdrawReq"].gt(zeroBN) &&
      _existSPDepoist["withdrawReqValid"]
    ) {
      document.querySelector("#withdrawSPSummaryAmount").textContent = fromBn(
        _existSPDepoist["withdrawReq"],
      );
      let _now = getNowTime();
      let _reqTime = _existSPDepoist["withdrawReqTime"].toNumber();
      let _diffTime = _now - _reqTime;
      console.log(
        "_now=" +
          formatTimestamp(_now) +
          ",reqTime=" +
          formatTimestamp(_reqTime) +
          ",_diffSeconds=" +
          _diffTime,
      );
      document.querySelector("#withdrawSPSummarySeconds").textContent =
        "" +
        _diffTime +
        " (could be confirmed between " +
        formatTimestamp(_reqTime + SP_WITHDRAW_LOCK) +
        " and " +
        formatTimestamp(_reqTime + SP_WITHDRAW_LOCK + SP_WITHDRAW_WINDOW) +
        ")";
      if (_diffTime > SP_WITHDRAW_LOCK) {
        document.querySelector("#withdrawSPBtn").disabled = false;
      }
    } else {
      reloadPage();
    }
  };

  ///////////////////////////////////////////////////////////////////////////
  // UI listener methods for SATO staking
  ///////////////////////////////////////////////////////////////////////////

  window.claimStakingListener = async function claimStakingListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const satoStakingContract = getSatoStakingSignerContract();
    let _claimStakingSuccess = await unstakeSatoCall(
      connectedAddr,
      satoStakingContract,
      zeroBN,
    );
    if (_claimStakingSuccess) {
      reloadPage();
    }
  };

  window.stakeStakingListener = async function stakeStakingListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const satoStakingContract = getSatoStakingSignerContract();
    let _stakeAmt = inputValToBN(
      document.querySelector("#satoStakeInput").value,
    );
    if (_stakeAmt.gt(zeroBN)) {
      let _stakeStakingSuccess = await stakeSatoCall(
        connectedAddr,
        satoStakingContract,
        _stakeAmt,
      );
      if (_stakeStakingSuccess) {
        reloadPage();
      }
    } else {
      showToastMessage("Amount to stake should be above zero");
    }
  };

  window.unstakeStakingListener = async function unstakeStakingListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const satoStakingContract = getSatoStakingSignerContract();
    let _unstakeAmt = inputValToBN(
      document.querySelector("#satoStakeInput").value,
    );
    let _unstakeStakingSuccess = await unstakeSatoCall(
      connectedAddr,
      satoStakingContract,
      _unstakeAmt,
    );
    if (_unstakeStakingSuccess) {
      reloadPage();
    }
  };

  window.premiumStakingListener = async function premiumStakingListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const satoStakingContract = getSatoStakingSignerContract();
    let _premiumStakingSuccess = await premiumStakingCall(
      connectedAddr,
      satoStakingContract,
    );
    if (_premiumStakingSuccess) {
      reloadPage();
    }
  };

  ///////////////////////////////////////////////////////////////////////////
  // UI listener methods for LP mining
  ///////////////////////////////////////////////////////////////////////////

  window.approveStakeLPListener = async function approveStakeLPListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const lpTokenContract = getLpTokenSignerContract();
    let _approveSuccess = await approveTokenSpender(
      lpTokenContract,
      contractsAddresses.uniPoolAddr,
      decimal1Billion,
    );
    if (_approveSuccess) {
      document.querySelector("#approveStakeLPBtn").style["display"] = "none";
      document.querySelector("#txSuccessToastCloseBtn").click();
    }
  };

  window.claimLPRewardListener = async function claimLPRewardListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const uniPoolContract = getUniPoolSignerContract();
    let _claimLPRewardSuccess = await claimLPRewardCall(
      connectedAddr,
      uniPoolContract,
    );
    if (_claimLPRewardSuccess) {
      reloadPage();
    }
  };

  window.stakeLPListener = async function stakeLPListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const uniPoolContract = getUniPoolSignerContract();
    const lpTokenContract = getLpTokenSignerContract();
    let _stakeAmt = await lpTokenContract.balanceOf(connectedAddr);
    if (_stakeAmt.gt(zeroBN)) {
      let _stakeLPSuccess = await stakeLPCall(
        connectedAddr,
        uniPoolContract,
        _stakeAmt,
      );
      if (_stakeLPSuccess) {
        reloadPage();
      }
    } else {
      showToastMessage("LP amount to stake should be above zero");
    }
  };

  window.withdrawLPListener = async function withdrawLPListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const uniPoolContract = getUniPoolSignerContract();
    let _withdrawLPSuccess = await withdrawLPCall(
      connectedAddr,
      uniPoolContract,
    );
    if (_withdrawLPSuccess) {
      reloadPage();
    }
  };

  ///////////////////////////////////////////////////////////////////////////
  // General UI methods
  ///////////////////////////////////////////////////////////////////////////

  async function requestPersonalSign(msgToSign) {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      let connectedAddr = accounts[0];
      const msg = `0x${Buffer.from(msgToSign, "utf8").toString("hex")}`;
      const signedMessage = await window.ethereum.request({
        method: "personal_sign",
        params: [msg, connectedAddr],
      });
      console.info(
        msgToSign +
          " signed as:" +
          signedMessage +
          " by address " +
          (await utils.verifyMessage(utils.arrayify(msg), signedMessage)),
      );
      document.querySelector("#registerNotificationSignedMsg").textContent =
        signedMessage;
    } catch (err) {
      console.error(err);
    }
  }

  function reloadPage() {
    window.location.reload(false);
  }

  function showToastMessage(msg) {
    var toastLive = document.querySelector("#liveToast");
    var toast = new Toast(toastLive);

    var toastContent = document.querySelector("#toastContent");
    toastContent.textContent = msg;

    toast.show();
  }

  function showToastMessageForTxSubmit(link) {
    var toastTx = document.querySelector("#txSuccessToast");
    var toast = new Toast(toastTx);

    var toastLink = document.querySelector("#txSucessToastLink");
    toastLink.textContent =
      " Congrats! Your transaction is now on chain. Click here to check details.";
    toastLink.href = link;

    toast.show();
  }

  async function showConnectedAddress(connectedAddr) {
    const connectWalletButton = document.querySelector("#connectWalletBtn");
    connectWalletButton.textContent = formatAddress(connectedAddr);
    console.log("Connected as " + connectedAddr);

    const connectWalletHint = document.querySelector("#walletBalHint");
    connectWalletHint.textContent = "Your assets in wallet";
    let _assetBals = await getWalletAssets(connectedAddr);
    document.querySelector("#walletBTCBBal").textContent = fromBn(
      _assetBals["collBal"],
    );
    document.querySelector("#walletBTUSDBal").textContent = fromBn(
      _assetBals["debtBal"],
    );
    document.querySelector("#walletSATOBal").textContent = fromBn(
      _assetBals["growthBal"],
    );

    ///////////////////////////////////////////////////////////////////////////
    // bind UI listeners for Trove operations
    ///////////////////////////////////////////////////////////////////////////

    const _approveCollButton = document.querySelector("#approveCollBtn");
    removeAddListener(_approveCollButton, "click", window.approveCollListener);
    const _openTroveDebtIpt = document.querySelector("#openTroveDebtInput");
    removeAddListener(
      _openTroveDebtIpt,
      "change",
      window.checkOpenTroveDebtOnChange,
    );
    removeAddListener(
      _openTroveDebtIpt,
      "input",
      window.checkOpenTroveDebtOnChange,
    );
    const _openTroveModal = document.querySelector("#openTroveConfirmModal");
    removeAddListener(
      _openTroveModal,
      "show.bs.modal",
      window.openTroveModalListener,
    );
    const _openTroveConfirmBtn = document.querySelector("#openTroveBtn");
    removeAddListener(_openTroveConfirmBtn, "click", window.openTroveListener);
    const _closeTroveModal = document.querySelector("#closeTroveConfirmModal");
    removeAddListener(
      _closeTroveModal,
      "show.bs.modal",
      window.closeTroveModalListener,
    );
    const _approveDebtCloseButton = document.querySelector(
      "#approveDebtCloseBtn",
    );
    removeAddListener(
      _approveDebtCloseButton,
      "click",
      window.approveDebtCloseListener,
    );
    const _closeTroveConfirmBtn = document.querySelector("#closeTroveBtn");
    removeAddListener(
      _closeTroveConfirmBtn,
      "click",
      window.closeTroveListener,
    );
    const _adjustTroveModal = document.querySelector(
      "#adjustTroveConfirmModal",
    );
    removeAddListener(
      _adjustTroveModal,
      "show.bs.modal",
      window.adjustTroveModalListener,
    );
    const _adjustTroveCollIpt = document.querySelector(
      "#adjustTroveCollChange",
    );
    removeAddListener(
      _adjustTroveCollIpt,
      "change",
      window.adjustTroveInputListener,
    );
    removeAddListener(
      _adjustTroveCollIpt,
      "input",
      window.adjustTroveInputListener,
    );
    const _adjustTroveCollIncreaseSwitch = document.querySelector(
      "#adjustTroveAddCollSwitch",
    );
    removeAddListener(
      _adjustTroveCollIncreaseSwitch,
      "click",
      window.adjustTroveInputListener,
    );
    const _adjustTroveDebtIpt = document.querySelector(
      "#adjustTroveDebtChange",
    );
    removeAddListener(
      _adjustTroveDebtIpt,
      "change",
      window.adjustTroveInputListener,
    );
    removeAddListener(
      _adjustTroveDebtIpt,
      "input",
      window.adjustTroveInputListener,
    );
    const _approveDebtAdjustButton = document.querySelector(
      "#approveDebtAdjustBtn",
    );
    removeAddListener(
      _approveDebtAdjustButton,
      "click",
      window.approveDebtAdjustListener,
    );
    const _adjustTroveDebtIncreaseSwitch = document.querySelector(
      "#adjustTroveAddDebtSwitch",
    );
    removeAddListener(
      _adjustTroveDebtIncreaseSwitch,
      "click",
      window.adjustTroveInputListener,
    );
    const _adjustTroveConfirmBtn = document.querySelector("#adjustTroveBtn");
    removeAddListener(
      _adjustTroveConfirmBtn,
      "click",
      window.adjustTroveConfirmListener,
    );
    const _claimCollSurplusOpenTroveBtn = document.querySelector(
      "#claimCollSurplusOpenTroveBtn",
    );
    removeAddListener(
      _claimCollSurplusOpenTroveBtn,
      "click",
      window.claimCollSurplusListener,
    );
    const _claimCollSurplusAdjustTroveBtn = document.querySelector(
      "#claimCollSurplusAdjustTroveBtn",
    );
    removeAddListener(
      _claimCollSurplusAdjustTroveBtn,
      "click",
      window.claimCollSurplusListener,
    );
    const _registerNotificationBtn = document.querySelector(
      "#registerNotificationBtn",
    );
    removeAddListener(
      _registerNotificationBtn,
      "click",
      window.registerNotificationListener,
    );

    ///////////////////////////////////////////////////////////////////////////
    // bind UI listeners for Stability Pool operations
    ///////////////////////////////////////////////////////////////////////////

    const _depositSPButton = document.querySelector("#depositSPBtn");
    removeAddListener(_depositSPButton, "click", window.depositSPListener);
    const _claimSPButton = document.querySelector("#claimSPBtn");
    removeAddListener(_claimSPButton, "click", window.claimSPListener);
    const _withdrawSPRequestButton = document.querySelector(
      "#withdrawRequestSPBtn",
    );
    removeAddListener(
      _withdrawSPRequestButton,
      "click",
      window.withdrawRequestSPListener,
    );
    const _withdrawSPConfrmModal = document.querySelector(
      "#withdrawSPConfirmModal",
    );
    removeAddListener(
      _withdrawSPConfrmModal,
      "show.bs.modal",
      window.withdrawSPModalListener,
    );
    const _withdrawSPConfirmButton = document.querySelector("#withdrawSPBtn");
    removeAddListener(
      _withdrawSPConfirmButton,
      "click",
      window.withdrawSPConfirmListener,
    );

    ///////////////////////////////////////////////////////////////////////////
    // bind UI listeners for SATO Staking operations
    ///////////////////////////////////////////////////////////////////////////

    const _stakeButton = document.querySelector("#satoStakeBtn");
    removeAddListener(satoStakeBtn, "click", window.stakeStakingListener);
    const _unstakeButton = document.querySelector("#satoUnstakeBtn");
    removeAddListener(_unstakeButton, "click", window.unstakeStakingListener);
    const _claimStakingButton = document.querySelector("#claimStakingBtn");
    removeAddListener(
      _claimStakingButton,
      "click",
      window.claimStakingListener,
    );
    const _goPremiumStakingButton = document.querySelector("#satoPremiumBtn");
    removeAddListener(
      _goPremiumStakingButton,
      "click",
      window.premiumStakingListener,
    );

    ///////////////////////////////////////////////////////////////////////////
    // bind UI listeners for LP Mining operations
    ///////////////////////////////////////////////////////////////////////////
    const _approveStakeLPButton = document.querySelector("#approveStakeLPBtn");
    removeAddListener(
      _approveStakeLPButton,
      "click",
      window.approveStakeLPListener,
    );
    const _stakeLPButton = document.querySelector("#stakeLPBtn");
    removeAddListener(_stakeLPButton, "click", window.stakeLPListener);
    const _withdrawLPButton = document.querySelector("#unstakeLPBtn");
    removeAddListener(_withdrawLPButton, "click", window.withdrawLPListener);
    const _claimLPRewardButton = document.querySelector("#claimLPRewardBtn");
    removeAddListener(
      _claimLPRewardButton,
      "click",
      window.claimLPRewardListener,
    );

    const _addSATOTokenBtn = document.querySelector("#addSatoTokenBtn");
    removeAddListener(_addSATOTokenBtn, "click", window.addTokenSATOListener);

    const _addBTUSDTokenBtn = document.querySelector("#addBTUSDTokenBtn");
    removeAddListener(_addBTUSDTokenBtn, "click", window.addTokenBTUSDListener);
  }

  ///////////////////////////////////////////////////////////////////////////
  // Condition check by reading from smart contracts
  ///////////////////////////////////////////////////////////////////////////

  async function checkRecoveryModeCall(price, troveManagerContract) {
    let _inRecoveryMode = await troveManagerContract.checkRecoveryMode(price);
    return _inRecoveryMode;
  }

  async function checkStakeLPApproval(_myAddress, lpTokenContract) {
    let _approvedBal = utils.parseUnits(
      (
        await lpTokenContract.allowance(
          _myAddress,
          contractsAddresses.uniPoolAddr,
        )
      ).toString(),
      0,
    );
    let _lpBal = await lpTokenContract.balanceOf(_myAddress);
    let _needToApprove =
      _approvedBal.eq(zeroBN) || _approvedBal.lt(_lpBal)
        ? _lpBal.sub(_approvedBal).add(decimal1Billion)
        : zeroBN;
    console.log(
      _myAddress +
        " has LP allowance to UniPool=" +
        _approvedBal +
        ",lpToStake=" +
        _lpBal,
    );
    return _needToApprove;
  }

  async function checkRepayDebtApproval(
    _myAddress,
    debtToRepay,
    btUSDContract,
  ) {
    let _approvedBal = utils.parseUnits(
      (
        await btUSDContract.allowance(
          _myAddress,
          contractsAddresses.borrowerOperationsAddr,
        )
      ).toString(),
      0,
    );
    let _needToApprove = _approvedBal.lt(debtToRepay)
      ? debtToRepay.sub(_approvedBal).add(decimal1Billion)
      : zeroBN;
    console.log(
      _myAddress +
        " has debt allowance to BorrowerOperations=" +
        _approvedBal +
        ",debtToRepay=" +
        debtToRepay,
    );
    return _needToApprove;
  }

  async function checkOpenTroveCollApproval(
    _myAddress,
    collateralContract,
    _collPrice,
  ) {
    let _approvedBal = utils.parseUnits(
      (
        await collateralContract.allowance(
          _myAddress,
          contractsAddresses.borrowerOperationsAddr,
        )
      ).toString(),
      0,
    );
    let _wantDebtAmount = document.querySelector("#openTroveDebtInput").value;
    let _troveDebtAmt = checkIfNull(_wantDebtAmount)
      ? MIN_DEBT
      : utils.parseUnits(_wantDebtAmount, 18);
    let _troveCollAmt = _troveDebtAmt.mul(ACCEPTED_MIN_ICR).div(_collPrice);
    let _needToApprove = _approvedBal.lt(_troveCollAmt)
      ? _troveCollAmt
          .sub(_approvedBal)
          .add(utils.parseUnits("123456789012345", 0))
      : zeroBN;
    console.log(
      _myAddress +
        " has collateral allowance to BorrowerOperations=" +
        _approvedBal +
        ",_troveDebtAmt=" +
        _troveDebtAmt +
        ",_troveCollAmt=" +
        _troveCollAmt,
    );
    return [_needToApprove, _troveCollAmt, _troveDebtAmt];
  }

  async function checkOpenTroveDebtInputOnChange(
    _myAddress,
    collateralContract,
    _collPrice,
  ) {
    let _needToApproveAndColl = await checkOpenTroveCollApproval(
      _myAddress,
      collateralContract,
      _collPrice,
    );
    let _requiredColl = _needToApproveAndColl[1];
    let _needToApprove = _needToApproveAndColl[0];
    showApproveOpenTroveBtn(_needToApprove, _myAddress);
    let _collBN = fromBn(_requiredColl);
    console.log("required collateral to openTrove=" + _collBN);
    document.querySelector("#openTroveCollInput").value = _collBN;
  }

  function showApproveOpenTroveBtn(_needToApprove, _myAddress) {
    const approveCollBtn = document.querySelector("#approveCollBtn");
    if (_needToApprove.gt(zeroBN)) {
      console.log(
        _myAddress +
          " need to approve collateral to openTrove:" +
          _needToApprove,
      );
      approveCollBtn.style["display"] = "inline-block";
    } else {
      console.log(_myAddress + " no need to approve collateral to openTrove");
      approveCollBtn.style["display"] = "none";
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  // Subtmit transaction to blockchain
  ///////////////////////////////////////////////////////////////////////////

  async function waitSubmittedTx(_tx, _action) {
    console.log(`Transaction hash: ${_tx.hash}`);
    let _txExplorer = testnet
      ? "https://testnet.bscscan.com/tx/"
      : "https://bscscan.com/tx/";
    showToastMessageForTxSubmit(_txExplorer + _tx.hash);

    try {
      const receipt = await _tx.wait();
      console.log(
        `Transaction confirmed in block ${
          receipt.blockNumber
        } and Gas used: ${receipt.gasUsed.toString()}`,
      );
      showToastMessage(_action + " Tx Confirmed " + _txExplorer + _tx.hash);
      return true;
    } catch (err) {
      let error = JSON.parse(JSON.stringify(err));
      console.log(
        "Transaction " + _txExplorer + _tx.hash + " errored: " + error,
      );
      showToastMessage(_action + " Tx Errored " + _txExplorer + _tx.hash);
      return false;
    }
  }

  async function prepareTxParams() {
    let _gasPrice = await getGasPrice();
    return { gasPrice: _gasPrice, gasLimit: 3000000 };
  }

  /////////////////////////////////////////////////
  // Contracts Signer
  /////////////////////////////////////////////////

  function getCollateralTokenSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(
      contractsAddresses.collateralTokenAddr,
      erc20_abi,
      signer,
    );
  }

  function getSATOTokenSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(contractsAddresses.satoTokenAddr, erc20_abi, signer);
  }

  function getBTUSDSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(contractsAddresses.btUSDAddr, erc20_abi, signer);
  }

  function getLpTokenSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(contractsAddresses.lpTokenAddr, erc20_abi, signer);
  }

  function getPriceFeedSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(
      contractsAddresses.priceFeedAddr,
      priceFeed_abi,
      signer,
    );
  }

  function getBorrowerOperationsSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(
      contractsAddresses.borrowerOperationsAddr,
      borrowerOperations_abi,
      signer,
    );
  }

  function getTroveManagerSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(
      contractsAddresses.troveManagerAddr,
      troveManager_abi,
      signer,
    );
  }

  function getActivePoolSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(
      contractsAddresses.activePoolAddr,
      activePool_abi,
      signer,
    );
  }

  function getCollSurplusPoolSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(
      contractsAddresses.collSurplusPoolAddr,
      collSurplus_abi,
      signer,
    );
  }

  function getStabilityPoolSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(
      contractsAddresses.stabilityPoolAddr,
      stabilityPool_abi,
      signer,
    );
  }

  function getSatoStakingSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(
      contractsAddresses.satoStakingAddr,
      satoStaking_abi,
      signer,
    );
  }

  function getCommunityIssuanceSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(
      contractsAddresses.satoCommunityIssuanceAddr,
      communityIssuance_abi,
      signer,
    );
  }

  function getUniPoolSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(contractsAddresses.uniPoolAddr, uniPool_abi, signer);
  }

  function getChainlinkContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(
      contractsAddresses.chainlinkFeedAddr,
      chainlink_feed_abi,
      signer,
    );
  }

  function getBnbOracleRegistryContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(
      contractsAddresses.bnbOracleRegistryAddr,
      bnb_oracle_registry_abi,
      signer,
    );
  }

  /////////////////////////////////////////////////
  // Contract Interactions: General
  /////////////////////////////////////////////////

  async function approveTokenSpender(tokenContract, spender, amount) {
    let _params = await prepareTxParams();
    let _appproveTx = await tokenContract.approve(spender, amount, _params);
    let _approveTxSuccess = await waitSubmittedTx(
      _appproveTx,
      "TOKEN APPROVAL",
    );
    return _approveTxSuccess;
  }

  async function getUnderlyingPrices() {
    let chainlinkFeed = await getChainlinkContract();
    let bnbOracleRegistry = await getBnbOracleRegistryContract();
    let _p1 = (await chainlinkFeed.latestRoundData())[1];
    let _p2 = (
      await bnbOracleRegistry.latestRoundData(
        BNB_ORACLE_BASE_TOKEN,
        BNB_ORACLE_QUOTE_TOKEN,
      )
    )[1];
    console.log(
      "_p1=$" +
        fromBn(_p1.mul(decimal10)) +
        ",_p2=$" +
        fromBn(_p2.mul(decimal10)),
    );
    return {
      chainlink: _p1.mul(decimal10),
      bnbOracle: _p2.mul(decimal10),
    };
  }

  async function getSystemStatusCall(
    price,
    troveManagerContract,
    activePoolContract,
  ) {
    let _troveCnt = await troveManagerContract.getTroveOwnersCount();
    let _tcr = await troveManagerContract.getTCR(price);
    let _systemColl = await troveManagerContract.getEntireSystemColl();
    let _systemDebt = await troveManagerContract.getEntireSystemDebt();
    let _redeemedDebt = await activePoolContract.getRedeemedDebt();
    return {
      troveCount: _troveCnt,
      TCR: _tcr,
      totalColl: _systemColl,
      totalDebt: _systemDebt,
      redeemedDebt: _redeemedDebt,
    };
  }

  async function getSatoStakingStatusCall(satoStakingContract) {
    let _totalStaked = await satoStakingContract.totalSATOStaked();
    return { totalStaked: _totalStaked };
  }

  async function getStabilityPoolStatusCall(stabilityPoolContract) {
    let _totalDeposit = await stabilityPoolContract.getTotalDebtDeposits();
    return { totalDeposit: _totalDeposit };
  }

  async function getSATORewardStatusCall(communityIssuanceSignerContract) {
    let _communityIssuanceDeployTime =
      await communityIssuanceSignerContract.deploymentTime();
    return { communityIssuanceDeployTime: _communityIssuanceDeployTime };
  }

  /////////////////////////////////////////////////
  // Contract Interactions: Trove
  /////////////////////////////////////////////////

  async function getOpenTroveParamsFromInput(connectedAddr) {
    const collateralContract = getCollateralTokenSignerContract();
    const priceFeedContract = getPriceFeedSignerContract();
    const borrowerOperationsContract = getBorrowerOperationsSignerContract();
    const troveManagerContract = getTroveManagerSignerContract();
    let _collPrice = utils.parseUnits(
      (await priceFeedContract.callStatic.fetchPrice()).toString(),
      0,
    );

    let _needToApproveAndColl = await checkOpenTroveCollApproval(
      connectedAddr,
      collateralContract,
      _collPrice,
    );
    let _collInput = document.querySelector("#openTroveCollInput").value;
    if (!checkIfNull(_collInput)) {
      _collInput = toBn(_collInput.toString());
      console.log("_collInput=" + _collInput);
    }
    let _troveColl = _needToApproveAndColl[1];
    if (!checkIfNull(_collInput) && _collInput.gt(_troveColl)) {
      _troveColl = _collInput;
    }
    return [_needToApproveAndColl[2], _troveColl, _collPrice];
  }

  async function showOpenTroveSummary(
    connectedAddr,
    troveMgrContract,
    debt,
    coll,
    price,
  ) {
    let _inRecoveryMode = await checkRecoveryModeCall(price, troveMgrContract);
    let _borrowingFee = _inRecoveryMode
      ? zeroBN
      : await troveMgrContract.getBorrowingFeeWithDecayForBorrower(
          connectedAddr,
          debt,
        );
    let _totalDebt = debt.add(_borrowingFee);
    let _icr = coll.mul(price).div(_totalDebt);
    let _msg =
      connectedAddr +
      " trying to open Trove with:\ncoll=" +
      fromBn(coll) +
      "\ntotalDebt=" +
      fromBn(_totalDebt) +
      "\n_borrowingFee=" +
      fromBn(_borrowingFee) +
      "\nicr=" +
      fromBn(_icr);
    console.log(_msg);

    document.querySelector("#openTroveSummaryColl").textContent = fromBn(coll);
    document.querySelector("#openTroveSummaryDebt").textContent =
      fromBn(_totalDebt);
    document.querySelector("#openTroveSummaryFee").textContent =
      fromBn(_borrowingFee);
    document.querySelector("#openTroveSummaryPrice").textContent =
      "$" + fromBn(price);
    document.querySelector("#openTroveSummaryICR").textContent =
      icrToPercentageStr(_icr);
    document.querySelector("#openTroveSummaryICR").style["color"] =
      crToColorDisplay(_icr);
  }

  async function calculateAdjustTroveSummary(
    connectedAddr,
    troveMgrContract,
    debt,
    coll,
    icr,
    price,
  ) {
    let _inRecoveryMode = await checkRecoveryModeCall(price, troveMgrContract);
    let _collChangeBn = inputValToBN(
      document.querySelector("#adjustTroveCollChange").value,
    );
    let _isCollIncrease = document.querySelector(
      "#adjustTroveAddCollSwitch",
    ).checked;
    let _debtChangeBn = inputValToBN(
      document.querySelector("#adjustTroveDebtChange").value,
    );
    let _isDebtIncrease = document.querySelector(
      "#adjustTroveAddDebtSwitch",
    ).checked;

    if (_inRecoveryMode && !_isCollIncrease && _collChangeBn.gt(zeroBN)) {
      showToastMessage("Withdraw collateral not allowed in Recovery Mode");
      return { checkAdjustValid: false, finalAdjust: {} };
    }

    let _totalDebtChange = _debtChangeBn;
    let _borrowingFee = zeroBN;
    if (_isDebtIncrease) {
      _borrowingFee = _inRecoveryMode
        ? zeroBN
        : await troveMgrContract.getBorrowingFeeWithDecayForBorrower(
            connectedAddr,
            _debtChangeBn,
          );
      _totalDebtChange = _debtChangeBn.add(_borrowingFee);
      if (_borrowingFee.gt(zeroBN)) {
        document.querySelector("#adjustTroveSummaryFee").textContent =
          fromBn(_borrowingFee);
        document.querySelector("#adjustTroveFee").style["display"] = "block";
      } else {
        document.querySelector("#adjustTroveFee").style["display"] = "none";
      }
    } else {
      document.querySelector("#adjustTroveFee").style["display"] = "none";
    }

    let _baseCheck = baseCheckAdjustIfValid(
      debt,
      coll,
      _collChangeBn,
      _isCollIncrease,
      _totalDebtChange,
      _isDebtIncrease,
    );
    if (!_baseCheck) {
      showToastMessage("Adjust should keep trove above minimum Debt");
      document.querySelector("#adjustTroveBtn").disabled = true;
      return { checkAdjustValid: false, finalAdjust: {} };
    } else {
      document.querySelector("#adjustTroveBtn").disabled = false;
    }

    let _newTroveCollAndDebt = getNewCRForAdjustTrove(
      debt,
      coll,
      _collChangeBn,
      _isCollIncrease,
      _totalDebtChange,
      _isDebtIncrease,
      price,
    );

    document.querySelector("#adjustTroveSummaryColl").textContent = fromBn(
      _newTroveCollAndDebt[0],
    );
    document.querySelector("#adjustTroveSummaryDebt").textContent = fromBn(
      _newTroveCollAndDebt[1],
    );
    document.querySelector("#adjustTroveSummaryICR").textContent =
      icrToPercentageStr(_newTroveCollAndDebt[2]);
    document.querySelector("#adjustTroveSummaryICR").style["color"] =
      crToColorDisplay(_newTroveCollAndDebt[2]);

    let activePoolContract = await getActivePoolSignerContract();
    let _systemStatus = await getSystemStatusCall(
      price,
      troveMgrContract,
      activePoolContract,
    );
    let _newSystemCollAndDebt = getNewCRForAdjustTrove(
      _systemStatus["totalDebt"].sub(_systemStatus["redeemedDebt"]),
      _systemStatus["totalColl"],
      _collChangeBn,
      _isCollIncrease,
      _totalDebtChange,
      _isDebtIncrease,
      price,
    );

    let _msg =
      connectedAddr +
      " trying to adjust Trove with:\n collChange=" +
      fromBn(_collChangeBn) +
      "\n isCollIncrease=" +
      _isCollIncrease +
      "\n debtChange=" +
      fromBn(_debtChangeBn) +
      "\n isDebtIncrease=" +
      _isDebtIncrease +
      "\n debtIncreaseFee=" +
      fromBn(_borrowingFee) +
      "\n newColl=" +
      fromBn(_newTroveCollAndDebt[0]) +
      "\n newDebt=" +
      fromBn(_newTroveCollAndDebt[1]) +
      "\n newICR=" +
      icrToPercentageStr(_newTroveCollAndDebt[2]) +
      "\n newTCR=" +
      icrToPercentageStr(_newSystemCollAndDebt[2]);
    console.log(_msg);

    let _moreCheck = checkAdjustICRIfValid(
      _newTroveCollAndDebt[2],
      icr,
      _newSystemCollAndDebt[2],
      _inRecoveryMode,
    );
    if (!_moreCheck || _newTroveCollAndDebt[1].lt(MIN_DEBT)) {
      showToastMessage(
        "Adjust should improve the ICR (and TCR) in general and keep trove above minimum debt",
      );
      document.querySelector("#adjustTroveBtn").disabled = true;
      return { checkAdjustValid: false, finalAdjust: {} };
    } else {
      document.querySelector("#adjustTroveBtn").disabled = false;
    }
    return {
      checkAdjustValid: true,
      finalAdjust: {
        collChange: _collChangeBn,
        collIncrease: _isCollIncrease,
        debtChange: _debtChangeBn,
        debtIncrease: _isDebtIncrease,
      },
    };
  }

  async function openTroveCall(borrowerOperationsContract, debt, coll) {
    let _params = await prepareTxParams();
    console.log(
      "open Trove with debt=" + fromBn(debt) + ",coll=" + fromBn(coll),
    );
    let _openTroveTx = await borrowerOperationsContract.openTrove(
      decimal18,
      debt,
      coll,
      _params,
    );

    var _openTroveModalClose = document.querySelector(
      "#openTroveModalCloseBtn",
    );
    _openTroveModalClose.click();

    let _openTroveTxSuccess = await waitSubmittedTx(_openTroveTx, "OPEN TROVE");
    return _openTroveTxSuccess;
  }

  async function adjustTroveCall(
    borrowerOperationsContract,
    _collChange,
    _isCollIncrease,
    _debtChange,
    _isDebtIncrease,
  ) {
    let _params = await prepareTxParams();
    console.log(
      "adjust Trove:" +
        (_isDebtIncrease ? "add" : "repay") +
        " debt=" +
        fromBn(_debtChange) +
        "," +
        (_isCollIncrease ? "add" : "reduce") +
        " coll=" +
        fromBn(_collChange),
    );
    let _adjustTroveTx = await borrowerOperationsContract.adjustTrove(
      decimal18,
      _collChange,
      _isCollIncrease,
      _debtChange,
      _isDebtIncrease,
    );

    var _adjustTroveModalClose = document.querySelector(
      "#adjustTroveModalCloseBtn",
    );
    _adjustTroveModalClose.click();

    let _adjustTroveTxSuccess = await waitSubmittedTx(
      _adjustTroveTx,
      "ADJUST TROVE",
    );
    return _adjustTroveTxSuccess;
  }

  async function closeTroveCall(borrowerOperationsContract) {
    let _params = await prepareTxParams();
    let _closeTroveTx = await borrowerOperationsContract.closeTrove(_params);

    var _closeTroveModalClose = document.querySelector(
      "#closeTroveModalCloseBtn",
    );
    _closeTroveModalClose.click();

    let _closeTroveTxSuccess = await waitSubmittedTx(
      _closeTroveTx,
      "CLOSE TROVE",
    );
    return _closeTroveTxSuccess;
  }

  async function getEntireDebtAndCollCall(troveManager, myAddress) {
    let _myEntireDebtAndColl =
      await troveManager.getEntireDebtAndColl(myAddress);
    return {
      debt: _myEntireDebtAndColl[0],
      coll: _myEntireDebtAndColl[1],
      freeDebt: _myEntireDebtAndColl[6],
    };
  }

  /////////////////////////////////////////////////
  // Contract Interactions: SATO Staking
  /////////////////////////////////////////////////

  async function premiumStakingCall(connectedAddr, satoStakingContract) {
    let _params = await prepareTxParams();
    let _goPremiumTx = await satoStakingContract.goPremiumStaking();
    let _goPremiumTxSuccess = await waitSubmittedTx(
      _goPremiumTx,
      "PREMIUM STAKING",
    );
    return _goPremiumTxSuccess;
  }

  async function stakeSatoCall(connectedAddr, satoStakingContract, _stakeAmt) {
    let _params = await prepareTxParams();
    console.log("stake into SATOStaking with sato=" + fromBn(_stakeAmt));
    let _stakeTx = await satoStakingContract.stake(_stakeAmt);
    let _stakeTxSuccess = await waitSubmittedTx(_stakeTx, "STAKE SATO");
    return _stakeTxSuccess;
  }

  async function unstakeSatoCall(
    connectedAddr,
    satoStakingContract,
    _unstakeAmt,
  ) {
    let _params = await prepareTxParams();
    console.log("unstake from SATOStaking with sato=" + fromBn(_unstakeAmt));
    let _unstakeTx = await satoStakingContract.unstake(_unstakeAmt);
    let _unstakeTxSuccess = await waitSubmittedTx(_unstakeTx, "UNSTAKE SATO");
    return _unstakeTxSuccess;
  }

  async function getSatoStakingPremiumCall(satoStakingContract, myAddress) {
    let _myStake = await satoStakingContract.stakes(myAddress);
    let _myPremium = await satoStakingContract.ifPremiumStaking(myAddress);
    let _myStakingCollGain =
      await satoStakingContract.getPendingETHGain(myAddress);
    let _myStakingDebtGain =
      await satoStakingContract.getPendingLUSDGain(myAddress);
    return {
      stake: _myStake,
      premium: _myPremium,
      collGain: _myStakingCollGain,
      debtGain: _myStakingDebtGain,
    };
  }

  /////////////////////////////////////////////////
  // Contract Interactions: Stability Pool
  /////////////////////////////////////////////////

  async function depositSPCall(
    connectedAddr,
    stabilityPoolContract,
    _depositAmt,
  ) {
    let _params = await prepareTxParams();
    console.log("deposit into StabilityPool with debt=" + fromBn(_depositAmt));
    let _depositSPTx = await stabilityPoolContract.provideToSP(
      _depositAmt,
      FRONTEND_TAG,
    );
    let _depositSPTxSuccess = await waitSubmittedTx(_depositSPTx, "DEPOSIT SP");
    return _depositSPTxSuccess;
  }

  async function withdrawSPCall(
    connectedAddr,
    stabilityPoolContract,
    _withdrawAmt,
  ) {
    let _params = await prepareTxParams();
    console.log(
      "withdraw from StabilityPool with debt=" + fromBn(_withdrawAmt),
    );
    let _withdrawSPTx =
      await stabilityPoolContract.withdrawFromSP(_withdrawAmt);

    var _withdrawSPModalClose = document.querySelector(
      "#withdrawSPModalCloseBtn",
    );
    _withdrawSPModalClose.click();

    let _withdrawSPTxSuccess = await waitSubmittedTx(
      _withdrawSPTx,
      _withdrawAmt.gt(zeroBN) ? "WITHDRAW SP" : "CLAIM EARNING",
    );
    return _withdrawSPTxSuccess;
  }

  async function withdrawRequestSPCall(
    connectedAddr,
    stabilityPoolContract,
    _withdrawAmt,
  ) {
    let _params = await prepareTxParams();
    console.log(
      "withdraw request to StabilityPool with debt=" + fromBn(_withdrawAmt),
    );
    let _withdrawRequestSPTx =
      await stabilityPoolContract.requestWithdrawFromSP(_withdrawAmt);
    let _withdrawRequestSPTxSuccess = await waitSubmittedTx(
      _withdrawRequestSPTx,
      "WITHDRAW SP REQUEST",
    );
    return _withdrawRequestSPTxSuccess;
  }

  async function getStabilityPoolDepositCall(stabilityPoolContract, myAddress) {
    let _myDeposit =
      await stabilityPoolContract.getCompoundedDebtDeposit(myAddress);
    let _myDepositSATOGain =
      await stabilityPoolContract.getExpectedSATO(myAddress);
    let _myDepositCollGain =
      await stabilityPoolContract.getDepositorETHGain(myAddress);

    let _myWithdrawRequest =
      await stabilityPoolContract.existWithdrawalRequest(myAddress);
    let _myWithdrawRequestAmount = _myWithdrawRequest[0];
    let _myWithdrawRequestTime = _myWithdrawRequest[1];
    let _myWithdrawRequestValid = _myWithdrawRequest[2];
    return {
      deposit: _myDeposit,
      satoGain: _myDepositSATOGain,
      collGain: _myDepositCollGain,
      withdrawReq: _myWithdrawRequestAmount,
      withdrawReqTime: _myWithdrawRequestTime,
      withdrawReqValid: _myWithdrawRequestValid,
    };
  }

  /////////////////////////////////////////////////
  // Contract Interactions: Collateral Surplus Pool
  /////////////////////////////////////////////////

  async function getCollSurplusBalanceCall(collSurplusPoolContract, myAddress) {
    let _collSurplus = await collSurplusPoolContract.getCollateral(myAddress);
    return _collSurplus;
  }

  async function claimCollSurplusCall(
    connectedAddr,
    borrowerOperationsContract,
  ) {
    let _params = await prepareTxParams();
    console.log(connectedAddr + " claim from BorrowerOperations");
    let _claimCollSuplusTx = await borrowerOperationsContract.claimCollateral();
    let _claimCollSuplusTxSuccess = await waitSubmittedTx(
      _claimCollSuplusTx,
      "CLAIM COLLATERAL SURPLUS",
    );
    return _claimCollSuplusTxSuccess;
  }

  /////////////////////////////////////////////////
  // Contract Interactions: LP Mining
  /////////////////////////////////////////////////

  async function stakeLPCall(connectedAddr, uniPoolContract, _stakeAmt) {
    let _params = await prepareTxParams();
    console.log(
      connectedAddr + " stake into UniPool with lp=" + fromBn(_stakeAmt),
    );
    let _stakeLPTx = await uniPoolContract.stake(_stakeAmt);
    let _stakeLPTxSuccess = await waitSubmittedTx(_stakeLPTx, "STAKE LP");
    return _stakeLPTxSuccess;
  }

  async function withdrawLPCall(connectedAddr, uniPoolContract) {
    let _params = await prepareTxParams();
    console.log(connectedAddr + " withdraw from UniPool");
    let _withdrawLPTx = await uniPoolContract.withdrawAndClaim();
    let _withdrawLPTxSuccess = await waitSubmittedTx(
      _withdrawLPTx,
      "WITHDRAW LP",
    );
    return _withdrawLPTxSuccess;
  }

  async function claimLPRewardCall(connectedAddr, uniPoolContract) {
    let _params = await prepareTxParams();
    console.log(connectedAddr + " claim from UniPool");
    let _claimLPTx = await uniPoolContract.claimReward();
    let _claimLPTxSuccess = await waitSubmittedTx(
      _claimLPTx,
      "CLAIM LP REWARD",
    );
    return _claimLPTxSuccess;
  }

  async function getLPRewardCall(connectedAddr, uniPoolContract) {
    let _earnedLPReward = await uniPoolContract.earned(connectedAddr);
    console.log(connectedAddr + " got LP reward SATO=" + _earnedLPReward);
    return _earnedLPReward;
  }

  /////////////////////////////////////////////////
  // Contract Interactions: General
  /////////////////////////////////////////////////

  async function getWalletAssets(connectedAddr) {
    let _assets = {};
    const coll = getCollateralTokenSignerContract();
    const debt = getBTUSDSignerContract();
    const growth = getSATOTokenSignerContract();
    _assets["collBal"] = await coll.balanceOf(connectedAddr);
    _assets["debtBal"] = await debt.balanceOf(connectedAddr);
    _assets["growthBal"] = await growth.balanceOf(connectedAddr);
    return _assets;
  }

  /////////////////////////////////////////////////
  // JS Utilies
  /////////////////////////////////////////////////
  function checkIfNull(val) {
    return val == undefined || val == null || val == "";
  }

  function getNowTime() {
    return parseInt("" + Date.now() / 1000);
  }

  function formatTimestamp(ts) {
    return moment(ts * 1000).format("YYYY-MM-DD HH:mm:ss");
  }

  function formatAddress(originalAddr) {
    return originalAddr.substring(0, 6) + "***" + originalAddr.substring(38);
  }

  function formatTransaction(transaction) {
    return transaction.substring(0, 6) + "***" + transaction.substring(58);
  }

  /////////////////////////////////////////////////
  // HTML output
  /////////////////////////////////////////////////

  return (
    <div id="globalContainer" className="container-fluid font-grid-black">
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
        crossOrigin="anonymous"
      ></link>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
      ></link>
      <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p"
        crossOrigin="anonymous"
      ></script>
      <style jsx="true">{`
        a {
          text-decoration: none;
          border-bottom: none;
        }
        .nav-link {
          color: #059469;
        }
        .nav-pills .nav-link.active {
          background-color: #7cebb7;
        }
      `}</style>

      <div className="container">
        <div className="row justify-content-between">
          <div className="col-6">
            <h1>
              <img src="/satofi.png" alt="Satoshi Finance Logo"></img>Satoshi
              Finance
            </h1>
          </div>

          <div className="col-6">
            <span className="badge rounded-pill bg-dark topBadgePill">
              <img
                style={{ width: "18px" }}
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAACWAAAAmVCAMAAAB+zHT2AAAANlBMVEUAAAD////////////////////////////////////////////////////////////////////xY8b8AAAAEXRSTlMA3yC/EO+QcECAYDDPr1CgX8u4hQUAAJxjSURBVHja7N3RboJAEAXQUQGLoM3+/8+26UNjFWpIAMlwzk8wu5e9E9cCGdRVALCOc8nnHPOqDgUyuAYAq+hKPm3M7aNACucAYAXHhHczTcyvKZBBfQwAnpmvXurjh5AQBpwCgKVVfUnn8HtCFxKCkBDgDT5LOvfzlZAQhIQAq2tLPl0sJeFtH7vUBwCPFDRMiT+8t4RnbQDwh7+Kpn05DKQwoAsAlnKsSzpNLOpUIIODQneARwoaJjxAN5PCkCYAuKfXaeKxXEgIAz4CgAVkXF88VtAgJAQhIcAoBQ3/qrsYJCQEISHAIPPVa5dYw6VACkJCgNndSj5tjJGtwrNaSAjwTc61jfkq5esAdukaACho2My3ImM/K7tk6zOAK5gNPYmy9ZkcbH0G8BPR2wsack+o7NIpAPCAcDMHcSEhSQgJAcxX427xmpAQ3n42AUhLQcMcqr5ABkJCAAUNm5mvIroCKbQBgIKGzZT52PpMEl3wxd4dpDYMBEEA3ByFbOL9/2dDLrkGY4NbPVVPMAiP1Ls9AK6/xeystfWZDrY+AxgKXixoELaCrc8Av9x9S70EJSSkhK3PAAoaXixo8D0QhIQA7/TYfY71HCEhCAkB3uksHAeO9TQhIQgJARQ0xBU0dG91ZCQhIYD56s/t438KjbUXjPTxlxWAiypc7fIVsEXN1mdK2PoMoKBh52ypLfxhGSnjeQK4mMaChoxjuUJCStj6DOC2W1CiISSkRMojBXAZ5+5zrBRCQjoICQFcIAwqRhQSUkJICDB9vrqtII0fCBlJSAigoCFI4xE3RjoXAHOPCIXNV7Y+00KhO8Dkgoa412xbnykRdLgRIFpjehV4UKTxZ2akjHo5gHSN569zChqEhNQREgIMvUCYmWEICSmR+YABRGmcr6IKGoSE9BESAihoCHLf0EBICPCP710nd75S6E6L+wJAQUMMW58p8VgA/LB3BzkNA0EQAPcQLsRE8f8/izgBUoBw2+muekKk2KttT0/VR0EbFjRkV7pSydZn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"
              ></img>{" "}
              <a
                href="https://twitter.com/finance_sa54216"
                target="_blank"
                rel="noreferrer noopener"
              >
                SOCIAL
              </a>
            </span>
            <span className="badge rounded-pill bg-warning topBadgePill">
              <img
                style={{ height: "18px" }}
                src="data:image/png;base64,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"
              ></img>
              <a href="mailto:satoshifi@proton.me"> CONTACT</a>
            </span>
            <span className="badge rounded-pill bg-light topBadgePill">
              <img
                style={{ width: "24px" }}
                src="data:image/png;base64,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"
              ></img>
              <a
                href="https://github.com/Satoshi-Finance/security"
                target="_blank"
                rel="noreferrer noopener"
              >
                {" "}
                SECURITY
              </a>
            </span>
            <span className="badge rounded-pill bg-warning topBadgePill">
              <img
                style={{ width: "24px" }}
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAUVBMVEVHcEz9/f3////+/v7////////////////////////////Q0NGmp6ji4+P09PRsbm8AAACXmJkHDhMXGx6+v78+QUN8fn9ZW10qLjCLjI2xsbL5+iUbAAAAC3RSTlMAUJfJ7P+SDqYZHNo44zUAAAE7SURBVHgBhZMFAsMwDANL7qCkQCn/f+gWuTi8YUOWHDs5kGZ5IVLkZZp84HKVA9fb63wpL5Tn7YW8UVz2+bt85L7tl52qbmRjPWM/v+0AdO0W5VWfgXXOWZiT0psseAunwPpDkMV/08PtoFcp1+cCIQOsO4GB48/88neEewV1nEhVYg2H1/mRZrIkjz+w03zWMFVCciahQi8iAZsLhOhKU6ERai6fNQ/U5xcRy4IgIRprRgBjQ9NWFzCEh5Ea3FjNFU1j6rigoMgWk8QVHFr/BdQUmcWhDoY3FcVXk97XzAWlJqrdIkdWNQ0TpaluHDBHqxY20A9Am+tlcciu7gPi8sj1UE/tqIdL1SPmmdxOBUN5YaRUpXwtudriSTiW3GvR+tq/Fu3fsv/fOP9bj9zOzcvtr6Sltn92bP8Hp9QgAJJKuGMAAAAASUVORK5CYII="
              ></img>
              <a
                href="https://satoshi-finance.github.io/satofi.github.io/"
                target="_blank"
                rel="noreferrer noopener"
              >
                {" "}
                DOCS
              </a>
            </span>
            <span className="badge rounded-pill bg-info topBadgePill">
              <img
                style={{ width: "24px" }}
                src="data:image/webp;base64,UklGRiYLAABXRUJQVlA4TBkLAAAvP8APEFXZsbZtlTVlQC3v0+7u7u7u7u7u7u7u7u7uPpi/ateu6gns9WeFxk1kI/D27hSXF/fsfLhERBprxBQ6rkm8aKrjcAvJHYZgG4s9+xfhGQFuUyAk7xjfUYdEDllFyPkjZA7uELL+qCPcyYhP4e4+BNeQEbhMoDPc/RC5Q1ZYSkrsLmmNAHeYgDMEH4ZPgMhds5fFEL6QkAEQWcoi7BDNexG6Swoxsm0lsqRUFhlGsXcu7v5ZiG0jOZLyj+dm3Xmzu9PjS/34fChAAkAAaM7Ztm3btm3btm3btm3bbl62jZ8AL1KgyAT1YdoFeA74BfgB+A+wnOQlYYR6EZKIS3hnwHGSvyX4TfAVcJfwaYRnJxHoRRcoI9BGwGcCReKMMQJ4BWMqUDxHQAFAJQAnCH4YI2QwAvgfqCdQxKgA5QRck1Txkgqaruq+qapryq27YoSUAHaSPJEToFqAJ1KUcP6ahqruuah9qirruhIKSe0IMIMgUhRgSrBBAai0bZrdk/Zc1OEdcTsuanzLyq0HEcBSEuHDkcj7fymxkHrnom1nOvyPOrojv/07am5PKmw62RHQAKBA9wCDRdaxJ5+Z2W/tMh9JAb4Q1AmzFInNUlyBRtaio/vEzB3cEfttnOYjqacBcrlGkABwK1VmNbR+mozmo35zR7JHIflOkocLBShC8E6qHxplZWZWv5k92bqQfGph7X+AWyTKzSW1j4XfoYs4tK7DAB6TSBsKMEiKk3zOVw7d3m0qbjsDuAoUyy2gjlK00OSW+Rxa/Y3LXASlQhAEAFakSqukzctwWPVrGSsDeAmU2S2gPlKsMH849htesoDgJ1DVEIQHA7aYMuuh7SsKx35dU5Ei+AhUwC0YbWS3jW2Zk4bXLPgjULUQgOAIEss1gLdAudz6PsEXqXMqYkAr7zoD+AcoiVsEqZc0VXcNR69tZ8quBnNYmCK6RRAVcMGUVw/tuihqmVZOU2IpAlj0eLcIgmCslVJKuXHU/JOfSmDq5bkONEyKlTSzZ37U6pkL2RGMKu4RXo/gV9DAUkSNqxsaA3jxN/cIcgPemZrGKhOtD8YN4AZBLPe+B/jDLPrwaLVxmSVSgO0kQt0jCAc4aLbUljNOng80GKgsUAOgNkDtSN4SpjqAU04SzR/J24TwCV4UCZ8jC7d0JBkHQvB98ZOJyPOf78RveC2KQoREi2iQ6CxFI3P7YX501t2+Z+GSSim5lM0VX8h7ikGKAmXVg4PaxsrA+ERQJBoE5Qm+ySfCcKunaXDJ5v5cy4dp9UxaO80LWzySzzW9JU1sWZNb0t4dhdEqusb8n0Ry95ZNUIDkqwE/TTVdw6GVfd/PMHPG932fNVQ7V1R2PRjAB5jGAaUjCHRnMYJsQIsAr0WK4E9FbffBUG7nv5YY+T9gJFBSN2DEgNEf8FBESimlhqF6jkZHWz6TOqaqrGqAYARwk/AmJA8fEUEOwL6fSaqUYqh1rM7OCdZoKGcS29v4YQgnhQBLCJI6WwxGNcCfknpPNX3T0plwhpWj7+ffyR6NAM7ByO8EpiCgZneWVBmVNLpmD8+wciwq85vLrzsRwF9A5cIBBcDU6AsSLHp2n5VjVNlv84rOdlvZJVDpMDCVXFKCRc6TUY5h5Xad+f1u5VYE2UOQPMnSRX7VjjOsHNPKH7xoIC8lEdPzvC0DTQrMD9q6DCuHV5c0AlbeUyVtlwL8JjHA8zyg3IBn8oEWjiShHF754Ycs5IKyrne1zBqONXGQgwvgX5Jn8GAKAJomwZ0y7FA5/yKllsMvmtqziDp0Ed+i1qla4jBnUXZe+1iIAEZ4hCe7VaqMajgkd3AbB/zwavvGpIo0V3o5nD0S5rqnYj5jtt7UliTUgfIL7yeAKyTik7wuwRdzO3ac+EnxBSSQVG1TlYlkeys0QWCu93B2vn0D+EjyyoRPklPtyj+2E3/jIkFgKmq6E0fgN71nz5QgSJVWDvkdqd/oVuxWCEZcVTb3QnbsL9cEQWAO07YzkTSyZPNJEMjC28o44cy9SygggHWAk6kyyqGtK4rgkiHKqYdCkTS2ZrfN5+dnd8ZtnVGZ5ZD6JeCMKbOSti8TQSNrdlsJAvN4jSDT4mH+IEFgrrUndqydnKfqVBjA0flN+UXX8Xbq4D9yxK1fpvRKTCC3bWgt/Ai43dusuWAgZrkcQRfHoRaKuJ3fVJkVPfdf6owP/6+CUmXXFOIINXO3gxc05dVda1fCx3bW4/xTV5bE7fxF6E9VWTUYT6xOjs0duGjuGvqq7rlaLWsEzNzcnvx+Qy9kZcft/5uB65f6Y5NPVWkxznvT1XFwxMqJjM/KkSpnMglWdqyduGj0+KrWJIsDjhB+xFSWVZOFi0Hrl+RFnMRwsq/xY4LHosK8MYA9hK82ZVs3Xria4r3oZt/pnEE7O08T/DZjhKvSbBAYiz8jxSGDRXdz/F2Mkt907E4ae8pDlk+zexd9vZ6e/XyCHoASBG9N29+f2fxg5iAYvHphjTXVfvuPGcLJLH7QzO8UPxxQQUB0wAlTeVZNEiyyZgyCQeoX1thS7Xv4mCaaze4FY4abcvLOAA4BRfEIuknQ1fsta1Y/mDGcDFE9dewijSXlAdq3aR+z2byLdKu/nTkZoJ3nwZT4x6aCvLllrt3sKPld1/suqbGiyc7PwzDF04zBxOYN+rwrxUQAFwmP53keUCugb6a+JJnKn8zmBdZO+l7003+8KqmxoMq9TV/j/zZpmztOuHqnAXwm0cDzPI9ERMBKCVr67qbzJ9lpe/rRs5te5p+O3Cmp0dIkd7/uRuRu+nCSbbMmCld1pokRwDygsPl4MCUHnJaiDa18d9P4k6y0zV5otOym9+lr7qSqe6rt/0ev6nn+GYG7b1lrc8cPV3UniRHAARIJvNAE2Y8vRRkai6MJwlWeTdvsjx/9Uqvu2EXJpKpGoqrJZEcu6mY/DNi+jJ1cLZRt03Y2LxjxcVVDVhgBnNqEF55ETsB5MdWmxYpn8YIcm7bZdtpoNm58NVTx0Mf40fV+6OQ6abJAgaSGTCYLFNBXdXkcep2/Bqtfxkqupo5m6WybtrnT+5OeXi/l5U0R+iPbJHkazylQasDW5z+qFBta++6+mJNj09Zm25mCyVTPxdFHtrsj99d/XKGn5ae7bfemrvfDZd904R6XnwO97HXHe9eUz9npbY61aZuVHjG6ajiOijUYoK9ACwjie85hig7TYMALMRVnVaefrwnCRXauTVtrbXaOTa9gjyv/1oMfPPVzdrTpH5OZgiBtc3KstbMEgbV5M/uT0R6bVr+7MmwoQn/kuoDWS3mRwhREUBiwi+CbOcC+2v78PGX6YDK7F8z+d2Ft2rqYtjZ3Ni+YOpgMHt00E5/KyjtTpBzQOxgLYKSHKcBzkSAyQSPAqcWNKdWGupKk6/fbKI/NJm1ebk4kOXl56SmC2TDRVQefrxrSogSTuFnF6mAqBVOo5zJBDIIGu/iaxA+wnBrSrKXfoef3y3DRzYThYppgMpM/sbl5IbPsjP5kqmA2brgaMrrp5v3WVHyqMitKNDFxATyFsRKmMoSH96JIIsIBgca+muCDxOPBvsvPmurTrP7ENBefntXJ56urz0e377ePdfn56Oj71cZv13R8qicxVWdF2XlXvInEzckIXgEOE96bRCbCQ7wokwh4GIlCJO9N8k2AWwRvdmTi8XjcGHmTeVQ8Hn+UeSfBc8BlGMtI3o5ENoKIXmwShH6PoBCJViQmAjaT/ByMv2G8IvHljyI7Anz6IcnvfxawBmgEQUOCXASxCA/yXAUA"
              ></img>
              <a
                href="https://pancakeswap.finance/info/pairs/0x470c86f408401EB033855feC0c18c5a5006Fc3CB"
                target="_blank"
                rel="noreferrer noopener"
              >
                {" "}
                LIQUIDITY
              </a>
            </span>
            <span className="badge rounded-pill bg-secondary topBadgePill">
              <img
                style={{ width: "24px" }}
                src="data:image/svg+xml,%3Csvg%20fill%3D%22none%22%20height%3D%2233%22%20viewBox%3D%220%200%2035%2033%22%20width%3D%2235%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%22.25%22%3E%3Cpath%20d%3D%22m32.9582%201-13.1341%209.7183%202.4424-5.72731z%22%20fill%3D%22%23e17726%22%20stroke%3D%22%23e17726%22%2F%3E%3Cg%20fill%3D%22%23e27625%22%20stroke%3D%22%23e27625%22%3E%3Cpath%20d%3D%22m2.66296%201%2013.01714%209.809-2.3254-5.81802z%22%2F%3E%3Cpath%20d%3D%22m28.2295%2023.5335-3.4947%205.3386%207.4829%202.0603%202.1436-7.2823z%22%2F%3E%3Cpath%20d%3D%22m1.27281%2023.6501%202.13055%207.2823%207.46994-2.0603-3.48166-5.3386z%22%2F%3E%3Cpath%20d%3D%22m10.4706%2014.5149-2.0786%203.1358%207.405.3369-.2469-7.969z%22%2F%3E%3Cpath%20d%3D%22m25.1505%2014.5149-5.1575-4.58704-.1688%208.05974%207.4049-.3369z%22%2F%3E%3Cpath%20d%3D%22m10.8733%2028.8721%204.4819-2.1639-3.8583-3.0062z%22%2F%3E%3Cpath%20d%3D%22m20.2659%2026.7082%204.4689%202.1639-.6105-5.1701z%22%2F%3E%3C%2Fg%3E%3Cpath%20d%3D%22m24.7348%2028.8721-4.469-2.1639.3638%202.9025-.039%201.231z%22%20fill%3D%22%23d5bfb2%22%20stroke%3D%22%23d5bfb2%22%2F%3E%3Cpath%20d%3D%22m10.8732%2028.8721%204.1572%201.9696-.026-1.231.3508-2.9025z%22%20fill%3D%22%23d5bfb2%22%20stroke%3D%22%23d5bfb2%22%2F%3E%3Cpath%20d%3D%22m15.1084%2021.7842-3.7155-1.0884%202.6243-1.2051z%22%20fill%3D%22%23233447%22%20stroke%3D%22%23233447%22%2F%3E%3Cpath%20d%3D%22m20.5126%2021.7842%201.0913-2.2935%202.6372%201.2051z%22%20fill%3D%22%23233447%22%20stroke%3D%22%23233447%22%2F%3E%3Cpath%20d%3D%22m10.8733%2028.8721.6495-5.3386-4.13117.1167z%22%20fill%3D%22%23cc6228%22%20stroke%3D%22%23cc6228%22%2F%3E%3Cpath%20d%3D%22m24.0982%2023.5335.6366%205.3386%203.4946-5.2219z%22%20fill%3D%22%23cc6228%22%20stroke%3D%22%23cc6228%22%2F%3E%3Cpath%20d%3D%22m27.2291%2017.6507-7.405.3369.6885%203.7966%201.0913-2.2935%202.6372%201.2051z%22%20fill%3D%22%23cc6228%22%20stroke%3D%22%23cc6228%22%2F%3E%3Cpath%20d%3D%22m11.3929%2020.6958%202.6242-1.2051%201.0913%202.2935.6885-3.7966-7.40495-.3369z%22%20fill%3D%22%23cc6228%22%20stroke%3D%22%23cc6228%22%2F%3E%3Cpath%20d%3D%22m8.392%2017.6507%203.1049%206.0513-.1039-3.0062z%22%20fill%3D%22%23e27525%22%20stroke%3D%22%23e27525%22%2F%3E%3Cpath%20d%3D%22m24.2412%2020.6958-.1169%203.0062%203.1049-6.0513z%22%20fill%3D%22%23e27525%22%20stroke%3D%22%23e27525%22%2F%3E%3Cpath%20d%3D%22m15.797%2017.9876-.6886%203.7967.8704%204.4833.1949-5.9087z%22%20fill%3D%22%23e27525%22%20stroke%3D%22%23e27525%22%2F%3E%3Cpath%20d%3D%22m19.8242%2017.9876-.3638%202.3584.1819%205.9216.8704-4.4833z%22%20fill%3D%22%23e27525%22%20stroke%3D%22%23e27525%22%2F%3E%3Cpath%20d%3D%22m20.5127%2021.7842-.8704%204.4834.6236.4406%203.8584-3.0062.1169-3.0062z%22%20fill%3D%22%23f5841f%22%20stroke%3D%22%23f5841f%22%2F%3E%3Cpath%20d%3D%22m11.3929%2020.6958.104%203.0062%203.8583%203.0062.6236-.4406-.8704-4.4834z%22%20fill%3D%22%23f5841f%22%20stroke%3D%22%23f5841f%22%2F%3E%3Cpath%20d%3D%22m20.5906%2030.8417.039-1.231-.3378-.2851h-4.9626l-.3248.2851.026%201.231-4.1572-1.9696%201.4551%201.1921%202.9489%202.0344h5.0536l2.962-2.0344%201.442-1.1921z%22%20fill%3D%22%23c0ac9d%22%20stroke%3D%22%23c0ac9d%22%2F%3E%3Cpath%20d%3D%22m20.2659%2026.7082-.6236-.4406h-3.6635l-.6236.4406-.3508%202.9025.3248-.2851h4.9626l.3378.2851z%22%20fill%3D%22%23161616%22%20stroke%3D%22%23161616%22%2F%3E%3Cpath%20d%3D%22m33.5168%2011.3532%201.1043-5.36447-1.6629-4.98873-12.6923%209.3944%204.8846%204.1205%206.8983%202.0085%201.52-1.7752-.6626-.4795%201.0523-.9588-.8054-.622%201.0523-.8034z%22%20fill%3D%22%23763e1a%22%20stroke%3D%22%23763e1a%22%2F%3E%3Cpath%20d%3D%22m1%205.98873%201.11724%205.36447-.71451.5313%201.06527.8034-.80545.622%201.05228.9588-.66255.4795%201.51997%201.7752%206.89835-2.0085%204.8846-4.1205-12.69233-9.3944z%22%20fill%3D%22%23763e1a%22%20stroke%3D%22%23763e1a%22%2F%3E%3Cpath%20d%3D%22m32.0489%2016.5234-6.8983-2.0085%202.0786%203.1358-3.1049%206.0513%204.1052-.0519h6.1318z%22%20fill%3D%22%23f5841f%22%20stroke%3D%22%23f5841f%22%2F%3E%3Cpath%20d%3D%22m10.4705%2014.5149-6.89828%202.0085-2.29944%207.1267h6.11883l4.10519.0519-3.10487-6.0513z%22%20fill%3D%22%23f5841f%22%20stroke%3D%22%23f5841f%22%2F%3E%3Cpath%20d%3D%22m19.8241%2017.9876.4417-7.5932%202.0007-5.4034h-8.9119l2.0006%205.4034.4417%207.5932.1689%202.3842.013%205.8958h3.6635l.013-5.8958z%22%20fill%3D%22%23f5841f%22%20stroke%3D%22%23f5841f%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
              ></img>
              <div className="btn-group dropdown">
                <button
                  style={{
                    height: "24px",
                    padding: "0 0.55rem 0 0.55rem",
                    border: "none",
                  }}
                  type="button"
                  id="connectWalletBtn"
                  className="btn btn-outline-warning dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Connect
                </button>
                <ul id="connectedWalletBals" className="dropdown-menu">
                  <li className="dropdown-item">
                    <span id="walletBalHint" className="boldText">
                      Please connect to wallet
                    </span>
                  </li>
                  <li className="dropdown-divider"></li>
                  <li className="dropdown-item">
                    <img src="/BTCB.png"></img> BTCB:{" "}
                    <span id="walletBTCBBal"></span>
                  </li>
                  <li className="dropdown-item">
                    <img src="/btUSD.png"></img> btUSD:{" "}
                    <span id="walletBTUSDBal"></span>
                  </li>
                  <li className="dropdown-item">
                    <img src="/SATO.png"></img> SATO:{" "}
                    <span id="walletSATOBal"></span>
                  </li>
                </ul>
              </div>
            </span>
          </div>
        </div>
      </div>
      <br />

      <div className="position-fixed bottom-0 end-0 p-3">
        <div
          id="liveToast"
          className="toast"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="toast-header">
            <img
              src="/favicon.ico"
              className="rounded me-2"
              alt="Satoshi Finance Logo"
            ></img>
            <strong className="me-auto">Satoshi Finance</strong>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="toast"
              aria-label="Close"
            ></button>
          </div>
          <div className="toast-body" id="toastContent"></div>
        </div>
      </div>

      <div className="position-fixed bottom-0 end-0 p-3">
        <div
          id="txSuccessToast"
          className="toast"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="toast-header">
            <img
              src="/favicon.ico"
              className="rounded me-2"
              alt="Satoshi Finance Logo"
            ></img>
            <strong className="me-auto">Satoshi Finance</strong>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="toast"
              aria-label="Close"
              id="txSuccessToastCloseBtn"
            ></button>
          </div>
          <div className="toast-body">
            <i className="bi bi-check-circle-fill"></i>
            <a
              target="_blank"
              rel="noreferrer noopener"
              id="txSucessToastLink"
            ></a>
            <img
              style={{
                width: "16px",
                marginLeft: "0.15rem",
              }}
              src="/bscscan.png"
            ></img>
          </div>
        </div>
      </div>
      <br />

      <ul className="nav nav-pills" id="myTab" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className="nav-link active"
            id="home-tab"
            data-bs-toggle="tab"
            data-bs-target="#homeStats"
            type="button"
            role="tab"
            aria-controls="homeStats"
            aria-selected="true"
          >
            <b>Home</b>
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className="nav-link"
            id="trove-tab"
            data-bs-toggle="tab"
            data-bs-target="#troveOP"
            type="button"
            role="tab"
            aria-controls="troveOP"
            aria-selected="true"
          >
            <b>Trove</b>
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className="nav-link"
            id="btusd-tab"
            data-bs-toggle="tab"
            data-bs-target="#btusdSP"
            type="button"
            role="tab"
            aria-controls="btusdSP"
            aria-selected="false"
          >
            <b>Stability Pool</b>
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className="nav-link"
            id="sato-tab"
            data-bs-toggle="tab"
            data-bs-target="#satoSTK"
            type="button"
            role="tab"
            aria-controls="satoSTK"
            aria-selected="false"
          >
            <b>Staking </b>
            <span
              id="premiumBadge"
              className="badge rounded-pill bg-success"
              style={{ display: "none" }}
            >
              <i className="bi bi-gem"></i>
            </span>
          </button>
        </li>
      </ul>

      <ReactTooltip
        id="lpMiningTip"
        type="success"
        effect="solid"
      ></ReactTooltip>
      <ReactTooltip id="systemTCRTip" type="info" effect="solid"></ReactTooltip>
      <ReactTooltip
        id="totalSPDepositTip"
        type="info"
        effect="solid"
      ></ReactTooltip>
      <ReactTooltip
        id="totalSATOStakedTip"
        type="warning"
        effect="solid"
      ></ReactTooltip>
      <div className="tab-content" id="myTabContent">
        <div
          className="tab-pane fade show active"
          id="homeStats"
          role="tabpanel"
          aria-labelledby="home-tab"
        >
          <br />

          <div className="row">
            <div className="col-sm-3">
              <div className="card" style={{ border: "none" }}>
                <div className="card-body">
                  <h5 className="card-title">
                    Total Troves <i className="bi bi-grid-1x2-fill"></i>
                  </h5>
                  <p className="card-text" id="statsTotalTrove"></p>
                </div>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="card" style={{ border: "none" }}>
                <div className="card-body">
                  <h5 className="card-title">
                    Total Collateral <img src="/BTCB.png"></img>
                  </h5>
                  <p className="card-text" id="statsTotalCollateral"></p>
                </div>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="card" style={{ border: "none" }}>
                <div className="card-body">
                  <h5 className="card-title">
                    Total Debt{" "}
                    <img src="/btUSD.png" id="addBTUSDTokenBtn"></img>
                  </h5>
                  <p className="card-text" id="statsTotalDebt"></p>
                </div>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="card" style={{ border: "none" }}>
                <div className="card-body">
                  <h5
                    className="card-title"
                    data-tip="System will enter Recovery Mode if TCR drops below 130%"
                    data-for="systemTCRTip"
                  >
                    System TCR <i className="bi bi-speedometer"></i>
                  </h5>
                  <p className="card-text" id="statsSystemTCR"></p>
                </div>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="card" style={{ border: "none" }}>
                <div className="card-body">
                  <h5 className="card-title">
                    Collateral Price <i className="bi bi-fire"></i>
                  </h5>
                  <p className="card-text"></p>
                  <div className="btn-group dropdown">
                    <button
                      style={{
                        height: "24px",
                        padding: "0 0.55rem 0 0.55rem",
                        border: "none",
                      }}
                      type="button"
                      id="statsCollateralPrice"
                      className="btn btn-outline-warning dropdown-toggle"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    ></button>
                    <ul id="connectedWalletBals" className="dropdown-menu">
                      <li className="dropdown-item">
                        <span className="boldText">
                          Underlying Price Sources
                        </span>
                      </li>
                      <li className="dropdown-divider"></li>
                      <li className="dropdown-item">
                        <img
                          style={{
                            height: "24px",
                            marginRight: "0.6rem",
                          }}
                          src="/chainlink.png"
                        ></img>
                        <a
                          href="https://data.chain.link/feeds/bsc/mainnet/btc-usd"
                          target="_blank"
                        >
                          Chainlink:{" "}
                        </a>
                        <span id="chainlinkPrice"></span>
                      </li>
                      <li className="dropdown-item">
                        <img
                          style={{
                            width: "24px",
                            marginLeft: "-0.15rem",
                          }}
                          src="/binance.png"
                        ></img>{" "}
                        <a
                          href="https://oracle.binance.com/data-feeds/detail/bsc/BTC-USD"
                          target="_blank"
                        >
                          Binance Oracle:{" "}
                        </a>
                        <span id="bnbOraclePrice"></span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="card" style={{ border: "none" }}>
                <div className="card-body">
                  <h5
                    className="card-title"
                    data-tip="Deposit in Stability Pool will earn SATO rewards & liquidated collateral"
                    data-for="totalSPDepositTip"
                  >
                    Total Stability Pool Deposit{" "}
                    <i className="bi bi-award-fill"></i>
                  </h5>
                  <p className="card-text" id="statsTotalSPDeposit"></p>
                </div>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="card" style={{ border: "none" }}>
                <div className="card-body">
                  <h5
                    className="card-title"
                    data-tip="Staked SATO will earn protocol fee in minting and redemption"
                    data-for="totalSATOStakedTip"
                  >
                    Total SATO Staked{" "}
                    <img src="/SATO.png" id="addSatoTokenBtn"></img>
                  </h5>
                  <p className="card-text" id="statsTotalSATOStaked"></p>
                </div>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="card" style={{ border: "none" }}>
                <div className="card-body">
                  <h5
                    className="card-title"
                    data-tip="Get btUSD LP from PancakeSwap to participate in this LP Mining"
                    data-for="lpMiningTip"
                  >
                    <a
                      href="https://pancakeswap.finance/info/pairs/0x677fce0d985e870785ce63e07ae49d2d27358b78"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      LP Mining <i className="bi bi-lightning-charge-fill"></i>
                    </a>
                  </h5>
                  <div className="card-text" id="statsTotalSATOToBeMined">
                    <div className="col-auto">
                      <button
                        type="button"
                        className="btn btn-primary mb-2"
                        id="approveStakeLPBtn"
                        style={{ margin: 5 }}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn btn-success mb-2"
                        id="stakeLPBtn"
                        style={{ margin: 5 }}
                      >
                        Stake
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger mb-2"
                        id="unstakeLPBtn"
                        style={{ margin: 5 }}
                      >
                        Unstake
                      </button>
                      <button
                        type="button"
                        className="btn btn-info mb-2"
                        id="claimLPRewardBtn"
                        style={{ margin: 5 }}
                      >
                        Claim Reward
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <br />
        </div>

        <div
          className="tab-pane fade show"
          id="troveOP"
          role="tabpanel"
          aria-labelledby="trove-tab"
        >
          <br />
          <ReactTooltip
            id="approveCollTip"
            type="info"
            effect="solid"
          ></ReactTooltip>
          <div className="d-grid gap-2 col-6 mx-auto">
            <form
              id="openTroveForm"
              className="row g-2"
              style={{ display: "none" }}
            >
              <div className="col-auto">
                Trove Debt <img src="/btUSD.png"></img>
                <input
                  id="openTroveDebtInput"
                  type="number"
                  min="200"
                  className="form-control"
                  defaultValue="200"
                  placeholder="minimum 200 btUSD"
                ></input>
              </div>
              <div className="col-auto">
                Trove Collateral <img src="/BTCB.png"></img>
                <input
                  id="openTroveCollInput"
                  type="number"
                  className="form-control"
                  placeholder="minimum 110% ICR"
                ></input>
              </div>
              <div></div>
              <div className="col-auto">
                <button
                  id="approveCollBtn"
                  style={{ display: "none" }}
                  type="button"
                  className="btn btn-info mb-2"
                  data-tip="You need to approve collateral to open a trove"
                  data-for="approveCollTip"
                  style={{ margin: 2 }}
                >
                  Approve Collateral
                </button>
                <button
                  type="button"
                  className="btn btn-primary mb-2"
                  data-bs-toggle="modal"
                  data-bs-target="#openTroveConfirmModal"
                  style={{ margin: 2 }}
                >
                  Open Trove
                </button>
                <button
                  type="button"
                  className="btn btn-warning mb-2"
                  style={{ margin: 5 }}
                  id="claimCollSurplusOpenTroveBtn"
                >
                  Claim Collateral Surplus
                </button>
              </div>
            </form>
          </div>
          <br />

          <div className="d-grid gap-2 col-6 mx-auto">
            <form
              id="existTroveForm"
              className="row g-2"
              style={{ display: "none" }}
            >
              <div className="col-auto">
                <div>
                  My Trove Collateral <img src="/BTCB.png"></img>
                </div>
                <input
                  id="showTroveColl"
                  type="text"
                  className="form-control"
                  disabled
                ></input>
              </div>
              <div className="col-auto">
                <div>
                  My Trove Debt <img src="/btUSD.png"></img>
                </div>
                <input
                  id="showTroveDebt"
                  type="text"
                  className="form-control"
                  disabled
                ></input>
              </div>
              <div className="col-auto">
                My Trove ICR
                <input
                  id="showTroveICR"
                  type="text"
                  className="form-control"
                  disabled
                ></input>
              </div>
              <div></div>
              <div className="col-auto">
                <button
                  type="button"
                  className="btn btn-success mb-2"
                  data-bs-toggle="modal"
                  data-bs-target="#adjustTroveConfirmModal"
                  style={{ margin: 5 }}
                >
                  Adjust Trove
                </button>
                <button
                  type="button"
                  className="btn btn-danger mb-2"
                  data-bs-toggle="modal"
                  data-bs-target="#closeTroveConfirmModal"
                  style={{ margin: 5 }}
                >
                  Close Trove
                </button>
                <button
                  type="button"
                  className="btn btn-primary mb-2"
                  data-bs-toggle="modal"
                  data-bs-target="#registerNotificationConfirmModal"
                  style={{ margin: 5 }}
                >
                  <i className="bi bi-telegram"></i> Notification
                </button>
                <button
                  type="button"
                  className="btn btn-warning mb-2"
                  style={{ margin: 5 }}
                  id="claimCollSurplusAdjustTroveBtn"
                >
                  Claim Collateral Surplus
                </button>
              </div>
            </form>
          </div>
          <br />

          <div
            className="modal fade"
            id="openTroveConfirmModal"
            tabIndex="-1"
            aria-labelledby="openTroveConfirmModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="openTroveConfirmModalLabel">
                    <i className="bi bi-magic"></i> Open Trove Summary
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    id="openTroveModalCloseBtn"
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    <i className="bi bi-info-circle-fill"></i> Please ensure you{" "}
                    <b>understand</b> what do{" "}
                    <a
                      target="_blank"
                      href="https://satoshi-finance.github.io/satofi.github.io/btUSD%20stability%20pool%20and%20liquidation/"
                    >
                      liquidation
                    </a>{" "}
                    and{" "}
                    <a
                      target="_blank"
                      href="https://satoshi-finance.github.io/satofi.github.io/Efficient%20Redemption/"
                    >
                      redemption
                    </a>{" "}
                    mean before opening trove.
                  </p>
                  <ul className="list-group">
                    <div>
                      Trove Collateral <img src="/BTCB.png"></img>
                    </div>{" "}
                    <li
                      className="list-group-item"
                      id="openTroveSummaryColl"
                    ></li>
                    <div>
                      Trove Debt <img src="/btUSD.png"></img>
                    </div>{" "}
                    <li
                      className="list-group-item"
                      id="openTroveSummaryDebt"
                    ></li>
                    <div>
                      Fee <img src="/btUSD.png"></img>
                    </div>{" "}
                    <li
                      className="list-group-item"
                      id="openTroveSummaryFee"
                    ></li>
                    Collateral Price{" "}
                    <li
                      className="list-group-item"
                      id="openTroveSummaryPrice"
                    ></li>
                    Trove ICR{" "}
                    <li
                      className="list-group-item"
                      id="openTroveSummaryICR"
                    ></li>
                  </ul>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    id="openTroveBtn"
                    type="button"
                    className="btn btn-primary"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
          <br />

          <div
            className="modal fade"
            id="closeTroveConfirmModal"
            tabIndex="-1"
            aria-labelledby="closeTroveConfirmModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="closeTroveConfirmModalLabel">
                    <i className="bi bi-stop-circle-fill"></i> Close Trove
                    Summary
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    id="closeTroveModalCloseBtn"
                  ></button>
                </div>
                <div className="modal-body">
                  <ul className="list-group">
                    <div>
                      Trove Collateral <img src="/BTCB.png"></img>
                    </div>{" "}
                    <li
                      className="list-group-item"
                      id="closeTroveSummaryColl"
                    ></li>
                    <div>
                      Trove Debt <img src="/btUSD.png"></img>
                    </div>{" "}
                    <li
                      className="list-group-item"
                      id="closeTroveSummaryDebt"
                    ></li>
                    <div id="closeTroveFreeDebt" style={{ display: "none" }}>
                      <div>
                        Free Debt<img src="/btUSD.png"></img>
                      </div>{" "}
                      <li
                        className="list-group-item"
                        id="closeTroveSummaryFee"
                      ></li>
                    </div>
                  </ul>
                </div>
                <div className="modal-footer">
                  <button
                    id="approveDebtCloseBtn"
                    style={{ display: "none" }}
                    type="button"
                    className="btn btn-info"
                  >
                    Approve Debt
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    id="closeTroveBtn"
                    type="button"
                    className="btn btn-danger"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
          <br />

          <div
            className="modal fade"
            id="registerNotificationConfirmModal"
            tabIndex="-1"
            aria-labelledby="registerNotificationConfirmModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5
                    className="modal-title"
                    id="registerNotificationConfirmModalLabel"
                  >
                    <i className="bi bi-telegram"></i> Register Telegram
                    Notification
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <ul className="list-group">
                    <div>
                      <b>STEP[1]</b> You will be prompted to sign following
                      message as part of registration. Click confirm to start.
                    </div>{" "}
                    <li
                      className="list-group-item"
                      id="registerNotificationMsgToSign"
                    >
                      I want to register telegram notification for my Trove in
                      Satoshi Finance.
                    </li>
                    <br />
                    <div>
                      <b>STEP[2]</b> After signing, please copy-paste following
                      signed content to{" "}
                      <a target="_blank" href="https://t.me/satoTestBot">
                        our telegram bot
                      </a>
                      .
                    </div>{" "}
                    <li
                      className="list-group-item"
                      style={{ wordWrap: "break-word" }}
                      id="registerNotificationSignedMsg"
                    ></li>
                  </ul>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    id="registerNotificationBtn"
                    type="button"
                    className="btn btn-primary"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
          <br />

          <div
            className="modal fade"
            id="adjustTroveConfirmModal"
            tabIndex="-1"
            aria-labelledby="adjustTroveConfirmModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="adjustTroveConfirmModalLabel">
                    <i className="bi bi-calculator"></i> Adjust Trove Summary
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    id="adjustTroveModalCloseBtn"
                  ></button>
                </div>
                <div className="modal-body">
                  <ul className="list-group">
                    <div>
                      Trove Collateral <img src="/BTCB.png"></img>
                    </div>{" "}
                    <li
                      className="list-group-item"
                      id="adjustTroveSummaryColl"
                    ></li>
                    <div>
                      Trove Debt <img src="/btUSD.png"></img>
                    </div>{" "}
                    <li
                      className="list-group-item"
                      id="adjustTroveSummaryDebt"
                    ></li>
                    Trove ICR{" "}
                    <li
                      className="list-group-item"
                      id="adjustTroveSummaryICR"
                    ></li>
                    <div id="adjustTroveFee" style={{ display: "none" }}>
                      <div>
                        Add Debt Fee <img src="/btUSD.png"></img>
                      </div>{" "}
                      <li
                        className="list-group-item"
                        id="adjustTroveSummaryFee"
                      ></li>
                    </div>
                  </ul>
                  <br />
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="adjustTroveAddCollSwitch"
                    ></input>
                    <label
                      className="form-check-label"
                      htmlFor="adjustTroveAddCollSwitch"
                    >
                      <b id="adjustTroveCollChangeSwitchHint">
                        Withdraw Collateral
                      </b>
                    </label>
                  </div>
                  <div className="col-auto">
                    <div>
                      Collateral Change <img src="/BTCB.png"></img>
                    </div>
                    <input
                      id="adjustTroveCollChange"
                      type="number"
                      className="form-control"
                      placeholder="minimum 110% ICR"
                    ></input>
                  </div>
                  <br />
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="adjustTroveAddDebtSwitch"
                    ></input>
                    <label
                      className="form-check-label"
                      htmlFor="adjustTroveAddDebtSwitch"
                    >
                      <b id="adjustTroveDebtChangeSwitchHint">Repay Debt</b>
                    </label>
                  </div>
                  <div className="col-auto">
                    <div>
                      Debt Change <img src="/btUSD.png"></img>
                    </div>
                    <input
                      id="adjustTroveDebtChange"
                      type="number"
                      className="form-control"
                    ></input>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    id="approveDebtAdjustBtn"
                    style={{ display: "none" }}
                    type="button"
                    className="btn btn-info"
                  >
                    Approve Debt
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    id="adjustTroveBtn"
                    type="button"
                    className="btn btn-danger"
                    disabled
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
          <br />
        </div>

        <div
          className="tab-pane fade show"
          id="btusdSP"
          role="tabpanel"
          aria-labelledby="btusd-tab"
        >
          <ReactTooltip
            id="claimSPTip"
            type="info"
            effect="solid"
          ></ReactTooltip>
          <ReactTooltip
            id="spEarnedSATOTip"
            type="info"
            effect="solid"
          ></ReactTooltip>
          <ReactTooltip
            id="spEarnedCollTip"
            type="info"
            effect="solid"
          ></ReactTooltip>
          <ReactTooltip
            id="withdrawReqSecondsTip"
            type="info"
            effect="solid"
          ></ReactTooltip>
          <div className="d-grid gap-2 col-6 mx-auto">
            <br />
            <div className="col-auto">
              My Deposit <img src="/btUSD.png"></img>
              <input
                id="spDepositedInput"
                type="text"
                className="form-control"
                disabled
              ></input>
            </div>
            <form id="depositSPForm" className="col-auto">
              <div className="col-auto">
                <input
                  id="btUSDSPInput"
                  type="number"
                  className="form-control"
                  placeholder="deposit more or request to withdraw"
                ></input>
                <button
                  type="button"
                  id="depositSPBtn"
                  className="btn btn-success mb-2"
                  style={{ margin: 2 }}
                >
                  Deposit
                </button>
                <button
                  type="button"
                  id="withdrawRequestSPBtn"
                  className="btn btn-danger mb-2"
                  style={{ margin: 2 }}
                >
                  Request Withdrawal
                </button>
                <button
                  type="button"
                  id="withdrawSPPendingBtn"
                  className="btn btn-danger mb-2"
                  style={{ margin: 2 }}
                  data-bs-toggle="modal"
                  data-bs-target="#withdrawSPConfirmModal"
                  data-tip="Withdraw request could be confirmed after 30 minutes since request time"
                  data-for="withdrawReqSecondsTip"
                >
                  Pending Withdrawal
                </button>
                <button
                  type="button"
                  id="claimSPBtn"
                  className="btn btn-info mb-2"
                  style={{ margin: 2 }}
                  data-tip="Deposit and Withdraw will claim earnings as well"
                  data-for="claimSPTip"
                >
                  Claim Earning
                </button>
              </div>
            </form>
            <div className="col-auto">
              Rewarded SATO <img src="/SATO.png"></img>
              <input
                id="satoEarnedInput"
                type="text"
                className="form-control"
                disabled
                data-tip="You could stake rewarded SATO to earn protocol fees"
                data-for="spEarnedSATOTip"
              ></input>
              Earned Collateral <img src="/BTCB.png"></img>
              <input
                id="collEarnedInput"
                type="text"
                className="form-control"
                disabled
                data-tip="Collateral earned will increase when liquidation happens"
                data-for="spEarnedCollTip"
              ></input>
            </div>
          </div>
          <br />

          <div
            className="modal fade"
            id="withdrawSPConfirmModal"
            tabIndex="-1"
            aria-labelledby="withdrawSPConfirmModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="withdrawSPConfirmModalLabel">
                    <i className="bi bi-hourglass-split"></i> Pending btUSD
                    Withdrawal Summary
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    id="withdrawSPModalCloseBtn"
                  ></button>
                </div>
                <div className="modal-body">
                  <ul className="list-group">
                    btUSD Amount Of Request:{" "}
                    <li
                      className="list-group-item"
                      id="withdrawSPSummaryAmount"
                    ></li>
                    Seconds Since Request Time:{" "}
                    <li
                      className="list-group-item"
                      id="withdrawSPSummarySeconds"
                    ></li>
                  </ul>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    id="withdrawSPBtn"
                    type="button"
                    className="btn btn-danger"
                    disabled
                  >
                    Confirm Withdrawal
                  </button>
                </div>
              </div>
            </div>
          </div>
          <br />
        </div>

        <div
          className="tab-pane fade show"
          id="satoSTK"
          role="tabpanel"
          aria-labelledby="sato-tab"
        >
          <ReactTooltip
            id="satoPremiumTip"
            type="info"
            effect="solid"
          ></ReactTooltip>
          <ReactTooltip
            id="redemptionEarnedFeeTip"
            type="info"
            effect="solid"
          ></ReactTooltip>
          <ReactTooltip
            id="borrowingEarnedFeeTip"
            type="info"
            effect="solid"
          ></ReactTooltip>
          <ReactTooltip
            id="claimStakingTip"
            type="info"
            effect="solid"
          ></ReactTooltip>
          <div className="d-grid gap-2 col-6 mx-auto">
            <br />
            <div className="col-auto">
              My Stake <img src="/SATO.png"></img>
              <input
                id="satoStakedInput"
                type="number"
                className="form-control"
                disabled
              ></input>
            </div>
            <form id="satoStakeForm" className="col-auto">
              <div className="col-auto">
                <input
                  id="satoStakeInput"
                  type="number"
                  className="form-control"
                  placeholder="stake more or unstake"
                ></input>
                <button
                  type="button"
                  id="satoStakeBtn"
                  className="btn btn-success mb-2"
                  style={{ margin: 2 }}
                >
                  Stake
                </button>
                <button
                  type="button"
                  id="satoPremiumBtn"
                  className="btn btn-info mb-2"
                  style={{ margin: 2 }}
                  data-tip="Stake 1024 SATO permanently to be privileged as premium user in the system"
                  data-for="satoPremiumTip"
                >
                  Go Premium
                </button>
                <button
                  type="button"
                  id="satoUnstakeBtn"
                  className="btn btn-danger mb-2"
                  style={{ margin: 2 }}
                >
                  Unstake
                </button>
                <button
                  type="button"
                  id="claimStakingBtn"
                  className="btn btn-primary mb-2"
                  style={{ margin: 2 }}
                  data-tip="Stake and Unstake will claim earned fees as well"
                  data-for="claimStakingTip"
                >
                  Claim Fee
                </button>
              </div>
            </form>
            <div className="col-auto">
              Earned Redemption Fee <img src="/BTCB.png"></img>
              <input
                id="redemptionEarnedInput"
                type="text"
                className="form-control"
                disabled
                data-tip="Redemption fee earned will increase when btUSD redemption happens"
                data-for="redemptionEarnedFeeTip"
              ></input>
              Earned Mint Fee <img src="/btUSD.png"></img>
              <input
                id="borrowingEarnedInput"
                type="text"
                className="form-control"
                disabled
                data-tip="Borrowing fee earned will increase when btUSD mint happens"
                data-for="borrowingEarnedFeeTip"
              ></input>
            </div>
          </div>
          <br />
        </div>
      </div>
    </div>
  );
}

export default App;
