import { Button, Panel, PanelHeader, Spinner, Text } from "@vkontakte/vkui";

import React, { memo, useEffect, useMemo, useRef, useState } from "react";

import { Web3NetworkSwitch, useWeb3Modal } from "@web3modal/react";

import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { Icon28ChevronDownOutline } from "@vkontakte/icons";

import logo from "../../img/logo.svg";
import maticLogo from "../../img/matic.svg";
import otherLogo from "../../img/other.svg";
import etherLogo from "../../img/weth.svg";
import bnbLogo from "../../img/bnb.svg";
import arbitrumLogo from "../../img/arbitrum.svg";
import optimismLogo from "../../img/optimism.svg";

import btn from "../../img/btn.jpg";
import wc from "../../img/wc.svg";

import { getParameterByName, roundCryptoAmount } from "../../logic/utils";
import { CheatCodeListener } from "../../components/CheatCodeListener";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { ProgressBar } from "../../components/ui/ProgressBar";
import {
  setSmartLineStatus,
  SmartLineStatus,
} from "../../store/features/smartLine/smartLineSlice";
import {
  activateConnection,
  deactivateConnection,
  setCurrentBlockchain,
} from "../../store/features/connection/connectionSlice";
import { useTour } from "@reactour/tour";
import { setVisibleGuideButton } from "../../store/features/guide/guideSlice";
import { ViewVariant, setView } from "../../store/features/view/viewSlice";
import { useGetAssetsQuery } from "../../store/api/endpoints/asset/Asset";
import { usePaymentInfo } from "./hooks/usePaymentInfo";
import { useAvailableTokens } from "./hooks/useAvailableTokens";
import { Token } from "../../store/api/types";
import { QRCodePayment } from "../../components/QRCodePayment";
import { ProcessBlock } from "../../components/ProcessBlock";
import { ethers } from "ethers";
import { PaymentStatus } from "../../store/api/endpoints/payment/Payment.interface";
import { StatusComponent } from "../../components/StatusComponent";
import { useGetPaymentByPaymentIdQuery } from "../../store/api/endpoints/payment/Payment";
import { ChainId } from "../../store/api/endpoints/types";
import { userTokenPairPriceSlice } from "../../store/features/tokenPairPrice/tokenPairPriceSlice";
import { useTokenPairPrice } from "./hooks/useTokenPairPrice";

interface MainProps {
  id: string;
  setActiveModal: Function;
  consoleLog: (message: string, type?: boolean) => void;
  isDesktop: boolean;
  openPop: Function;
  closePop: Function;
  userToken?: Token;
  setUserToken: (t: Token) => void;
}

