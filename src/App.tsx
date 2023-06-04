import React, { useEffect, lazy, Suspense, useState } from "react";

import {
  AppRoot,
  SplitLayout,
  SplitCol,
  View,
  ModalRoot,
  ModalPage,
  ModalPageHeader,
  PanelHeaderButton,
  Div,
  Snackbar,
  ScreenSpinner,
  PanelHeader,
  CardGrid,
  Card,
  SimpleCell,
} from "@vkontakte/vkui";
import { Route, Routes } from "react-router-dom";

import {
  Icon24Dismiss,
  Icon28CancelCircleFillRed,
  Icon28CheckCircleFill,
  Icon28DoneOutline,
} from "@vkontakte/icons";

import { useNetwork, useSwitchNetwork, useDisconnect, mainnet } from "wagmi";
import { Web3Button, useWeb3Modal } from "@web3modal/react";
import { polygon, bsc, arbitrum } from "wagmi/chains";

import "@vkontakte/vkui/dist/vkui.css";
import "./style.css";

import { fullListTokens } from "./logic/tokens";

import logo from "./img/logo.svg";
import { ListToken, PolusChainId } from "./logic/payment";
import { QuestionButton } from "./components/ui/QuestionButton/QuestionButton";
import { useTour } from "@reactour/tour";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  useGetPaymentByPaymentIdQuery,
  useLazyGetPaymentByPaymentIdQuery,
} from "./store/api/endpoints/payment/Payment";
import { getBlockchains, getParameterByName } from "./logic/utils";
import { ChainId } from "./store/api/endpoints/types";
import { ViewVariant, setView } from "./store/features/view/viewSlice";

const MainLazyComponent = lazy(() => import("./pages/main"));

const blockchains = {
  polygon,
  bsc,
  arbitrum,
  ethereum: mainnet,
};

