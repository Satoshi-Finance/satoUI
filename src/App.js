ome
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
                  <h5 class="card-title">
                    Total Collateral <img src="/BTCB.png"></img>
                  </h5>
                  <p class="card-text" id="statsTotalCollateral"></p>
                </div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">
                    Total Debt<img src="/btUSD.png"></img>
                  </h5>
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
                  <h5 class="card-title">
                    Total Stability Pool Deposit<img src="/btUSD.png"></img>
                  </h5>
                  <p class="card-text" id="statsTotalSPDeposit"></p>
                </div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">
                    Total SATO Staked <img src="/SATO.png"></img>
                  </h5>
                  <p class="card-text" id="statsTotalSATOStaked"></p>
                </div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">
                    Total SATO yet to be rewarded <img src="/SATO.png"></img>
                  </h5>
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
