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

function App() {
  // constants
  const zeroBN = BigNumber.from("0");
  const decimal18 = utils.parseEther("1");
  const decimal1Million = utils.parseEther("1000000");
  const decimal1Billion = utils.parseEther("1000000000");
  const KING_LEVEL = 10;
  const MIN_DEBT = utils.parseUnits("200000000000000000000", 0);
  const MCR = utils.parseUnits("1100000000000000000", 0);
  const CCR = utils.parseUnits("1300000000000000000", 0);
  const ACCEPTED_MIN_ICR = utils.parseUnits("1350000000000000000", 0);
  const ZERO_ADDR = "0x0000000000000000000000000000000000000000";
  const FRONTEND_TAG = ZERO_ADDR;
  const SP_WITHDRAW_LOCK = 1800;
  const STAKING_PREMIUM = utils.parseEther("1024");
  const SP_SATO_REWARD_CAP = utils.parseEther("32000000");
  const SP_SATO_REWARD_PER_SECOND = utils.parseUnits("999998681227695000", 0);

  /////////////////////////////////////////////////
  // Smart Contracts addresses
  /////////////////////////////////////////////////
  const testnet = true;
  const contractsAddressesTestnet = {
    collateralTokenAddr: "0x5E1Be8984a9E382f0e432bec93d8d245532Bf493",
    activePoolAddr: "0x14eBf8b6bDc973DedC4716644a7ecB56717497d5",
    borrowerOperationsAddr: "0x29Dd2fA888A89A02b9cb603Ca60234D6d4f3eAf7",
    btUSDAddr: "0x245A58c8F8d5b5453f6f239c9aD9DeCdA4d408B4",
    collSurplusPoolAddr: "0x75c72883A6Dea319E0Cf4b553d2bFf00E1c06a96",
    defaultPoolAddr: "0x9068298cB437E6fbDfb35c1F6e3561e68C01Fc87",
    priceFeedAddr: "0xCEa3f851A89F3071b2570a27392f069f4097a8dC",
    stabilityPoolAddr: "0x24691F205f3E15915DBecBf97DD6593A0B9528c5",
    troveManagerAddr: "0x8daae60d22324609C6A5DC3Dcb6e7b56D9561486",
    satoTokenAddr: "0x708bAac4B235d3F62bD18e58c0594b8B20b2ED5B",
    satoStakingAddr: "0xb64EE0d54EA724753db319771791474C2EED6575",
    satoCommunityIssuanceAddr: "0x9DeFF442F3837797C7F4783393A9eFe3d5e4FDd9",
    satoLockupFactoryAddr: "0x28c0e5160AB7B821A98745A3236aD2414F5dC041",
  };
  const contractsAddresses = testnet
    ? contractsAddressesTestnet
    : contractsAddressesTestnet;

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
    '[{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newActivePoolAddress","type":"address"}],"name":"ActivePoolAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newDebtTokenAddress","type":"address"}],"name":"BTUSDTokenAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newBorrowerOperationsAddress","type":"address"}],"name":"BorrowerOperationsAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newCommunityIssuanceAddress","type":"address"}],"name":"CommunityIssuanceAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newDefaultPoolAddress","type":"address"}],"name":"DefaultPoolAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_depositor","type":"address"},{"indexed":false,"internalType":"uint256","name":"_P","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_S","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_G","type":"uint256"}],"name":"DepositSnapshotUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_depositor","type":"address"},{"indexed":false,"internalType":"uint256","name":"_ETH","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_debtLoss","type":"uint256"}],"name":"ETHGainWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint128","name":"_currentEpoch","type":"uint128"}],"name":"EpochUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"EtherSent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_frontEnd","type":"address"},{"indexed":false,"internalType":"uint256","name":"_kickbackRate","type":"uint256"}],"name":"FrontEndRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_frontEnd","type":"address"},{"indexed":false,"internalType":"uint256","name":"_P","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_G","type":"uint256"}],"name":"FrontEndSnapshotUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_frontEnd","type":"address"},{"indexed":false,"internalType":"uint256","name":"_newFrontEndStake","type":"uint256"},{"indexed":false,"internalType":"address","name":"_depositor","type":"address"}],"name":"FrontEndStakeChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_depositor","type":"address"},{"indexed":true,"internalType":"address","name":"_frontEnd","type":"address"}],"name":"FrontEndTagSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_G","type":"uint256"},{"indexed":false,"internalType":"uint128","name":"_epoch","type":"uint128"},{"indexed":false,"internalType":"uint128","name":"_scale","type":"uint128"}],"name":"G_Updated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_P","type":"uint256"}],"name":"P_Updated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newPriceFeedAddress","type":"address"}],"name":"PriceFeedAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_depositor","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amt","type":"uint256"}],"name":"SATOPaidToDepositor","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_frontEnd","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amt","type":"uint256"}],"name":"SATOPaidToFrontEnd","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_S","type":"uint256"},{"indexed":false,"internalType":"uint128","name":"_epoch","type":"uint128"},{"indexed":false,"internalType":"uint128","name":"_scale","type":"uint128"}],"name":"S_Updated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint128","name":"_currentScale","type":"uint128"}],"name":"ScaleUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_newBalance","type":"uint256"}],"name":"StabilityPoolBTUSDBalanceUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_newBalance","type":"uint256"}],"name":"StabilityPoolETHBalanceUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_newTroveManagerAddress","type":"address"}],"name":"TroveManagerAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_depositor","type":"address"},{"indexed":false,"internalType":"uint256","name":"_newDeposit","type":"uint256"}],"name":"UserDepositChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_depositor","type":"address"},{"indexed":false,"internalType":"uint256","name":"_time","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"WithdrawRequest","type":"event"},{"inputs":[],"name":"BORROWING_FEE_FLOOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"BORROWING_FEE_FLOOR_PREMIUM","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"CCR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DECIMAL_PRECISION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MCR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MIN_NET_DEBT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"NAME","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"P","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERCENT_DIVISOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PREMIUM_LIQ_RATIO","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SCALE_FACTOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SCAVENGER_REWARD_DEBT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"WITHDRAWAL_DELAY_SECONDS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_100pct","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"activePool","outputs":[{"internalType":"contract IActivePool","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"borrowerOperations","outputs":[{"internalType":"contract IBorrowerOperations","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"collateral","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"communityIssuance","outputs":[{"internalType":"contract ICommunityIssuance","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentEpoch","outputs":[{"internalType":"uint128","name":"","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentScale","outputs":[{"internalType":"uint128","name":"","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"debtToken","outputs":[{"internalType":"contract IBTUSDToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"defaultPool","outputs":[{"internalType":"contract IDefaultPool","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"depositSnapshots","outputs":[{"internalType":"uint256","name":"S","type":"uint256"},{"internalType":"uint256","name":"P","type":"uint256"},{"internalType":"uint256","name":"G","type":"uint256"},{"internalType":"uint128","name":"scale","type":"uint128"},{"internalType":"uint128","name":"epoch","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"deposits","outputs":[{"internalType":"uint256","name":"initialValue","type":"uint256"},{"internalType":"address","name":"frontEndTag","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint128","name":"","type":"uint128"},{"internalType":"uint128","name":"","type":"uint128"}],"name":"epochToScaleToG","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint128","name":"","type":"uint128"},{"internalType":"uint128","name":"","type":"uint128"}],"name":"epochToScaleToSum","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"frontEndSnapshots","outputs":[{"internalType":"uint256","name":"S","type":"uint256"},{"internalType":"uint256","name":"P","type":"uint256"},{"internalType":"uint256","name":"G","type":"uint256"},{"internalType":"uint128","name":"scale","type":"uint128"},{"internalType":"uint128","name":"epoch","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"frontEndStakes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"frontEnds","outputs":[{"internalType":"uint256","name":"kickbackRate","type":"uint256"},{"internalType":"bool","name":"registered","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_depositor","type":"address"}],"name":"getCompoundedDebtDeposit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_frontEnd","type":"address"}],"name":"getCompoundedFrontEndStake","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_depositor","type":"address"}],"name":"getDepositorETHGain","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_depositor","type":"address"}],"name":"getDepositorSATOGain","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getETH","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getEntireSystemColl","outputs":[{"internalType":"uint256","name":"entireSystemColl","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getEntireSystemDebt","outputs":[{"internalType":"uint256","name":"entireSystemDebt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_frontEnd","type":"address"}],"name":"getFrontEndSATOGain","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDebtDeposits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastETHError_Offset","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastLUSDLossError_Offset","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastSATOError","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_debtToOffset","type":"uint256"},{"internalType":"uint256","name":"_collToAdd","type":"uint256"}],"name":"offset","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"priceFeed","outputs":[{"internalType":"contract IPriceFeed","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"address","name":"_frontEndTag","type":"address"}],"name":"provideToSP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"receiveCollateral","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_kickbackRate","type":"uint256"}],"name":"registerFrontEnd","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"requestWithdrawFromSP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_borrowerOperationsAddress","type":"address"},{"internalType":"address","name":"_troveManagerAddress","type":"address"},{"internalType":"address","name":"_activePoolAddress","type":"address"},{"internalType":"address","name":"_debtTokenAddress","type":"address"},{"internalType":"address","name":"_priceFeedAddress","type":"address"},{"internalType":"address","name":"_communityIssuanceAddress","type":"address"},{"internalType":"address","name":"_collAddress","type":"address"}],"name":"setAddresses","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"troveManager","outputs":[{"internalType":"contract ITroveManager","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawETHGainToTrove","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdrawFromSP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"withdrawReqAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"withdrawReqTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]';
  const satoStaking_abi =
    '[{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_activePoolAddress","type":"address"}],"name":"ActivePoolAddressSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_debtTokenAddress","type":"address"}],"name":"BTUSDTokenAddressSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_borrowerOperationsAddress","type":"address"}],"name":"BorrowerOperationsAddressSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_account","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"EtherSent","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_F_BTUSD","type":"uint256"}],"name":"F_BTUSDUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_F_ETH","type":"uint256"}],"name":"F_ETHUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_staker","type":"address"}],"name":"PremiumStaking","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_satoTokenAddress","type":"address"}],"name":"SATOTokenAddressSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"staker","type":"address"},{"indexed":false,"internalType":"uint256","name":"newStake","type":"uint256"}],"name":"StakeChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_staker","type":"address"},{"indexed":false,"internalType":"uint256","name":"_F_ETH","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_F_BTUSD","type":"uint256"}],"name":"StakerSnapshotsUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"staker","type":"address"},{"indexed":false,"internalType":"uint256","name":"debtGain","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"ETHGain","type":"uint256"}],"name":"StakingGainsWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_totalSATOStaked","type":"uint256"}],"name":"TotalSATOStakedUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_troveManager","type":"address"}],"name":"TroveManagerAddressSet","type":"event"},{"inputs":[],"name":"DECIMAL_PRECISION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"F_ETH","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"F_LUSD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"NAME","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PREMIUM_STAKING","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"activePoolAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"borrowerOperationsAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"collateral","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"debtToken","outputs":[{"internalType":"contract IBTUSDToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"getPendingETHGain","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"getPendingLUSDGain","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_staker","type":"address"}],"name":"getStakes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"goPremiumStaking","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_staker","type":"address"}],"name":"ifPremiumStaking","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_collRedemptionFee","type":"uint256"}],"name":"increaseF_ETH","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_debtMintFee","type":"uint256"}],"name":"increaseF_LUSD","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"premiumStakers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"satoToken","outputs":[{"internalType":"contract ISATOToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_satoTokenAddress","type":"address"},{"internalType":"address","name":"_debtTokenAddress","type":"address"},{"internalType":"address","name":"_troveManagerAddress","type":"address"},{"internalType":"address","name":"_borrowerOperationsAddress","type":"address"},{"internalType":"address","name":"_activePoolAddress","type":"address"},{"internalType":"address","name":"_collAddress","type":"address"}],"name":"setAddresses","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"snapshots","outputs":[{"internalType":"uint256","name":"F_ETH_Snapshot","type":"uint256"},{"internalType":"uint256","name":"F_BTUSD_Snapshot","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"stakes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSATOStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"troveManagerAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"}]';
  const communityIssuance_abi =
    '[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_satoTokenAddress","type":"address"}],"name":"SATOTokenAddressSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_stabilityPoolAddress","type":"address"}],"name":"StabilityPoolAddressSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_totalSATOIssued","type":"uint256"}],"name":"TotalSATOIssuedUpdated","type":"event"},{"inputs":[],"name":"DECIMAL_PRECISION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ISSUANCE_FACTOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"NAME","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SATOSupplyCap","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SECONDS_IN_ONE_MINUTE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"deploymentTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"issueSATO","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"satoToken","outputs":[{"internalType":"contract ISATOToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"sendSATO","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_satoTokenAddress","type":"address"},{"internalType":"address","name":"_stabilityPoolAddress","type":"address"}],"name":"setAddresses","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"stabilityPoolAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSATOIssued","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]';
  const erc20_abi =
    '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"receivers","type":"address[]"},{"name":"amounts","type":"uint256[]"}],"name":"multiTransfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"account","type":"address"},{"name":"amount","type":"uint256"}],"name":"burnFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"value","type":"uint256"}],"name":"findOnePercent","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"basePercent","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":true,"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}]';

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

        ///////////////////////////////////////////////////////////////////////////
        // metamask events listeners
        ///////////////////////////////////////////////////////////////////////////
        ethereum.on("accountsChanged", (accounts: Array<string>) => {
          console.log("accountsChangedEvt=" + accounts[0]);
          if (!checkIfNull(accounts[0])) {
            showConnectedAddress(accounts[0]);
            checkTroveExistence();
          }
          reloadPage();
        });

        ethereum.on("chainChanged", (chainId: string) => {
          checkConnectedChain(chainId);
          checkTroveExistence();
        });
      }
    }

    getMySatoshi();
  }, []);

  ///////////////////////////////////////////////////////////////////////////
  // Satoshi utility methods
  ///////////////////////////////////////////////////////////////////////////

  function icrToPercentageStr(_icr) {
    return (Number(fromBn(_icr)) * 100).toFixed(2) + "%";
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
    _isDebtIncrease
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
    _price
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
    return [_newColl, _newDebt, _newColl.mul(_price).div(_newDebt)];
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
      showConnectedAddress(connectedAddr);

      const _troveManagerContract = getTroveManagerSignerContract();
      const _activePoolContract = getActivePoolSignerContract();
      let _stabilityPoolContract = getStabilityPoolSignerContract();
      let _satoStakingContract = getSatoStakingSignerContract();
      const _priceFeedContract = getPriceFeedSignerContract();
      const _communityIssuanceContract = getCommunityIssuanceSignerContract();
      let _collPrice = utils.parseUnits(
        (await _priceFeedContract.callStatic.fetchPrice()).toString(),
        0
      );

      ////	Global Stats initialization
      let _troveSystemStatus = await getSystemStatusCall(
        _collPrice,
        _troveManagerContract,
        _activePoolContract
      );
      let _systemTotalDebt = _troveSystemStatus["totalDebt"].sub(
        _troveSystemStatus["redeemedDebt"]
      );
      document.querySelector("#statsTotalTrove").textContent =
        _troveSystemStatus["troveCount"];
      document.querySelector("#statsSystemTCR").textContent =
        icrToPercentageStr(_troveSystemStatus["TCR"]);
      document.querySelector("#statsTotalCollateral").textContent = fromBn(
        _troveSystemStatus["totalColl"]
      );
      document.querySelector("#statsTotalDebt").textContent =
        fromBn(_systemTotalDebt);
      document.querySelector("#statsCollateralPrice").textContent =
        "$" + fromBn(_collPrice);
      let _satoStakingStatus = await getSatoStakingStatusCall(
        _satoStakingContract
      );
      document.querySelector("#statsTotalSATOStaked").textContent = fromBn(
        _satoStakingStatus["totalStaked"]
      );
      let _stabilityPoolStatus = await getStabilityPoolStatusCall(
        _stabilityPoolContract
      );
      let _spTotalDeposit = _stabilityPoolStatus["totalDeposit"];
      let _spTotalDepositPercentage = _spTotalDeposit
        .mul(decimal18)
        .div(_systemTotalDebt);
      document.querySelector("#statsTotalSPDeposit").textContent =
        fromBn(_stabilityPoolStatus["totalDeposit"]) +
        " (" +
        icrToPercentageStr(_spTotalDepositPercentage) +
        ")";
      let _satoRewardStatus = await getSATORewardStatusCall(
        _communityIssuanceContract
      );
      let _timeElapsed = toBn("" + getNowTime()).sub(
        _satoRewardStatus["communityIssuanceDeployTime"]
      );
      //let _remainingSATOFromCommunityIssuance = SP_SATO_REWARD_CAP.mul(SP_SATO_REWARD_PER_SECOND.pow(_timeElapsed))
      //document.querySelector('#statsTotalSATOToBeMined').textContent = fromBn(_remainingSATOFromCommunityIssuance)

      //// Trove UI initialization setup
      let _myTroveDebtAndColl = await getEntireDebtAndCollCall(
        _troveManagerContract,
        connectedAddr
      );
      let _alreadyHasTrove = _myTroveDebtAndColl["coll"].gt(zeroBN); //check Trove's collateral
      if (_alreadyHasTrove) {
        document.querySelector("#openTroveForm").style["display"] = "none";
        document.querySelector("#existTroveForm").style["display"] = "block";

        document.querySelector("#showTroveColl").value = fromBn(
          _myTroveDebtAndColl["coll"]
        );
        document.querySelector("#showTroveDebt").value = fromBn(
          _myTroveDebtAndColl["debt"]
        );
        let _icr = _myTroveDebtAndColl["coll"]
          .mul(_collPrice)
          .div(_myTroveDebtAndColl["debt"]);
        document.querySelector("#showTroveICR").value =
          icrToPercentageStr(_icr);

        console.log(
          connectedAddr +
            " already got Trove with debt=" +
            _myTroveDebtAndColl["debt"] +
            ",coll=" +
            _myTroveDebtAndColl["coll"] +
            ",freeDebt=" +
            _myTroveDebtAndColl["freeDebt"]
        );
      } else {
        document.querySelector("#openTroveForm").style["display"] = "block";
        document.querySelector("#existTroveForm").style["display"] = "none";
      }

      //// Stability Pool UI initialization setup
      let _existSPDepoist = await getStabilityPoolDepositCall(
        _stabilityPoolContract,
        connectedAddr
      );
      console.log(
        connectedAddr +
          " got StabilityPool deposit=" +
          JSON.stringify(_existSPDepoist)
      );
      if (_existSPDepoist["deposit"].gt(zeroBN)) {
        document.querySelector("#spDepositedInput").value = fromBn(
          _existSPDepoist["deposit"]
        );
        document.querySelector("#satoEarnedInput").value = fromBn(
          _existSPDepoist["satoGain"]
        );
        document.querySelector("#collEarnedInput").value = fromBn(
          _existSPDepoist["collGain"]
        );
        document.querySelector("#withdrawRequestSPBtn").disabled = false;
        document.querySelector("#btUSDSPInput").placeholder =
          "deposit more or request withdraw max " +
          fromBn(_existSPDepoist["deposit"]);
      } else {
        document.querySelector("#spDepositedInput").value = zeroBN;
        document.querySelector("#satoEarnedInput").value = zeroBN;
        document.querySelector("#collEarnedInput").value = zeroBN;
        document.querySelector("#withdrawRequestSPBtn").disabled = true;
      }
      if (_existSPDepoist["withdrawReq"].gt(zeroBN)) {
        document.querySelector("#withdrawRequestSPBtn").style["display"] =
          "none";
        document.querySelector("#withdrawSPPendingBtn").style["display"] =
          "inline-block";
      } else {
        document.querySelector("#withdrawRequestSPBtn").style["display"] =
          "inline-block";
        document.querySelector("#withdrawSPPendingBtn").style["display"] =
          "none";
      }

      //// SATO Staking UI initialization setup
      let _existStakingPremium = await getSatoStakingPremiumCall(
        _satoStakingContract,
        connectedAddr
      );
      console.log(
        connectedAddr +
          " got SATO Staking premium=" +
          JSON.stringify(_existStakingPremium)
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
          _existStakingPremium["stake"]
        );
        document.querySelector("#redemptionEarnedInput").value = fromBn(
          _existStakingPremium["collGain"]
        );
        document.querySelector("#borrowingEarnedInput").value = fromBn(
          _existStakingPremium["debtGain"]
        );
        let _maxToUnstake = _existStakingPremium["stake"].sub(
          _existStakingPremium["premium"] ? STAKING_PREMIUM : zeroBN
        );
        document.querySelector("#satoStakeInput").placeholder =
          "stake more or unstake max " + fromBn(_maxToUnstake);
      } else {
        document.querySelector("#satoStakedInput").value = zeroBN;
        document.querySelector("#redemptionEarnedInput").value = zeroBN;
        document.querySelector("#borrowingEarnedInput").value = zeroBN;
      }
    } // end connectedAddr not null
  }

  async function checkConnectedChain(_chainIdHex) {
    let _chainId = parseInt(_chainIdHex, 16);
    const _chainConnected = await window.ethereum.isConnected();
    console.log(
      (_chainConnected ? "Connected" : "DisConnected") +
        " to chainid=" +
        _chainId
    );

    let _correctChain = true;
    if (!testnet) {
      _correctChain = _chainId == 56 ? true : false;
    } else {
      _correctChain = _chainId == 97 ? true : false;
    }
    if (!_correctChain) {
      showToastMessage("Please connect to Binance(BNB) Smart Chain.");
    }
  }

  async function connectToMetaMask() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
      params: [],
    });
    console.log("accounts=" + accounts);
    showConnectedAddress(accounts[0]);
    await checkTroveExistence();
    return accounts[0];
  }

  ///////////////////////////////////////////////////////////////////////////
  // UI listener methods for Trove operations
  ///////////////////////////////////////////////////////////////////////////

  function removeAddListener(_element, _event, _func) {
    _element.removeEventListener(_event, _func);
    _element.addEventListener(_event, _func);
  }

  window.approveCollListener = async function approveCollListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const collateralContract = getCollateralTokenSignerContract();
    const priceFeedContract = getPriceFeedSignerContract();
    let _collPrice = utils.parseUnits(
      (await priceFeedContract.callStatic.fetchPrice()).toString(),
      0
    );

    let _needToApproveAndColl = await checkOpenTroveCollApproval(
      connectedAddr,
      collateralContract,
      _collPrice
    );
    let _approveSuccess = await approveTokenSpender(
      collateralContract,
      contractsAddresses.borrowerOperationsAddr,
      decimal1Billion.add(_needToApproveAndColl[0])
    );
    if (_approveSuccess) {
      document.querySelector("#approveCollBtn").style["display"] = "none";
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
      decimal1Billion
    );
    if (_approveSuccess) {
      document.querySelector("#approveDebtCloseBtn").style["display"] = "none";
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
        0
      );

      await checkOpenTroveDebtInputOnChange(
        connectedAddr,
        collateralContract,
        _collPrice
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
      _troveCollAndDebt[2]
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
      _troveCollAndDebt[1]
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
      connectedAddr
    );
    let _debtToApprove = await checkRepayDebtApproval(
      connectedAddr,
      _troveCollAndDebt["debt"],
      btUSDContract
    );
    if (_debtToApprove.gt(zeroBN)) {
      document.querySelector("#approveDebtCloseBtn").style["display"] = "block";
    } else {
      document.querySelector("#approveDebtCloseBtn").style["display"] = "none";
    }
    document.querySelector("#closeTroveSummaryColl").textContent = fromBn(
      _troveCollAndDebt["coll"]
    );
    document.querySelector("#closeTroveSummaryDebt").textContent = fromBn(
      _troveCollAndDebt["debt"]
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
      connectedAddr
    );
    let _debtToApprove = await checkRepayDebtApproval(
      connectedAddr,
      _troveCollAndDebt["debt"],
      btUSDContract
    );
    if (_debtToApprove.gt(zeroBN)) {
      document.querySelector("#approveDebtAdjustBtn").style["display"] =
        "block";
    } else {
      document.querySelector("#approveDebtAdjustBtn").style["display"] = "none";
    }
    document.querySelector("#adjustTroveSummaryColl").textContent = fromBn(
      _troveCollAndDebt["coll"]
    );
    document.querySelector("#adjustTroveSummaryDebt").textContent = fromBn(
      _troveCollAndDebt["debt"]
    );

    const priceFeedContract = getPriceFeedSignerContract();
    let price = utils.parseUnits(
      (await priceFeedContract.callStatic.fetchPrice()).toString(),
      0
    );
    let _icr = _troveCollAndDebt["coll"]
      .mul(price)
      .div(_troveCollAndDebt["debt"]);
    document.querySelector("#adjustTroveSummaryICR").textContent =
      icrToPercentageStr(_icr);
  };

  window.adjustTroveInputListener = async function adjustTroveInputListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const troveManagerContract = getTroveManagerSignerContract();
    let _troveCollAndDebt = await getEntireDebtAndCollCall(
      troveManagerContract,
      connectedAddr
    );

    const priceFeedContract = getPriceFeedSignerContract();
    let price = utils.parseUnits(
      (await priceFeedContract.callStatic.fetchPrice()).toString(),
      0
    );
    let _icr = _troveCollAndDebt["coll"]
      .mul(price)
      .div(_troveCollAndDebt["debt"]);

    await calculateAdjustTroveSummary(
      connectedAddr,
      troveManagerContract,
      _troveCollAndDebt["debt"],
      _troveCollAndDebt["coll"],
      _icr,
      price
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
        connectedAddr
      );

      const priceFeedContract = getPriceFeedSignerContract();
      let price = utils.parseUnits(
        (await priceFeedContract.callStatic.fetchPrice()).toString(),
        0
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
        price
      );
      if (_adjustCheckAndParams["checkAdjustValid"]) {
        const borrowerOperationsContract =
          getBorrowerOperationsSignerContract();
        let _adjustTroveSuccess = await adjustTroveCall(
          borrowerOperationsContract,
          _adjustCheckAndParams["finalAdjust"]["collChange"],
          _adjustCheckAndParams["finalAdjust"]["collIncrease"],
          _adjustCheckAndParams["finalAdjust"]["debtChange"],
          _adjustCheckAndParams["finalAdjust"]["debtIncrease"]
        );
        if (_adjustTroveSuccess) {
          reloadPage();
        }
      }
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
      document.querySelector("#btUSDSPInput").value
    );
    let _depositSuccess = await depositSPCall(
      connectedAddr,
      stabilityPoolContract,
      _depositAmt
    );
    if (_depositSuccess) {
      reloadPage();
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
      zeroBN
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
        document.querySelector("#withdrawSPSummaryAmount").textContent
      );
      let _withdrawSPSuccess = await withdrawSPCall(
        connectedAddr,
        stabilityPoolContract,
        _amtToWithdraw
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
        document.querySelector("#spDepositedInput").value
      );
      let _withdrawReqAmt = inputValToBN(
        document.querySelector("#btUSDSPInput").value
      );
      if (
        _withdrawReqAmt.gt(zeroBN) &&
        _withdrawReqAmt.lte(_maxAmtToWithdraw)
      ) {
        let _withdrawReqSPSuccess = await withdrawRequestSPCall(
          connectedAddr,
          stabilityPoolContract,
          _withdrawReqAmt
        );
        if (_withdrawReqSPSuccess) {
          reloadPage();
        }
      } else {
        showToastMessage(
          "Withdraw request should be above zero and below deposited amount"
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
      connectedAddr
    );
    if (_existSPDepoist["withdrawReq"].gt(zeroBN)) {
      document.querySelector("#withdrawSPSummaryAmount").textContent = fromBn(
        _existSPDepoist["withdrawReq"]
      );
      let _now = getNowTime();
      let _reqTime = _existSPDepoist["withdrawReqTime"].toNumber();
      let _diffTime = _now - _reqTime;
      console.log(
        "_now=" + _now + ",reqTime=" + _reqTime + ",_diffTime=" + _diffTime
      );
      document.querySelector("#withdrawSPSummarySeconds").textContent =
        "" + _diffTime;
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
      zeroBN
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
      document.querySelector("#satoStakeInput").value
    );
    if (_stakeAmt.gt(zeroBN)) {
      let _stakeStakingSuccess = await stakeSatoCall(
        connectedAddr,
        satoStakingContract,
        _stakeAmt
      );
      if (_stakeStakingSuccess) {
        reloadPage();
      }
    } else {
      showToastMessage("Staking should be above zero");
    }
  };

  window.unstakeStakingListener = async function unstakeStakingListener() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let connectedAddr = accounts[0];

    const satoStakingContract = getSatoStakingSignerContract();
    let _unstakeAmt = inputValToBN(
      document.querySelector("#satoStakeInput").value
    );
    let _unstakeStakingSuccess = await unstakeSatoCall(
      connectedAddr,
      satoStakingContract,
      _unstakeAmt
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
      satoStakingContract
    );
    if (_premiumStakingSuccess) {
      reloadPage();
    }
  };

  ///////////////////////////////////////////////////////////////////////////
  // General UI methods
  ///////////////////////////////////////////////////////////////////////////

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

  function showConnectedAddress(connectedAddr) {
    const connectWalletButton = document.querySelector("#connectWalletBtn");
    connectWalletButton.textContent = formatAddress(connectedAddr);
    console.log("Connected as " + connectedAddr);

    ///////////////////////////////////////////////////////////////////////////
    // bind UI listeners for Trove operations
    ///////////////////////////////////////////////////////////////////////////

    const _approveCollButton = document.querySelector("#approveCollBtn");
    removeAddListener(_approveCollButton, "click", window.approveCollListener);
    const _openTroveDebtIpt = document.querySelector("#openTroveDebtInput");
    removeAddListener(
      _openTroveDebtIpt,
      "change",
      window.checkOpenTroveDebtOnChange
    );
    removeAddListener(
      _openTroveDebtIpt,
      "input",
      window.checkOpenTroveDebtOnChange
    );
    const _openTroveModal = document.querySelector("#openTroveConfirmModal");
    removeAddListener(
      _openTroveModal,
      "show.bs.modal",
      window.openTroveModalListener
    );
    const _openTroveConfirmBtn = document.querySelector("#openTroveBtn");
    removeAddListener(_openTroveConfirmBtn, "click", window.openTroveListener);
    const _closeTroveModal = document.querySelector("#closeTroveConfirmModal");
    removeAddListener(
      _closeTroveModal,
      "show.bs.modal",
      window.closeTroveModalListener
    );
    const _approveDebtCloseButton = document.querySelector(
      "#approveDebtCloseBtn"
    );
    removeAddListener(
      _approveDebtCloseButton,
      "click",
      window.approveDebtCloseListener
    );
    const _closeTroveConfirmBtn = document.querySelector("#closeTroveBtn");
    removeAddListener(
      _closeTroveConfirmBtn,
      "click",
      window.closeTroveListener
    );
    const _adjustTroveModal = document.querySelector(
      "#adjustTroveConfirmModal"
    );
    removeAddListener(
      _adjustTroveModal,
      "show.bs.modal",
      window.adjustTroveModalListener
    );
    const _adjustTroveCollIpt = document.querySelector(
      "#adjustTroveCollChange"
    );
    removeAddListener(
      _adjustTroveCollIpt,
      "change",
      window.adjustTroveInputListener
    );
    removeAddListener(
      _adjustTroveCollIpt,
      "input",
      window.adjustTroveInputListener
    );
    const _adjustTroveCollIncreaseSwitch = document.querySelector(
      "#adjustTroveAddCollSwitch"
    );
    removeAddListener(
      _adjustTroveCollIncreaseSwitch,
      "click",
      window.adjustTroveInputListener
    );
    const _adjustTroveDebtIpt = document.querySelector(
      "#adjustTroveDebtChange"
    );
    removeAddListener(
      _adjustTroveDebtIpt,
      "change",
      window.adjustTroveInputListener
    );
    removeAddListener(
      _adjustTroveDebtIpt,
      "input",
      window.adjustTroveInputListener
    );
    const _adjustTroveDebtIncreaseSwitch = document.querySelector(
      "#adjustTroveAddDebtSwitch"
    );
    removeAddListener(
      _adjustTroveDebtIncreaseSwitch,
      "click",
      window.adjustTroveInputListener
    );
    const _adjustTroveConfirmBtn = document.querySelector("#adjustTroveBtn");
    removeAddListener(
      _adjustTroveConfirmBtn,
      "click",
      window.adjustTroveConfirmListener
    );

    ///////////////////////////////////////////////////////////////////////////
    // bind UI listeners for Stability Pool operations
    ///////////////////////////////////////////////////////////////////////////

    const _depositSPButton = document.querySelector("#depositSPBtn");
    removeAddListener(_depositSPButton, "click", window.depositSPListener);
    const _claimSPButton = document.querySelector("#claimSPBtn");
    removeAddListener(_claimSPButton, "click", window.claimSPListener);
    const _withdrawSPRequestButton = document.querySelector(
      "#withdrawRequestSPBtn"
    );
    removeAddListener(
      _withdrawSPRequestButton,
      "click",
      window.withdrawRequestSPListener
    );
    const _withdrawSPConfrmModal = document.querySelector(
      "#withdrawSPConfirmModal"
    );
    removeAddListener(
      _withdrawSPConfrmModal,
      "show.bs.modal",
      window.withdrawSPModalListener
    );
    const _withdrawSPConfirmButton = document.querySelector("#withdrawSPBtn");
    removeAddListener(
      _withdrawSPConfirmButton,
      "click",
      window.withdrawSPConfirmListener
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
      window.claimStakingListener
    );
    const _goPremiumStakingButton = document.querySelector("#satoPremiumBtn");
    removeAddListener(
      _goPremiumStakingButton,
      "click",
      window.premiumStakingListener
    );
  }

  ///////////////////////////////////////////////////////////////////////////
  // Condition check by reading from smart contracts
  ///////////////////////////////////////////////////////////////////////////

  async function checkRecoveryModeCall(price, troveManagerContract) {
    let _inRecoveryMode = await troveManagerContract.checkRecoveryMode(price);
    return _inRecoveryMode;
  }

  async function checkRepayDebtApproval(
    _myAddress,
    debtToRepay,
    btUSDContract
  ) {
    let _approvedBal = utils.parseUnits(
      (
        await btUSDContract.allowance(
          _myAddress,
          contractsAddresses.borrowerOperationsAddr
        )
      ).toString(),
      0
    );
    let _needToApprove = _approvedBal.lt(debtToRepay)
      ? debtToRepay.sub(_approvedBal).add(decimal1Billion)
      : zeroBN;
    console.log(
      _myAddress +
        " has debt allowance to BorrowerOperations=" +
        _approvedBal +
        ",debtToRepay=" +
        debtToRepay
    );
    return _needToApprove;
  }

  async function checkOpenTroveCollApproval(
    _myAddress,
    collateralContract,
    _collPrice
  ) {
    let _approvedBal = utils.parseUnits(
      (
        await collateralContract.allowance(
          _myAddress,
          contractsAddresses.borrowerOperationsAddr
        )
      ).toString(),
      0
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
        _troveCollAmt
    );
    return [_needToApprove, _troveCollAmt, _troveDebtAmt];
  }

  async function checkOpenTroveDebtInputOnChange(
    _myAddress,
    collateralContract,
    _collPrice
  ) {
    let _needToApproveAndColl = await checkOpenTroveCollApproval(
      _myAddress,
      collateralContract,
      _collPrice
    );
    let _needToApprove = _needToApproveAndColl[0];
    let _requiredColl = _needToApproveAndColl[1];
    if (_needToApprove.gt(zeroBN)) {
      console.log(
        _myAddress +
          " need to approve collateral to openTrove:" +
          _needToApprove
      );
      const approveCollBtn = document.querySelector("#approveCollBtn");
      approveCollBtn.style["display"] = "block";
    } else {
      console.log(_myAddress + " no need to approve collateral to openTrove");
      const approveCollBtn = document.querySelector("#approveCollBtn");
      approveCollBtn.style["display"] = "none";
    }
    let _collBN = fromBn(_requiredColl);
    console.log("required collateral to openTrove=" + _collBN);
    document.querySelector("#openTroveCollInput").value = _collBN;
  }

  ///////////////////////////////////////////////////////////////////////////
  // Subtmit transaction to blockchain
  ///////////////////////////////////////////////////////////////////////////

  async function waitSubmittedTx(_tx, _action) {
    console.log(`Transaction hash: ${_tx.hash}`);
    let _txExplorer = testnet
      ? "https://testnet.bscscan.com/tx/"
      : "https://bscscan.com/tx/";
    showToastMessage(_action + " Tx Submitted " + _txExplorer + _tx.hash);

    try {
      const receipt = await _tx.wait();
      console.log(
        `Transaction confirmed in block ${
          receipt.blockNumber
        } and Gas used: ${receipt.gasUsed.toString()}`
      );
      showToastMessage(_action + " Tx Confirmed " + _txExplorer + _tx.hash);
      return true;
    } catch (err) {
      let error = JSON.parse(JSON.stringify(err));
      console.log(
        "Transaction " + _txExplorer + _tx.hash + " errored: " + error
      );
      showToastMessage(_action + " Tx Errored " + _txExplorer + _tx.hash);
      return false;
    }
  }

  async function prepareTxParams() {
    return { gasPrice: 1 * 10e9, gasLimit: 3000000 };
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
      signer
    );
  }

  function getBTUSDSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(contractsAddresses.btUSDAddr, erc20_abi, signer);
  }

  function getPriceFeedSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(
      contractsAddresses.priceFeedAddr,
      priceFeed_abi,
      signer
    );
  }

  function getBorrowerOperationsSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(
      contractsAddresses.borrowerOperationsAddr,
      borrowerOperations_abi,
      signer
    );
  }

  function getTroveManagerSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(
      contractsAddresses.troveManagerAddr,
      troveManager_abi,
      signer
    );
  }

  function getActivePoolSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(
      contractsAddresses.activePoolAddr,
      activePool_abi,
      signer
    );
  }

  function getStabilityPoolSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(
      contractsAddresses.stabilityPoolAddr,
      stabilityPool_abi,
      signer
    );
  }

  function getSatoStakingSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(
      contractsAddresses.satoStakingAddr,
      satoStaking_abi,
      signer
    );
  }

  function getCommunityIssuanceSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(
      contractsAddresses.satoCommunityIssuanceAddr,
      communityIssuance_abi,
      signer
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
      "TOKEN APPROVAL"
    );
    return _approveTxSuccess;
  }

  async function getSystemStatusCall(
    price,
    troveManagerContract,
    activePoolContract
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
      0
    );

    let _needToApproveAndColl = await checkOpenTroveCollApproval(
      connectedAddr,
      collateralContract,
      _collPrice
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
    price
  ) {
    let _inRecoveryMode = await checkRecoveryModeCall(price, troveMgrContract);
    let _borrowingFee = _inRecoveryMode
      ? zeroBN
      : await troveMgrContract.getBorrowingFeeWithDecayForBorrower(
          connectedAddr,
          debt
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
  }

  async function calculateAdjustTroveSummary(
    connectedAddr,
    troveMgrContract,
    debt,
    coll,
    icr,
    price
  ) {
    let _inRecoveryMode = await checkRecoveryModeCall(price, troveMgrContract);
    let _collChangeBn = inputValToBN(
      document.querySelector("#adjustTroveCollChange").value
    );
    let _isCollIncrease = document.querySelector(
      "#adjustTroveAddCollSwitch"
    ).checked;
    let _debtChangeBn = inputValToBN(
      document.querySelector("#adjustTroveDebtChange").value
    );
    let _isDebtIncrease = document.querySelector(
      "#adjustTroveAddDebtSwitch"
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
            _debtChangeBn
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
      _isDebtIncrease
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
      price
    );

    document.querySelector("#adjustTroveSummaryColl").textContent = fromBn(
      _newTroveCollAndDebt[0]
    );
    document.querySelector("#adjustTroveSummaryDebt").textContent = fromBn(
      _newTroveCollAndDebt[1]
    );
    document.querySelector("#adjustTroveSummaryICR").textContent =
      icrToPercentageStr(_newTroveCollAndDebt[2]);

    let activePoolContract = await getActivePoolSignerContract();
    let _systemStatus = await getSystemStatusCall(
      price,
      troveMgrContract,
      activePoolContract
    );
    let _newSystemCollAndDebt = getNewCRForAdjustTrove(
      _systemStatus["totalDebt"].sub(_systemStatus["redeemedDebt"]),
      _systemStatus["totalColl"],
      _collChangeBn,
      _isCollIncrease,
      _totalDebtChange,
      _isDebtIncrease,
      price
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
      _inRecoveryMode
    );
    if (!_moreCheck) {
      showToastMessage("Adjust should improve the ICR (and TCR) in general");
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
      "open Trove with debt=" + fromBn(debt) + ",coll=" + fromBn(coll)
    );
    let _openTroveTx = await borrowerOperationsContract.openTrove(
      decimal18,
      debt,
      coll,
      _params
    );
    let _openTroveTxSuccess = await waitSubmittedTx(_openTroveTx, "OPEN TROVE");
    return _openTroveTxSuccess;
  }

  async function adjustTroveCall(
    borrowerOperationsContract,
    _collChange,
    _isCollIncrease,
    _debtChange,
    _isDebtIncrease
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
        fromBn(_collChange)
    );
    let _adjustTroveTx = await borrowerOperationsContract.adjustTrove(
      decimal18,
      _collChange,
      _isCollIncrease,
      _debtChange,
      _isDebtIncrease
    );
    let _adjustTroveTxSuccess = await waitSubmittedTx(
      _adjustTroveTx,
      "ADJUST TROVE"
    );
    return _adjustTroveTxSuccess;
  }

  async function closeTroveCall(borrowerOperationsContract) {
    let _params = await prepareTxParams();
    let _closeTroveTx = await borrowerOperationsContract.closeTrove(_params);
    let _closeTroveTxSuccess = await waitSubmittedTx(
      _closeTroveTx,
      "CLOSE TROVE"
    );
    return _closeTroveTxSuccess;
  }

  async function getEntireDebtAndCollCall(troveManager, myAddress) {
    let _myEntireDebtAndColl = await troveManager.getEntireDebtAndColl(
      myAddress
    );
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
      "PREMIUM STAKING"
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
    _unstakeAmt
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
    let _myStakingCollGain = await satoStakingContract.getPendingETHGain(
      myAddress
    );
    let _myStakingDebtGain = await satoStakingContract.getPendingLUSDGain(
      myAddress
    );
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
    _depositAmt
  ) {
    let _params = await prepareTxParams();
    console.log("deposit into StabilityPool with debt=" + fromBn(_depositAmt));
    let _depositSPTx = await stabilityPoolContract.provideToSP(
      _depositAmt,
      FRONTEND_TAG
    );
    let _depositSPTxSuccess = await waitSubmittedTx(_depositSPTx, "DEPOSIT SP");
    return _depositSPTxSuccess;
  }

  async function withdrawSPCall(
    connectedAddr,
    stabilityPoolContract,
    _withdrawAmt
  ) {
    let _params = await prepareTxParams();
    console.log(
      "withdraw from StabilityPool with debt=" + fromBn(_withdrawAmt)
    );
    let _withdrawSPTx = await stabilityPoolContract.withdrawFromSP(
      _withdrawAmt
    );
    let _withdrawSPTxSuccess = await waitSubmittedTx(
      _withdrawSPTx,
      _withdrawAmt.gt(zeroBN) ? "WITHDRAW SP" : "CLAIM EARNING"
    );
    return _withdrawSPTxSuccess;
  }

  async function withdrawRequestSPCall(
    connectedAddr,
    stabilityPoolContract,
    _withdrawAmt
  ) {
    let _params = await prepareTxParams();
    console.log(
      "withdraw request to StabilityPool with debt=" + fromBn(_withdrawAmt)
    );
    let _withdrawRequestSPTx =
      await stabilityPoolContract.requestWithdrawFromSP(_withdrawAmt);
    let _withdrawRequestSPTxSuccess = await waitSubmittedTx(
      _withdrawRequestSPTx,
      "WITHDRAW SP REQUEST"
    );
    return _withdrawRequestSPTxSuccess;
  }

  async function getStabilityPoolDepositCall(stabilityPoolContract, myAddress) {
    let _myDeposit = await stabilityPoolContract.getCompoundedDebtDeposit(
      myAddress
    );
    let _myDepositSATOGain = await stabilityPoolContract.getDepositorSATOGain(
      myAddress
    );
    let _myDepositCollGain = await stabilityPoolContract.getDepositorETHGain(
      myAddress
    );
    let _myWithdrawRequestAmount =
      await stabilityPoolContract.withdrawReqAmount(myAddress);
    let _myWithdrawRequestTime = await stabilityPoolContract.withdrawReqTime(
      myAddress
    );
    return {
      deposit: _myDeposit,
      satoGain: _myDepositSATOGain,
      collGain: _myDepositCollGain,
      withdrawReq: _myWithdrawRequestAmount,
      withdrawReqTime: _myWithdrawRequestTime,
    };
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
    <div id="globalContainer" class="container-fluid">
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
        crossorigin="anonymous"
      ></link>
      <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p"
        crossorigin="anonymous"
      ></script>

      
      <h1><img src="/satofi.png"
          alt="Satoshi Finance Logo"
      ></img>Satoshi Finance</h1>

      <div>
        <span class="badge rounded-pill bg-dark">
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noreferrer noopener"
          >
            TWITTER
          </a>
        </span>
        <span class="badge rounded-pill bg-warning">
          <a
            href="https://www.gitbook.com/"
            target="_blank"
            rel="noreferrer noopener"
          >
            DOCUMENTATION
          </a>
        </span>
        <span class="badge rounded-pill bg-info">
          <a
            href="https://pancakeswap.finance"
            target="_blank"
            rel="noreferrer noopener"
          >
            PANCAKESWAP
          </a>
        </span>
      </div>
      <br />

      <div class="position-fixed bottom-0 end-0 p-3">
        <div
          id="liveToast"
          class="toast"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div class="toast-header">
            <img
              src="/favicon.ico"
              class="rounded me-2"
              alt="Satoshi Finance Logo"
            ></img>
            <strong class="me-auto">Satoshi Finance</strong>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="toast"
              aria-label="Close"
            ></button>
          </div>
          <div class="toast-body" id="toastContent"></div>
        </div>
      </div>
      <br />

      <ul class="nav nav-tabs" id="myTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link active"
            id="home-tab"
            data-bs-toggle="tab"
            data-bs-target="#homeStats"
            type="button"
            role="tab"
            aria-controls="homeStats"
            aria-selected="true"
          >
            Home
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="trove-tab"
            data-bs-toggle="tab"
            data-bs-target="#troveOP"
            type="button"
            role="tab"
            aria-controls="troveOP"
            aria-selected="true"
          >
            Trove
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="btusd-tab"
            data-bs-toggle="tab"
            data-bs-target="#btusdSP"
            type="button"
            role="tab"
            aria-controls="btusdSP"
            aria-selected="false"
          >
            Stability Pool
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="sato-tab"
            data-bs-toggle="tab"
            data-bs-target="#satoSTK"
            type="button"
            role="tab"
            aria-controls="satoSTK"
            aria-selected="false"
          >
            Staking
            <span
              id="premiumBadge"
              class="badge rounded-pill bg-success"
              style={{ display: "none" }}
            >
              Premium
            </span>
          </button>
        </li>
      </ul>

      <div class="tab-content" id="myTabContent">
        <div
          class="tab-pane fade show active"
          id="homeStats"
          role="tabpanel"
          aria-labelledby="home-tab"
        >
          <br />

          <div class="row">
            <div class="col-sm-3">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Total Troves</h5>
                  <p class="card-text" id="statsTotalTrove"></p>
                </div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Total Collateral <img src="/BTCB.png"></img></h5>
                  <p class="card-text" id="statsTotalCollateral"></p>
                </div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Total Debt<img src="/btUSD.png"></img></h5>
                  <p class="card-text" id="statsTotalDebt"></p>
                </div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">System TCR</h5>
                  <p class="card-text" id="statsSystemTCR"></p>
                </div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Collateral Price</h5>
                  <p class="card-text" id="statsCollateralPrice"></p>
                </div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Total Stability Pool Deposit<img src="/btUSD.png"></img></h5>
                  <p class="card-text" id="statsTotalSPDeposit"></p>
                </div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Total SATO Staked <img src="/SATO.png"></img></h5>
                  <p class="card-text" id="statsTotalSATOStaked"></p>
                </div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Total SATO yet to be rewarded <img src="/SATO.png"></img></h5>
                  <p class="card-text" id="statsTotalSATOToBeMined"></p>
                </div>
              </div>
            </div>
          </div>
          <br />
          <div class="d-grid gap-2 col-6 mx-auto">
            <button
              type="button"
              id="connectWalletBtn"
              class="btn btn-outline-danger"
            >
              Connect Your Wallet
            </button>
          </div>
        </div>

        <div
          class="tab-pane fade show"
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
          <div class="d-grid gap-2 col-6 mx-auto">
            <form
              id="openTroveForm"
              class="row g-2"
              style={{ display: "none" }}
            >
              <div class="col-auto">
                Trove Debt<img src="/btUSD.png"></img>
                <input
                  id="openTroveDebtInput"
                  type="number"
                  min="200"
                  class="form-control"
                  defaultValue="200"
                  placeholder="minimum 200 btUSD"
                ></input>
              </div>
              <div class="col-auto">
                Trove Collateral <img src="/BTCB.png"></img>
                <input
                  id="openTroveCollInput"
                  type="number"
                  class="form-control"
                  placeholder="minimum 110% ICR"
                ></input>
              </div>
              <div></div>
              <div class="col-auto">
                <button
                  id="approveCollBtn"
                  style={{ display: "none" }}
                  type="button"
                  class="btn btn-info mb-2"
                  data-tip="You need to approve collateral"
                  data-for="approveCollTip"
                >
                  Approve Collateral
                </button>
              </div>
              <div class="col-auto">
                <button
                  type="button"
                  class="btn btn-primary mb-2"
                  data-bs-toggle="modal"
                  data-bs-target="#openTroveConfirmModal"
                >
                  Open Trove
                </button>
              </div>
            </form>
          </div>
          <br />

          <div class="d-grid gap-2 col-6 mx-auto">
            <form
              id="existTroveForm"
              class="row g-2"
              style={{ display: "none" }}
            >
              <div class="col-auto">
                <div>My Trove Collateral <img src="/BTCB.png"></img></div>
                <input
                  id="showTroveColl"
                  type="number"
                  class="form-control"
                  disabled
                ></input>
              </div>
              <div class="col-auto">
                <div>My Trove Debt<img src="/btUSD.png"></img></div>
                <input
                  id="showTroveDebt"
                  type="number"
                  class="form-control"
                  disabled
                ></input>
              </div>
              <div class="col-auto">
                My Trove ICR
                <input
                  id="showTroveICR"
                  type="text"
                  class="form-control"
                  disabled
                ></input>
              </div>
              <div></div>
              <div class="col-auto">
                <button
                  type="button"
                  class="btn btn-success mb-2"
                  data-bs-toggle="modal"
                  data-bs-target="#adjustTroveConfirmModal"
                  style={{ margin: 5 }}
                >
                  Adjust Trove
                </button>
                <button
                  type="button"
                  class="btn btn-danger mb-2"
                  data-bs-toggle="modal"
                  data-bs-target="#closeTroveConfirmModal"
                  style={{ margin: 5 }}
                >
                  Close Trove
                </button>
              </div>
            </form>
          </div>
          <br />

          <div
            class="modal fade"
            id="openTroveConfirmModal"
            tabindex="-1"
            aria-labelledby="openTroveConfirmModalLabel"
            aria-hidden="true"
          >
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="openTroveConfirmModalLabel">
                    Open Trove Summary
                  </h5>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div class="modal-body">
                  <ul class="list-group">
                    <div>Trove Collateral <img src="/BTCB.png"></img></div>{" "}
                    <li class="list-group-item" id="openTroveSummaryColl"></li>
                    <div>Trove Debt<img src="/btUSD.png"></img></div>{" "}
                    <li class="list-group-item" id="openTroveSummaryDebt"></li>
                    <div>Fee<img src="/btUSD.png"></img></div>{" "}
                    <li class="list-group-item" id="openTroveSummaryFee"></li>
                    Collateral Price{" "}
                    <li class="list-group-item" id="openTroveSummaryPrice"></li>
                    Trove ICR{" "}
                    <li class="list-group-item" id="openTroveSummaryICR"></li>
                  </ul>
                </div>
                <div class="modal-footer">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    id="openTroveBtn"
                    type="button"
                    class="btn btn-primary"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
          <br />

          <div
            class="modal fade"
            id="closeTroveConfirmModal"
            tabindex="-1"
            aria-labelledby="closeTroveConfirmModalLabel"
            aria-hidden="true"
          >
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="closeTroveConfirmModalLabel">
                    Close Trove Summary
                  </h5>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div class="modal-body">
                  <ul class="list-group">
                    <div>Trove Collateral <img src="/BTCB.png"></img></div>{" "}
                    <li class="list-group-item" id="closeTroveSummaryColl"></li>
                    <div>Trove Debt<img src="/btUSD.png"></img></div>{" "}
                    <li class="list-group-item" id="closeTroveSummaryDebt"></li>
                    <div id="closeTroveFreeDebt" style={{ display: "none" }}>
                      <div>Free Debt<img src="/btUSD.png"></img></div>{" "}
                      <li
                        class="list-group-item"
                        id="closeTroveSummaryFee"
                      ></li>
                    </div>
                  </ul>
                </div>
                <div class="modal-footer">
                  <button
                    id="approveDebtCloseBtn"
                    style={{ display: "none" }}
                    type="button"
                    class="btn btn-info"
                  >
                    Approve Debt
                  </button>
                  <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    id="closeTroveBtn"
                    type="button"
                    class="btn btn-danger"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
          <br />

          <div
            class="modal fade"
            id="adjustTroveConfirmModal"
            tabindex="-1"
            aria-labelledby="adjustTroveConfirmModalLabel"
            aria-hidden="true"
          >
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="adjustTroveConfirmModalLabel">
                    Adjust Trove Summary
                  </h5>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div class="modal-body">
                  <ul class="list-group">
                    <div>Trove Collateral <img src="/BTCB.png"></img></div>{" "}
                    <li
                      class="list-group-item"
                      id="adjustTroveSummaryColl"
                    ></li>
                    <div>Trove Debt<img src="/btUSD.png"></img></div>{" "}
                    <li
                      class="list-group-item"
                      id="adjustTroveSummaryDebt"
                    ></li>
                    Trove ICR{" "}
                    <li class="list-group-item" id="adjustTroveSummaryICR"></li>
                    <div id="adjustTroveFee" style={{ display: "none" }}>
                      <div>Add Debt Fee<img src="/btUSD.png"></img></div>{" "}
                      <li
                        class="list-group-item"
                        id="adjustTroveSummaryFee"
                      ></li>
                    </div>
                  </ul>
                  <br />
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="adjustTroveAddCollSwitch"
                    ></input>
                    <label
                      class="form-check-label"
                      for="adjustTroveAddCollSwitch"
                    >
                      Add Collateral
                    </label>
                  </div>
                  <div class="col-auto">
                    <div>Collateral Change <img src="/BTCB.png"></img></div>
                    <input
                      id="adjustTroveCollChange"
                      type="number"
                      class="form-control"
                      placeholder="minimum 110% ICR"
                    ></input>
                  </div>
                  <br />
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="adjustTroveAddDebtSwitch"
                    ></input>
                    <label
                      class="form-check-label"
                      for="adjustTroveAddDebtSwitch"
                    >
                      Add Debt
                    </label>
                  </div>
                  <div class="col-auto">
                    <div>Debt Change<img src="/btUSD.png"></img></div>
                    <input
                      id="adjustTroveDebtChange"
                      type="number"
                      class="form-control"
                    ></input>
                  </div>
                </div>
                <div class="modal-footer">
                  <button
                    id="approveDebtAdjustBtn"
                    style={{ display: "none" }}
                    type="button"
                    class="btn btn-info"
                  >
                    Approve Debt
                  </button>
                  <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    id="adjustTroveBtn"
                    type="button"
                    class="btn btn-danger"
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
          class="tab-pane fade show"
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
          <div class="d-grid gap-2 col-6 mx-auto">
            <br />
            <div class="col-auto">
              My Deposit<img src="/btUSD.png"></img> 
              <input
                id="spDepositedInput"
                type="number"
                class="form-control"
                disabled
              ></input>
            </div>
            <form id="depositSPForm" class="col-auto">
              <div class="col-auto">
                <input
                  id="btUSDSPInput"
                  type="number"
                  class="form-control"
                  placeholder="deposit more or request withdrawal"
                ></input>
                <button
                  type="button"
                  id="depositSPBtn"
                  class="btn btn-success mb-2"
                  style={{ margin: 2 }}
                >
                  Deposit
                </button>
                <button
                  type="button"
                  id="withdrawRequestSPBtn"
                  class="btn btn-danger mb-2"
                  style={{ margin: 2 }}
                >
                  Request Withdrawal
                </button>
                <button
                  type="button"
                  id="withdrawSPPendingBtn"
                  class="btn btn-danger mb-2"
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
                  class="btn btn-info mb-2"
                  style={{ margin: 2 }}
                  data-tip="Deposit and Withdraw will claim earnings as well"
                  data-for="claimSPTip"
                >
                  Claim Earning
                </button>
              </div>
            </form>
            <div class="col-auto">
              Earned SATO <img src="/SATO.png"></img>
              <input
                id="satoEarnedInput"
                type="text"
                class="form-control"
                disabled
                data-tip="Shown earned SATO may be less than what is claimable"
                data-for="spEarnedSATOTip"
              ></input>
              Earned Collateral <img src="/BTCB.png"></img>
              <input
                id="collEarnedInput"
                type="text"
                class="form-control"
                disabled
                data-tip="Collateral earned will increase when liquidation happens"
                data-for="spEarnedCollTip"
              ></input>
            </div>
          </div>
          <br />

          <div
            class="modal fade"
            id="withdrawSPConfirmModal"
            tabindex="-1"
            aria-labelledby="withdrawSPConfirmModalLabel"
            aria-hidden="true"
          >
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="withdrawSPConfirmModalLabel">
                    Pending btUSD Withdrawal Summary
                  </h5>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div class="modal-body">
                  <ul class="list-group">
                    btUSD Amount Of Request:{" "}
                    <li
                      class="list-group-item"
                      id="withdrawSPSummaryAmount"
                    ></li>
                    Seconds Since Request Time:{" "}
                    <li
                      class="list-group-item"
                      id="withdrawSPSummarySeconds"
                    ></li>
                  </ul>
                </div>
                <div class="modal-footer">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    id="withdrawSPBtn"
                    type="button"
                    class="btn btn-danger"
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
          class="tab-pane fade show"
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
          <div class="d-grid gap-2 col-6 mx-auto">
            <br />
            <div class="col-auto">
              My Stake <img src="/SATO.png"></img>
              <input
                id="satoStakedInput"
                type="number"
                class="form-control"
                disabled
              ></input>
            </div>
            <form id="satoStakeForm" class="col-auto">
              <div class="col-auto">
                <input
                  id="satoStakeInput"
                  type="number"
                  class="form-control"
                  placeholder="stake more or unstake"
                ></input>
                <button
                  type="button"
                  id="satoStakeBtn"
                  class="btn btn-success mb-2"
                  style={{ margin: 2 }}
                >
                  Stake
                </button>
                <button
                  type="button"
                  id="satoPremiumBtn"
                  class="btn btn-info mb-2"
                  style={{ margin: 2 }}
                  data-tip="Stake 1024 SATO permanently to be privileged as premium user in the system"
                  data-for="satoPremiumTip"
                >
                  Go Premium
                </button>
                <button
                  type="button"
                  id="satoUnstakeBtn"
                  class="btn btn-danger mb-2"
                  style={{ margin: 2 }}
                >
                  Unstake
                </button>
                <button
                  type="button"
                  id="claimStakingBtn"
                  class="btn btn-primary mb-2"
                  style={{ margin: 2 }}
                  data-tip="Stake and Unstake will claim fees as well"
                  data-for="claimStakingTip"
                >
                  Claim Fee
                </button>
              </div>
            </form>
            <div class="col-auto">
              Earned Redemption Fee <img src="/BTCB.png"></img>
              <input
                id="redemptionEarnedInput"
                type="text"
                class="form-control"
                disabled
                data-tip="Redemption fee earned will increase when redemption happens"
                data-for="redemptionEarnedFeeTip"
              ></input>
              Earned Borrowing Fee<img src="/btUSD.png"></img>
              <input
                id="borrowingEarnedInput"
                type="text"
                class="form-control"
                disabled
                data-tip="Borrowing fee earned will increase when debt borrowing happens"
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