export const App: React.FC = () => {
  const [activeModal, setActiveModal] = React.useState<any>(null);
  const { setIsOpen } = useTour();
  const dispatch = useAppDispatch();
  const isGuideButtonVisible = useAppSelector((state) => state.guide.isVisible);

  const { data: paymentInfo } = useGetPaymentByPaymentIdQuery({
    payment_id: getParameterByName("uuid")!,
  });

  const isActiveConnection = useAppSelector(
    (state) => state.connection.isActive
  );
  const [snackbar, setSnackbar] = React.useState<any>(null);

  const [popout, setPopout] = React.useState<any>(null);
  const { chain } = useNetwork();

  const { switchNetwork } = useSwitchNetwork();

  const [seletcToken, setSelectToken] = React.useState<ListToken | undefined>(
    undefined
  );

  const { open, setDefaultChain } = useWeb3Modal();

  const isDesktop = window.innerWidth >= 800;

  function openPop() {
    setPopout(<ScreenSpinner state="loading" />);
  }

  function closePop(type: boolean) {
    if (popout) {
      if (type) setPopout(<ScreenSpinner state="done" aria-label="Success" />);
      else setPopout(<ScreenSpinner state="error" aria-label="Error" />);

      setTimeout(() => {
        setPopout(null);
      }, 1000);
    }
  }

  function consoleLog(data: string, type: boolean = false) {
    setSnackbar(
      <Snackbar
        before={
          type ? <Icon28CheckCircleFill /> : <Icon28CancelCircleFillRed />
        }
        onClose={() => setSnackbar(null)}
      >
        {data}
      </Snackbar>
    );
  }

  function fullFilter(type: "stable" | "native" | "wrap" | "other") {
    const list = fullListTokens.filter((token) => {
      if (chain) {
        return token.address[chain.id as PolusChainId] !== "0";
      }
      return true;
    });

    return list.filter((token) => token.category === type);
  }

  const modalRoot = (
    <ModalRoot activeModal={activeModal}>
      <ModalPage
        id={"network"}
        className="polus"
        onClose={() => setActiveModal(null)}
        dynamicContentHeight
        // settlingHeight={100}
        header={
          <ModalPageHeader
            after={
              !isDesktop && (
                <PanelHeaderButton onClick={() => setActiveModal(null)}>
                  <Icon24Dismiss />
                </PanelHeaderButton>
              )
            }
          >
            Select network
          </ModalPageHeader>
        }
      >
        <Div>
          <CardGrid size="l">
            {paymentInfo &&
              paymentInfo.blockchains.map((chainLocal, key) => {
                return (
                  <Card key={key}>
                    <SimpleCell
                      after={
                        chain?.id === ChainId[chainLocal] ? (
                          <Icon28DoneOutline />
                        ) : null
                      }
                      onClick={() => {
                        // REFACTOR
                        if (chainLocal === "tron") {
                          dispatch(setView(ViewVariant.TRON));
                          setActiveModal(null);
                          return;
                        }
                        if (switchNetwork) {
                          switchNetwork(ChainId[chainLocal]);
                        } else {
                          setDefaultChain(polygon);
                          open();
                        }
                        setActiveModal(null);
                      }}
                    >
                      {chainLocal}
                    </SimpleCell>
                  </Card>
                );
              })}
          </CardGrid>
        </Div>
      </ModalPage>

      <ModalPage
        id={"coins"}
        className="polus"
        onClose={() => setActiveModal(null)}
        dynamicContentHeight
        // settlingHeight={100}
        header={
          <ModalPageHeader
            after={
              !isDesktop && (
                <PanelHeaderButton onClick={() => setActiveModal(null)}>
                  <Icon24Dismiss />
                </PanelHeaderButton>
              )
            }
          >
            Select Token
          </ModalPageHeader>
        }
      >
        <Div>
          <h3>Stable Coin</h3>
          <CardGrid size="m">
            {fullFilter("stable").map((token, key) => (
              <Card key={key}>
                <SimpleCell
                  onClick={() => {
                    setSelectToken(token);
                    setActiveModal(null);
                  }}
                  after={
                    seletcToken?.name === token.name ? (
                      <Icon28DoneOutline />
                    ) : null
                  }
                  before={
                    <img
                      src={token.icon}
                      style={{ marginRight: "12px" }}
                      className="logo-cur"
                    />
                  }
                >
                  {token.name.toUpperCase()}
                </SimpleCell>
              </Card>
            ))}
          </CardGrid>

          <h3>Native Coin</h3>
          <CardGrid size="m">
            {fullFilter("native").map((token, key) => (
              <Card key={key}>
                <SimpleCell
                  onClick={() => {
                    setSelectToken(token);
                    setActiveModal(null);
                  }}
                  after={
                    seletcToken?.name === token.name ? (
                      <Icon28DoneOutline />
                    ) : null
                  }
                  before={
                    <img
                      src={token.icon}
                      style={{ marginRight: "12px" }}
                      className="logo-cur"
                    />
                  }
                >
                  {token.name.toUpperCase()}
                </SimpleCell>
              </Card>
            ))}
          </CardGrid>

          <h3>Wrapped Coin</h3>
          <CardGrid size="m">
            {fullFilter("wrap").map((token, key) => (
              <Card key={key}>
                <SimpleCell
                  onClick={() => {
                    setSelectToken(token);
                    setActiveModal(null);
                  }}
                  after={
                    seletcToken?.name === token.name ? (
                      <Icon28DoneOutline />
                    ) : null
                  }
                  before={
                    <img
                      src={token.icon}
                      style={{ marginRight: "12px" }}
                      className="logo-cur"
                    />
                  }
                >
                  {token.name.toUpperCase()}
                </SimpleCell>
              </Card>
            ))}
          </CardGrid>

          <h3>Other Coin</h3>
          <CardGrid size="m">
            {fullFilter("other").map((token, key) => (
              <Card key={key}>
                <SimpleCell
                  onClick={() => {
                    setSelectToken(token);
                    setActiveModal(null);
                  }}
                  after={
                    seletcToken?.name === token.name ? (
                      <Icon28DoneOutline />
                    ) : null
                  }
                  before={
                    <img
                      src={token.icon}
                      style={{ marginRight: "12px" }}
                      className="logo-cur"
                    />
                  }
                >
                  {token.name.toUpperCase()}
                </SimpleCell>
              </Card>
            ))}
          </CardGrid>
        </Div>
      </ModalPage>
    </ModalRoot>
  );

  return (
    <AppRoot>
      <SplitLayout
        className="polus"
        style={{ justifyContent: "center" }}
        modal={modalRoot}
        popout={popout}
        header={
          <PanelHeader
            separator={false}
            before={
              <a href="https://poluspay.com" target="_blank">
                <img src={logo} />
              </a>
            }
            after={isActiveConnection && <Web3Button balance="show" />}
            className="polus-header"
          />
        }
      >
        <SplitCol
          animate={false}
          spaced={isDesktop}
          width={isDesktop ? "450px" : "100%"}
          maxWidth={isDesktop ? "450px" : "100%"}
        >
          <div id="main">
            <Routes>
              <Route
                path="/"
                element={
                  <View activePanel={"main1"} id="view">
                    <span id="main1">
                      <Suspense fallback={<ScreenSpinner state="loading" />}>
                        <MainLazyComponent
                          id="main1"
                          setActiveModal={setActiveModal}
                          consoleLog={consoleLog}
                          isDesktop={isDesktop}
                          openPop={openPop}
                          closePop={closePop}
                          seletcToken={seletcToken}
                          setSelectToken={setSelectToken}
                        />
                      </Suspense>
                    </span>
                  </View>
                }
              />
            </Routes>
          </div>
        </SplitCol>
        <QuestionButton
          visible={isGuideButtonVisible}
          onClick={() => setIsOpen(true)}
        />
        {snackbar}
      </SplitLayout>
    </AppRoot>
  );
};
