/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/naming-convention */
import { Button, Panel, PanelHeader, Spinner, Text} from "@vkontakte/vkui";

import React, { memo, useEffect, useMemo, useRef, useState } from "react";

import { useWeb3Modal } from "@web3modal/react";

import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import {
  Icon28CheckCircleFill,
  Icon28ChevronDownOutline,
  Icon28WarningTriangleOutline,
} from "@vkontakte/icons";

import logo from "../../img/logo.svg";
import maticLogo from "../../img/matic.svg";
import otherLogo from "../../img/other.svg";
import etherLogo from "../../img/weth.svg";
import bnbLogo from "../../img/bnb.svg";
import arbitrumLogo from "../../img/arbitrum.svg";

import btn from "../../img/btn.jpg";
import wc from "../../img/wc.svg";

import { fullListTokens, supportedChain } from "../../logic/tokens";

import { ListToken, ListTokens, PolusChainId } from "../../logic/payment";
import { getParameterByName, getAsset } from "../../logic/utils";
import { Tron } from "../Tron";
import { REACT_APP_TURN_OFF_TIMER } from "../../constants";
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
} from "../../store/features/connection/connectionSlice";
import { useTour } from "@reactour/tour";
import { setVisibleGuideButton } from "../../store/features/guide/guideSlice";
import { IPayment } from "../../store/api/endpoints/payment/Payment.interface";
import { ViewVariant, setView } from "../../store/features/view/viewSlice";
import { useGetAssetsQuery } from "../../store/api/endpoints/asset/Asset";
import { Bitcoin } from "../Bitcoin";
import { ChainId } from "../../store/api/endpoints/types";
import { usePaymentInfo } from "./hooks/usePaymentInfo";
import { useAvailableTokens } from "./hooks/useAvailableTokens";
import { Token } from "../../store/api/types";
import { QRCodePayment } from "../../components/QRCodePayment";
import { useTokenPrice } from "./hooks/useTokenPrice";

interface MainProps {
  id: string;
  setActiveModal: Function;
  consoleLog: Function;
  isDesktop: boolean;
  openPop: Function;
  closePop: Function;
  userToken?: Token;
  setUserToken: (t: Token) => void;
}