const Main: React.FC<MainProps> = memo((props: MainProps) => {
  /// NEW CODE START
  const {
    error,
    isExpired,
    isLoading,
    info,
    timer,
    merchantToken,
    amountInMerchantToken,
    fee,
    merchantAmount,
    merchantAddress,
    expireAt,
  } = usePaymentInfo(getParameterByName("uuid"));
  const {
    amount,
    isLoading: isTokenPairPriceLoading,
    assetName,
  } = useTokenPairPrice(props.userToken, merchantToken, amountInMerchantToken);
  const { availableTokens, isAvailalbeTokensLoading } = useAvailableTokens();

  const { data: paymentInfo } = useGetPaymentByPaymentIdQuery(
    {
      payment_id: getParameterByName("uuid")!,
    },
    { pollingInterval: isExpired ? 0 : 1000 }
  );

  /// NEW CODE END

  const isVisibleGuideButton = useAppSelector((state) => state.guide.isVisible);
  const currentView = useAppSelector((state) => state.view.currentView);
  const currentBlockchain = useAppSelector(
    (state) => state.connection.currentBlockchain
  );

  const prevBlockchain = useAppSelector(
    (state) => state.connection.prevBlockchain
  );
  const dispatch = useAppDispatch();
  const { setCurrentStep } = useTour();

  const [cheatCode, setCheatCode] = React.useState(false);

  const smartLineStatus = useAppSelector(
    (state) => state.smartLine.smartLineStatus
  );

  const abortRef = useRef(() => {});

  const { open, close } = useWeb3Modal();
  const { address, isConnected } = useAccount();

  const { chain } = useNetwork();
  const {
    error: switchNetworkError,
    isLoading: isSwitchNetworkLoading,
    pendingChainId,
    switchNetworkAsync,
  } = useSwitchNetwork();

  const { data: assets, isLoading: isAssetsLoading } = useGetAssetsQuery();

  const [progress, setProgress] = React.useState<number>(0);

  useEffect(() => {
    if (error) {
      dispatch(setVisibleGuideButton(false));
    }
    if (currentView === ViewVariant.QRCODE) {
      dispatch(setVisibleGuideButton(false));
    }
  }, [error, currentView]);

  async function startPay() {
    if (!info?.payment) {
      throw new Error("not paymentInfo");
    }
    if (!currentBlockchain) {
      throw new Error("not currentBlockchain");
    }
    if (!switchNetworkAsync) {
      throw new Error("not switchNetworkAsync");
    }

    if (!chain) {
      throw new Error("not chain");
    }

    if (chain.id !== ChainId[currentBlockchain]) {
      await switchNetworkAsync(ChainId[currentBlockchain]);
    }

    dispatch(setView(ViewVariant.PROCESS_BLOCK));
  }

  useEffect(() => {
    if (!isSwitchNetworkLoading) {
      if (switchNetworkError) {
        props.consoleLog("Error network change", false);
        props.closePop(false);
      } else {
        props.closePop(true);
      }
    }
  }, [isSwitchNetworkLoading]);

  useEffect(() => {
    props.closePop(false);
    props.setActiveModal(null);
    close();
  }, [chain]);

  useEffect(() => {
    if (isConnected) {
      setProgress(25);
      setCurrentStep(1);
    } else {
      setCurrentStep(0);
      setProgress(0);
    }
  }, [isConnected]);

  if (!getParameterByName("uuid")) {
    return <StatusComponent status="error" message="payment uuid not found" />;
  } else if (paymentInfo?.status === PaymentStatus.success) {
    return <StatusComponent status="succsess" message="payment successful" />;
  } else if (paymentInfo?.status === PaymentStatus.failed) {
    return <StatusComponent status="error" message="error" />;
  } else if (paymentInfo?.status === PaymentStatus.inProgress) {
    return <StatusComponent status="loading" message="in progress" />;
  }

  if (isExpired) {
    return <StatusComponent status="error" message=" payment expired" />;
  }

  return (
    <Panel id="render">
      <PanelHeader separator={false} />
      {!isExpired && !error && info && assets ? (
        <div className={`pay-block smart-line ${smartLineStatus}`}>
          <div className="slide-in-bck-center">
            <div className="domain-block">
              <div className="domain-amount-block">
                <span>{info.merchant?.domain.replace("https://", "")}</span>
                <div className="amount-block">
                  <span>{`${
                    merchantToken
                      ? roundCryptoAmount(
                          ethers.utils
                            .formatUnits(
                              amountInMerchantToken,
                              merchantToken.decimals
                            )
                            .toString()
                        )
                      : ""
                  } ${
                    merchantToken ? merchantToken.name.toUpperCase() : ""
                  }`}</span>
                </div>
              </div>
              <span
                className="opacity-block"
                style={{ marginTop: "10px", display: "block" }}
              >
                {info.payment.description}
              </span>
            </div>
          </div>
          <ProgressBar value={progress} />
          <div>
            {currentView === ViewVariant.EVM ? (
              <div>
                <div className="text-one">Choose network</div>

                <div
                  className="selector guid__step--2"
                  onClick={() => {
                    props.setActiveModal("network");
                  }}
                >
                  {currentBlockchain ? (
                    <div className="selector-right">
                      {isSwitchNetworkLoading ? (
                        <Spinner size="small" />
                      ) : currentBlockchain === "ethereum" ? (
                        <img src={etherLogo} />
                      ) : currentBlockchain === "polygon" ? (
                        <img src={maticLogo} />
                      ) : currentBlockchain === "bsc" ? (
                        <img src={bnbLogo} />
                      ) : currentBlockchain === "arbitrum" ? (
                        <img src={arbitrumLogo} />
                      ) : currentBlockchain === "optimism" ? (
                        <img src={optimismLogo} />
                      ) : (
                        <img src={otherLogo} width={24} />
                      )}
                      <span>
                        {isSwitchNetworkLoading ? "Loading" : currentBlockchain}
                      </span>
                    </div>
                  ) : (
                    <div className="selector-right">
                      <img src={otherLogo} />
                      <span>Select Network</span>
                    </div>
                  )}

                  <Icon28ChevronDownOutline />
                </div>
                <>
                  <div className="text-one">Choose currency</div>
                  <span className="guid__step--3">
                    <div className="btn-block">
                      {availableTokens.slice(0, 3).map((token, key) => (
                        <Button
                          key={key}
                          size="l"
                          stretched
                          className="fix-forpadding"
                          onClick={() => props.setUserToken(token)}
                          mode={
                            props.userToken?.name === token.name
                              ? "primary"
                              : "outline"
                          }
                          before={
                            <img src={token.image} className="logo-cur" />
                          }
                        >
                          {token.name.toUpperCase()}
                        </Button>
                      ))}
                    </div>

                    <div className="btn-block">
                      {availableTokens.slice(3, 5).map((token, key) => (
                        <Button
                          key={key}
                          size="l"
                          stretched
                          className="fix-forpadding"
                          onClick={() => props.setUserToken(token)}
                          mode={
                            props.userToken?.name === token.name
                              ? "primary"
                              : "outline"
                          }
                          before={
                            <img src={token.image} className="logo-cur" />
                          }
                        >
                          {token.name.toUpperCase()}
                        </Button>
                      ))}
                      {availableTokens.length ? (
                        <Button
                          size="l"
                          className="guid__step--4"
                          stretched
                          onClick={() => props.setActiveModal("coins")}
                          mode={"outline"}
                          before={<img src={otherLogo} width={24} />}
                        >
                          Other
                        </Button>
                      ) : null}
                    </div>
                  </span>
                </>
                <span className="timer-block">
                  The invoice is active in {timer}
                </span>

                {/* <Web3Button /> */}

                {isConnected ? (
                  <Button
                    stretched
                    size="l"
                    className="btn-connect"
                    disabled={
                      isTokenPairPriceLoading ||
                      !props.userToken ||
                      amount === "Unknown"
                    }
                    style={{ backgroundImage: `url(${btn})` }}
                    onClick={() => startPay()}
                  >
                    {isTokenPairPriceLoading ? (
                      <Spinner size="regular" />
                    ) : isSwitchNetworkLoading ? (
                      "switching network..."
                    ) : (
                      `Pay ${amount ?? ""} ${assetName ?? ""}`
                    )}
                  </Button>
                ) : (
                  <Button
                    stretched
                    size="l"
                    className="btn-connect guid__step--1"
                    style={{ backgroundImage: `url(${btn})` }}
                    before={<img src={wc} />}
                    onClick={() => open()}
                  >
                    Connect Wallet
                  </Button>
                )}
              </div>
            ) : (
              <div className="proccess-block">
                {address &&
                chain &&
                merchantToken &&
                props.userToken &&
                currentView === ViewVariant.PROCESS_BLOCK &&
                currentBlockchain ? (
                  <div>
                    <ProcessBlock
                      id={"all1"}
                      consoleLog={props.consoleLog}
                      fee={fee}
                      amount={+fee + +merchantAmount + ""}
                      merchantAmount={merchantAmount}
                      feeAddress={info.payment.evm_fee_address}
                      merchantAddress={merchantAddress}
                      merchantToken={merchantToken}
                      userToken={props.userToken}
                      uuid={info.payment.id}
                      blockchain={currentBlockchain}
                      userAddress={address}
                      setAbortTransaction={abortRef}
                      expireAt={expireAt}
                    />
                  </div>
                ) : (
                  !(currentView === ViewVariant.QRCODE) && (
                    <Text>Something went wrong</Text>
                  )
                )}

                {currentView === ViewVariant.QRCODE && (
                  <QRCodePayment
                    id="qrcode"
                    payment={info.payment}
                    log={props.consoleLog}
                  />
                )}

                {info.payment.status === PaymentStatus.success ? (
                  <Button
                    stretched
                    size="l"
                    className="btn-connect fix-padding"
                    style={{ backgroundImage: `url(${btn})` }}
                    href={info.merchant.success_redirect_url}
                  >
                    Back to store
                  </Button>
                ) : (
                  <Button
                    stretched
                    size="l"
                    className="btn-connect"
                    style={{ backgroundImage: `url(${btn})` }}
                    onClick={() => {
                      abortRef.current();
                      dispatch(setSmartLineStatus(SmartLineStatus.DEFAULT));
                      dispatch(setView(ViewVariant.EVM));
                      dispatch(setCurrentBlockchain(prevBlockchain));
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            )}

            <small className="small-block">
              By making a payment, you agree to the{" "}
              <a href="https://poluspay.com/terms-of-use">Terms of Use</a>
              <br />
              and{" "}
              <a href="https://poluspay.com/privacy-policy">Privacy Policy</a>
            </small>

            <div className="logo-block">
              <span>Powered by </span>
              <a href="https://poluspay.com" target="_blank">
                <img src={logo} />
              </a>
            </div>
          </div>
        </div>
      ) : null}
      {(isLoading || isAvailalbeTokensLoading || isAssetsLoading) && (
        <div className={`pay-block  smart-line ${smartLineStatus}`}>
          <div
            className="slide-in-bck-center"
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <Spinner size="large" style={{ margin: "20px 0" }} />
          </div>
        </div>
      )}
      <CheatCodeListener
        code={import.meta.env.VITE_REACT_APP_CHEAT_CODE}
        onCheatCodeEntered={() => {
          setCheatCode(true);
          dispatch(activateConnection());
          props.consoleLog("Cheat code entered", true);
        }}
      />
    </Panel>
  );
});

export default Main;
