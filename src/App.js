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
    uniPoolAddr: "0xFCd61Cd94bCB3191ef4719c7322B93932237861b",
    lpTokenAddr: "0x245A58c8F8d5b5453f6f239c9aD9DeCdA4d408B4",
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
  const uniPool_abi =
    '[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"}],"name":"RewardAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"}],"name":"RewardPaid","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_satoTokenAddress","type":"address"}],"name":"SATOTokenAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_uniTokenAddress","type":"address"}],"name":"UniTokenAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"NAME","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimReward","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"duration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"earned","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastTimeRewardApplicable","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastUpdateTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"periodFinish","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rewardPerToken","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rewardPerTokenStored","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rewardRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"rewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"satoToken","outputs":[{"internalType":"contract ISATOToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_satoTokenAddress","type":"address"},{"internalType":"address","name":"_uniTokenAddress","type":"address"},{"internalType":"uint256","name":"_duration","type":"uint256"}],"name":"setParams","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"uniToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userRewardPerTokenPaid","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawAndClaim","outputs":[],"stateMutability":"nonpayable","type":"function"}]';
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
      const _collateralTokenContract = getCollateralTokenSignerContract();
      let _stabilityPoolContract = getStabilityPoolSignerContract();
      let _satoStakingContract = getSatoStakingSignerContract();
      const _priceFeedContract = getPriceFeedSignerContract();
      const _communityIssuanceContract = getCommunityIssuanceSignerContract();
      const _lpTokenContract = getLpTokenSignerContract();
      const _uniPoolContract = getUniPoolSignerContract();
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
        document.querySelector("#openTroveForm").style["display"] =
          "inline-block";
        document.querySelector("#existTroveForm").style["display"] = "none";
        let _needToApprove = await checkOpenTroveCollApproval(
          connectedAddr,
          _collateralTokenContract,
          _collPrice
        );
        showApproveOpenTroveBtn(_needToApprove[0], connectedAddr);
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

      //// LP Mining UI initialization setup
      let _stakeLPNeedToApprove = await checkStakeLPApproval(
        connectedAddr,
        _lpTokenContract
      );
      if (_stakeLPNeedToApprove.gt(zeroBN)) {
        document.querySelector("#approveStakeLPBtn").style["display"] =
          "inline-block";
      } else {
        document.querySelector("#approveStakeLPBtn").style["display"] = "none";
      }
      let _stakeLPEarning = await getLPRewardCall(
        connectedAddr,
        _uniPoolContract
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
      document.querySelector("#approveDebtCloseBtn").style["display"] =
        "inline-block";
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
    if (_depositAmt.gt(zeroBN)) {
      let _depositSuccess = await depositSPCall(
        connectedAddr,
        stabilityPoolContract,
        _depositAmt
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
      decimal1Billion
    );
    if (_approveSuccess) {
      document.querySelector("#approveStakeLPBtn").style["display"] = "none";
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
      uniPoolContract
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
        _stakeAmt
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
      uniPoolContract
    );
    if (_withdrawLPSuccess) {
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

    ///////////////////////////////////////////////////////////////////////////
    // bind UI listeners for Trove operations
    ///////////////////////////////////////////////////////////////////////////
    const _approveStakeLPButton = document.querySelector("#approveStakeLPBtn");
    removeAddListener(
      _approveStakeLPButton,
      "click",
      window.approveStakeLPListener
    );
    const _stakeLPButton = document.querySelector("#stakeLPBtn");
    removeAddListener(_stakeLPButton, "click", window.stakeLPListener);
    const _withdrawLPButton = document.querySelector("#unstakeLPBtn");
    removeAddListener(_withdrawLPButton, "click", window.withdrawLPListener);
    const _claimLPRewardButton = document.querySelector("#claimLPRewardBtn");
    removeAddListener(
      _claimLPRewardButton,
      "click",
      window.claimLPRewardListener
    );
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
          contractsAddresses.uniPoolAddr
        )
      ).toString(),
      0
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
        _lpBal
    );
    return _needToApprove;
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
          _needToApprove
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

  function getUniPoolSignerContract() {
    const web3Provider = new providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    return new Contract(contractsAddresses.uniPoolAddr, uniPool_abi, signer);
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
        s;
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
  // Contract Interactions: LP Mining
  /////////////////////////////////////////////////

  async function stakeLPCall(connectedAddr, uniPoolContract, _stakeAmt) {
    let _params = await prepareTxParams();
    console.log(
      connectedAddr + " stake into UniPool with lp=" + fromBn(_stakeAmt)
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
      "WITHDRAW LP"
    );
    return _withdrawLPTxSuccess;
  }

  async function claimLPRewardCall(connectedAddr, uniPoolContract) {
    let _params = await prepareTxParams();
    console.log(connectedAddr + " claim from UniPool");
    let _claimLPTx = await uniPoolContract.claimReward();
    let _claimLPTxSuccess = await waitSubmittedTx(
      _claimLPTx,
      "CLAIM LP REWARD"
    );
    return _claimLPTxSuccess;
  }

  async function getLPRewardCall(connectedAddr, uniPoolContract) {
    let _earnedLPReward = await uniPoolContract.earned(connectedAddr);
    console.log(connectedAddr + " got LP reward SATO=" + _earnedLPReward);
    return _earnedLPReward;
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

      <h1>
        <img src="/satofi.png" alt="Satoshi Finance Logo"></img>Satoshi Finance
      </h1>

      <div>
        <span class="badge rounded-pill bg-dark">
          <img
            style={{ width: "18px" }}
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAACWAAAAmVCAMAAAB+zHT2AAAANlBMVEUAAAD////////////////////////////////////////////////////////////////////xY8b8AAAAEXRSTlMA3yC/EO+QcECAYDDPr1CgX8u4hQUAAJxjSURBVHja7N3RboJAEAXQUQGLoM3+/8+26UNjFWpIAMlwzk8wu5e9E9cCGdRVALCOc8nnHPOqDgUyuAYAq+hKPm3M7aNACucAYAXHhHczTcyvKZBBfQwAnpmvXurjh5AQBpwCgKVVfUnn8HtCFxKCkBDgDT5LOvfzlZAQhIQAq2tLPl0sJeFtH7vUBwCPFDRMiT+8t4RnbQDwh7+Kpn05DKQwoAsAlnKsSzpNLOpUIIODQneARwoaJjxAN5PCkCYAuKfXaeKxXEgIAz4CgAVkXF88VtAgJAQhIcAoBQ3/qrsYJCQEISHAIPPVa5dYw6VACkJCgNndSj5tjJGtwrNaSAjwTc61jfkq5esAdukaACho2My3ImM/K7tk6zOAK5gNPYmy9ZkcbH0G8BPR2wsack+o7NIpAPCAcDMHcSEhSQgJAcxX427xmpAQ3n42AUhLQcMcqr5ABkJCAAUNm5mvIroCKbQBgIKGzZT52PpMEl3wxd4dpDYMBEEA3ByFbOL9/2dDLrkGY4NbPVVPMAiP1Ls9AK6/xeystfWZDrY+AxgKXixoELaCrc8Av9x9S70EJSSkhK3PAAoaXixo8D0QhIQA7/TYfY71HCEhCAkB3uksHAeO9TQhIQgJARQ0xBU0dG91ZCQhIYD56s/t438KjbUXjPTxlxWAiypc7fIVsEXN1mdK2PoMoKBh52ypLfxhGSnjeQK4mMaChoxjuUJCStj6DOC2W1CiISSkRMojBXAZ5+5zrBRCQjoICQFcIAwqRhQSUkJICDB9vrqtII0fCBlJSAigoCFI4xE3RjoXAHOPCIXNV7Y+00KhO8Dkgoa412xbnykRdLgRIFpjehV4UKTxZ2akjHo5gHSN569zChqEhNQREgIMvUCYmWEICSmR+YABRGmcr6IKGoSE9BESAihoCHLf0EBICPCP710nd75S6E6L+wJAQUMMW58p8VgA/LB3BzkNA0EQAPcQLsRE8f8/izgBUoBw2+muekKk2KttT0/VR0EbFjRkV7pSydZn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"
          ></img>{" "}
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noreferrer noopener"
            style={{ "text-decoration": "none" }}
          >
            TWITTER
          </a>
        </span>
        <span class="badge rounded-pill bg-warning">
          <img
            style={{ width: "24px" }}
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAUVBMVEVHcEz9/f3////+/v7////////////////////////////Q0NGmp6ji4+P09PRsbm8AAACXmJkHDhMXGx6+v78+QUN8fn9ZW10qLjCLjI2xsbL5+iUbAAAAC3RSTlMAUJfJ7P+SDqYZHNo44zUAAAE7SURBVHgBhZMFAsMwDANL7qCkQCn/f+gWuTi8YUOWHDs5kGZ5IVLkZZp84HKVA9fb63wpL5Tn7YW8UVz2+bt85L7tl52qbmRjPWM/v+0AdO0W5VWfgXXOWZiT0psseAunwPpDkMV/08PtoFcp1+cCIQOsO4GB48/88neEewV1nEhVYg2H1/mRZrIkjz+w03zWMFVCciahQi8iAZsLhOhKU6ERai6fNQ/U5xcRy4IgIRprRgBjQ9NWFzCEh5Ea3FjNFU1j6rigoMgWk8QVHFr/BdQUmcWhDoY3FcVXk97XzAWlJqrdIkdWNQ0TpaluHDBHqxY20A9Am+tlcciu7gPi8sj1UE/tqIdL1SPmmdxOBUN5YaRUpXwtudriSTiW3GvR+tq/Fu3fsv/fOP9bj9zOzcvtr6Sltn92bP8Hp9QgAJJKuGMAAAAASUVORK5CYII="
          ></img>
          <a
            href="https://www.gitbook.com/"
            target="_blank"
            rel="noreferrer noopener"
          >
            {" "}
            DOCS
          </a>
        </span>
        <span class="badge rounded-pill bg-info">
          <img
            style={{ width: "24px" }}
            src="data:image/webp;base64,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"
          ></img>
          <a
            href="https://pancakeswap.finance"
            target="_blank"
            rel="noreferrer noopener"
          >
            {" "}
            LIQUIDITY
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
              <div class="card" style={{ border: "none" }}>
                <div class="card-body">
                  <h5 class="card-title">Total Troves</h5>
                  <p class="card-text" id="statsTotalTrove"></p>
                </div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="card" style={{ border: "none" }}>
                <div class="card-body">
                  <h5 class="card-title">
                    Total Collateral <img src="/BTCB.png"></img>
                  </h5>
                  <p class="card-text" id="statsTotalCollateral"></p>
                </div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="card" style={{ border: "none" }}>
                <div class="card-body">
                  <h5 class="card-title">
                    Total Debt<img src="/btUSD.png"></img>
                  </h5>
                  <p class="card-text" id="statsTotalDebt"></p>
                </div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="card" style={{ border: "none" }}>
                <div class="card-body">
                  <h5
                    class="card-title"
                    data-tip="System will enter Recovery Mode if TCR drops below 130%"
                    data-for="systemTCRTip"
                  >
                    System TCR
                  </h5>
                  <p class="card-text" id="statsSystemTCR"></p>
                </div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="card" style={{ border: "none" }}>
                <div class="card-body">
                  <h5 class="card-title">Collateral Price</h5>
                  <p class="card-text" id="statsCollateralPrice"></p>
                </div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="card" style={{ border: "none" }}>
                <div class="card-body">
                  <h5
                    class="card-title"
                    data-tip="Deposit in Stability Pool will earn SATO issuance & liquidated collateral"
                    data-for="totalSPDepositTip"
                  >
                    Total Stability Pool Deposit<img src="/btUSD.png"></img>
                  </h5>
                  <p class="card-text" id="statsTotalSPDeposit"></p>
                </div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="card" style={{ border: "none" }}>
                <div class="card-body">
                  <h5
                    class="card-title"
                    data-tip="Stake SATO will earn protocol fee in borrowing and redemption"
                    data-for="totalSATOStakedTip"
                  >
                    Total SATO Staked <img src="/SATO.png"></img>
                  </h5>
                  <p class="card-text" id="statsTotalSATOStaked"></p>
                </div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="card" style={{ border: "none" }}>
                <div class="card-body">
                  <h5
                    class="card-title"
                    data-tip="Get btUSD LP from PancakeSwap and this LP Mining will end in 90 days"
                    data-for="lpMiningTip"
                  >
                    LP Mining
                  </h5>
                  <p class="card-text" id="statsTotalSATOToBeMined">
                    <div class="col-auto">
                      <button
                        type="button"
                        class="btn btn-primary mb-2"
                        id="approveStakeLPBtn"
                        style={{ margin: 5 }}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        class="btn btn-success mb-2"
                        id="stakeLPBtn"
                        style={{ margin: 5 }}
                      >
                        Stake
                      </button>
                      <button
                        type="button"
                        class="btn btn-danger mb-2"
                        id="unstakeLPBtn"
                        style={{ margin: 5 }}
                      >
                        Unstake
                      </button>
                      <button
                        type="button"
                        class="btn btn-info mb-2"
                        id="claimLPRewardBtn"
                        style={{ margin: 5 }}
                      >
                        Claim Reward
                      </button>
                    </div>
                  </p>
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
                  style={{ margin: 2 }}
                >
                  Approve Collateral
                </button>
                <button
                  type="button"
                  class="btn btn-primary mb-2"
                  data-bs-toggle="modal"
                  data-bs-target="#openTroveConfirmModal"
                  style={{ margin: 2 }}
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
                <div>
                  My Trove Collateral <img src="/BTCB.png"></img>
                </div>
                <input
                  id="showTroveColl"
                  type="number"
                  class="form-control"
                  disabled
                ></input>
              </div>
              <div class="col-auto">
                <div>
                  My Trove Debt<img src="/btUSD.png"></img>
                </div>
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
                    <div>
                      Trove Collateral <img src="/BTCB.png"></img>
                    </div>{" "}
                    <li class="list-group-item" id="openTroveSummaryColl"></li>
                    <div>
                      Trove Debt<img src="/btUSD.png"></img>
                    </div>{" "}
                    <li class="list-group-item" id="openTroveSummaryDebt"></li>
                    <div>
                      Fee<img src="/btUSD.png"></img>
                    </div>{" "}
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
                    <div>
                      Trove Collateral <img src="/BTCB.png"></img>
                    </div>{" "}
                    <li class="list-group-item" id="closeTroveSummaryColl"></li>
                    <div>
                      Trove Debt<img src="/btUSD.png"></img>
                    </div>{" "}
                    <li class="list-group-item" id="closeTroveSummaryDebt"></li>
                    <div id="closeTroveFreeDebt" style={{ display: "none" }}>
                      <div>
                        Free Debt<img src="/btUSD.png"></img>
                      </div>{" "}
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
                    <div>
                      Trove Collateral <img src="/BTCB.png"></img>
                    </div>{" "}
                    <li
                      class="list-group-item"
                      id="adjustTroveSummaryColl"
                    ></li>
                    <div>
                      Trove Debt<img src="/btUSD.png"></img>
                    </div>{" "}
                    <li
                      class="list-group-item"
                      id="adjustTroveSummaryDebt"
                    ></li>
                    Trove ICR{" "}
                    <li class="list-group-item" id="adjustTroveSummaryICR"></li>
                    <div id="adjustTroveFee" style={{ display: "none" }}>
                      <div>
                        Add Debt Fee<img src="/btUSD.png"></img>
                      </div>{" "}
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
                    <div>
                      Collateral Change <img src="/BTCB.png"></img>
                    </div>
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
                    <div>
                      Debt Change<img src="/btUSD.png"></img>
                    </div>
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