const Main: React.FC<MainProps> = memo((props: MainProps) => {
  const isActiveConnection = useAppSelector(
    (state) => state.connection.isActive
  );

  /// NEW CODE START
  const { error, isExpired, isLoading, info, timer, merchantToken , amountInMerchantToken} = usePaymentInfo(
    getParameterByName("uuid")
  );
  const {amount, isLoading: isTokenPriceLoading} = useTokenPrice(props.userToken, merchantToken, amountInMerchantToken)
  const { availableTokens, isAvailalbeTokensLoading } = useAvailableTokens();
  /// NEW CODE END


  useEffect(() => {
    console.log(isTokenPriceLoading)
  }, [isTokenPriceLoading])

  const isVisibleGuideButton = useAppSelector((state) => state.guide.isVisible);
  const currentView = useAppSelector((state) => state.view.currentView);
  const currentBlockchain = useAppSelector(
    (state) => state.connection.currentBlockchain
  );
  const dispatch = useAppDispatch();
  const { setCurrentStep } = useTour();

  const [ready, setReady] = React.useState<boolean>(false);
  const [payed, setPayed] = React.useState<boolean>(false);

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
  } = useSwitchNetwork();

  const { data: assets, isLoading: isAssetsLoading } = useGetAssetsQuery();

  const [progress, setProgress] = React.useState<number>(0);

  if (isActiveConnection && !cheatCode) {
    dispatch(deactivateConnection());
    if (!isActiveConnection && !cheatCode) {
      dispatch(activateConnection());
      dispatch(setVisibleGuideButton(true));
    }
  }

  async function startPay() {
    if (!ready) {
      console.error("not ready");
    }
    if (!info?.payment) {
      console.error("not paymentInfo");
    }
    dispatch(setView(ViewVariant.PROCESS_BLOCK));
  }

  function generatedUrlRedirect(status: string) {
    if (paymentInfo) {
      if (status === "success") {
        return merchantInfo?.success_redirect_url ?? undefined;
      }
      return merchantInfo?.fail_redirect_url ?? undefined;
    }
    return undefined;
  }

  useEffect(() => {
    console.log(isSwitchNetworkLoading, pendingChainId, switchNetworkError);
  }, [isSwitchNetworkLoading, pendingChainId, switchNetworkError]);

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
    if (!chain) {
      setReady(false);
    } else if (supportedChain.includes(chain.id as PolusChainId)) {
      setReady(true);
    } else {
      setReady(false);
    }
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

  return (
    <Panel id="render">
      <PanelHeader separator={false} />

      {!error && info && assets ? (
        <div className={`pay-block smart-line ${smartLineStatus}`}>
          <div className="slide-in-bck-center">
            <div className="domain-block">
              <div className="domain-amount-block">
                <span>{info.merchant?.domain.replace("https://", "")}</span>
                <div className="amount-block">
                  {isTokenPriceLoading ? <span className="animate__animated animate__flash animate__infinite">calculate</span>  :
                  <span>{`${amount} ${props.userToken?.name.toUpperCase() ?? ""}`}</span>}
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
                  {chain ? (
                    <div className="selector-right">
                      {isSwitchNetworkLoading ? (
                        <Spinner size="small" />
                      ) : chain.id === 1 ? (
                        <img src={etherLogo} />
                      ) : chain.id === 137 ? (
                        <img src={maticLogo} />
                      ) : chain.id === 137 ? (
                        <img src={maticLogo} />
                      ) : chain.id === 56 ? (
                        <img src={bnbLogo} />
                      ) : chain.id === 42161 ? (
                        <img src={arbitrumLogo} />
                      ) : (
                        <img src={otherLogo} width={24} />
                      )}
                      <span>
                        {isSwitchNetworkLoading ? "Loading" : chain.name}
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
                        before={<img src={token.image} className="logo-cur" />}
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
                        before={<img src={token.image} className="logo-cur" />}
                      >
                        {token.name.toUpperCase()}
                      </Button>
                    ))}
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
                  </div>
                </span>
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
                      !isActiveConnection ||
                      REACT_APP_TURN_OFF_TIMER ||
                      !Object.keys(info.payment.assets).some(
                        (c) => ChainId[c] === chain?.id
                      )
                    }
                    style={{ backgroundImage: `url(${btn})` }}
                    onClick={() => startPay()}
                  >
                    {/* Pay {NtoStr(coin.amountIn)} {coin.name.toUpperCase()} */}
                  </Button>
                ) : (
                  <Button
                    stretched
                    size="l"
                    className="btn-connect guid__step--1"
                    style={{ backgroundImage: `url(${btn})` }}
                    before={<img src={wc} />}
                    onClick={() => open()}
                    disabled={
                      !isActiveConnection ||
                      REACT_APP_TURN_OFF_TIMER ||
                      !Object.keys(info.payment.assets).some(
                        (c) => ChainId[c] === chain?.id
                      )
                    }
                  >
                    Connect Wallet
                  </Button>
                )}
              </div>
            ) : (
              <div className="proccess-block">
                {/* {address &&
                  chain &&
                  currentView === ViewVariant.PROCESS_BLOCK && (
                    <div>
                      <ProcessBlock
                        id={"all1"}
                        address={address}
                        uuid={paymentInfo.id}
                        consoleLog={props.consoleLog}
                        setPayed={setPayed}
                        setProgress={setProgress}
                        // NOTE: chainId must be a restriction of the supported chains
                        chainId={chain.id as PolusChainId}
                        addressMerchant={getMerchantAddress(paymentInfo)}
                        amountOut={getAsset(paymentInfo).amount}
                        tokenA={coin}
                        tokenB={coinMerchant}
                        fullListTokensUp={fullListTokensUp}
                        fee={getPaymentFee(paymentInfo)}
                        asset_amount_decimals_without_fee={
                          getAsset(paymentInfo).amount
                        }
                        asset_amount_decimals={(
                          BigInt(getAsset(paymentInfo).amount) +
                          BigInt(getPaymentFee(paymentInfo))
                        ).toString()}
                        polusApi={polusApi}
                        feeRecipient={
                          paymentInfo.evm_fee_address as `0x${string}`
                        }
                        amount={(
                          parseFloat(
                            ethers.utils.formatUnits(
                              getAsset(paymentInfo).amount,
                              coinMerchant.decimals[chain.id as PolusChainId]
                            )
                          ) +
                          parseFloat(
                            ethers.utils.formatUnits(
                              getAsset(paymentInfo).fee,
                              coinMerchant.decimals[chain.id as PolusChainId]
                            )
                          )
                        ).toString()}
                        tokenAddress={
                          coinMerchant.address[chain.id as PolusChainId]
                        }
                        isNativeToNative={Boolean(
                          coin.native && coin.native === coinMerchant.native
                        )}
                        currentAddressToken={
                          coinMerchant.address[chain.id as PolusChainId]
                        }
                        setAbortTransaction={abortRef}
                        asset_amount_without_fee={ethers.utils.formatUnits(
                          getAsset(paymentInfo).amount,
                          coinMerchant.decimals[chain.id as PolusChainId]
                        )}
                      />
                    </div>
                  )} */}


                {currentView === ViewVariant.QRCODE && (
                  <QRCodePayment
                    id="qrcode"
                    payment={info.payment}
                    log={props.consoleLog}
                  />
                )}

                {payed ? (
                  <Button
                    stretched
                    size="l"
                    className="btn-connect fix-padding"
                    style={{ backgroundImage: `url(${btn})` }}
                    href={generatedUrlRedirect("success")}
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
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            )}

            <small className="small-block">
              By making a payment, you agree to the <a href="">Terms of Use</a>
              <br />
              and <a href="">Privacy Policy</a>
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

      {error ? (
        <div
          className={`pay-block smart-line ${
            error.code === 1005 || error.code === 1002
              ? "smart-line-error-color"
              : error.code === 1003
              ? "smart-line-succsess-color"
              : "smart-line-loading-color"
          } `}
        >
          <div
            className="slide-in-bck-center"
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            {error.code === 1003 ? <Icon28CheckCircleFill /> : null}

            {error.code === 1004 ? (
              <Spinner size="large" style={{ margin: "20px 0" }} />
            ) : null}
            {error.code !== 1004 && error.code !== 1003 ? (
              <Icon28WarningTriangleOutline fill="var(--vkui--color_background_negative)" />
            ) : null}
            <span style={{ margin: "16px 0" }}>{error.message}</span>
          </div>
          {info?.payment ? (
            <Button
              stretched
              size="l"
              className="btn-connect"
              style={{ backgroundImage: `url(${btn})` }}
              href={generatedUrlRedirect("error")}
            >
              Back to store
            </Button>
          ) : null}
        </div>
      ) : null}
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
