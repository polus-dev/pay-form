import React, { useEffect, useState } from "react";

import {
  AppRoot,
  Card,
  CardGrid,
  Div,
  ModalPage,
  ModalPageHeader,
  ModalRoot,
  PanelHeader,
  PanelHeaderButton,
  ScreenSpinner,
  SimpleCell,
  SplitCol,
  SplitLayout,
  View,
} from "@vkontakte/vkui";
import { Route, Routes } from "react-router-dom";

import { Icon24Dismiss, Icon28DoneOutline } from "@vkontakte/icons";

import { useNetwork } from "wagmi";
import { useWeb3Modal, Web3Button } from "@web3modal/react";

import "@vkontakte/vkui/dist/vkui.css";
import "./style.css";

import logo from "./img/logo.svg";
import { QuestionButton } from "./components/ui/QuestionButton/QuestionButton";
import { useTour } from "@reactour/tour";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { useGetPaymentByPaymentIdQuery } from "./store/api/endpoints/payment/Payment";
import { getParameterByName } from "./logic/utils";
import { Blockchain_t } from "./store/api/endpoints/types";
import { setView, ViewVariant } from "./store/features/view/viewSlice";
import { setCurrentBlockchain } from "./store/features/connection/connectionSlice";
import { ConsoleLog } from "./components/modals/consoleLog.ts";
import { useAvailableTokens } from "./pages/TokenSelect/hooks/useAvailableTokens";
import { Token } from "./store/api/types";
import { ChainForWeb3Modal } from "./types/ChainForWeb3Modal";
import Main from "./pages/TokenSelect/TokenSelect";

const isDesktop = window.innerWidth >= 800;

export const App: React.FC = () => {
  const [activeModal, setActiveModal] = React.useState<any>(null);
  const { setIsOpen } = useTour();
  const dispatch = useAppDispatch();
  const isGuideButtonVisible = useAppSelector((state) => state.guide.isVisible);

  const { data: paymentInfo } = useGetPaymentByPaymentIdQuery({
    payment_id: getParameterByName("uuid")!,
  });
  const { availableTokens, isAvailalbeTokensLoading } = useAvailableTokens();
  const currentBlockchain = useAppSelector(
    (state) => state.connection.currentBlockchain
  );

  const [userToken, setUserToken] = useState<Token>();

  const isActiveConnection = useAppSelector(
    (state) => state.connection.isActive
  );
  const [snackbar, setSnackbar] = React.useState<any>(null);

  const [popout, setPopout] = React.useState<any>(null);
  const { chain } = useNetwork();

  const { open, setDefaultChain } = useWeb3Modal();

  const consoleLog = (data: string, type?: boolean) =>
    setSnackbar(
      <ConsoleLog data={data} type={type} onClose={() => setSnackbar(null)} />
    );

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

  useEffect(() => {
    if (paymentInfo) {
      const h = (blockchain: Blockchain_t) =>
        paymentInfo.blockchains.includes(blockchain);
      if (
        (h("bitcoin") || h("dogecoin") || h("litecoin") || h("tron")) &&
        paymentInfo.blockchains.length === 1
      ) {
        dispatch(setView(ViewVariant.QRCODE));
      }
      dispatch(setCurrentBlockchain(paymentInfo.blockchains[0]));

      const defaultBlockchain = ChainForWeb3Modal[paymentInfo.blockchains[0]];

      if (defaultBlockchain) {
        setDefaultChain(defaultBlockchain);
      }
    }
  }, [paymentInfo]);

  const modalRoot = (
    <ModalRoot activeModal={activeModal}>
      <ModalPage
        id={"network"}
        className="polus"
        onClose={() => setActiveModal(null)}
        dynamicContentHeight
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
                        currentBlockchain === chainLocal ? (
                          <Icon28DoneOutline />
                        ) : null
                      }
                      onClick={() => {
                        if (
                          chainLocal === "bitcoin" ||
                          chainLocal === "tron" ||
                          chainLocal === "litecoin" ||
                          chainLocal === "dogecoin"
                        ) {
                          dispatch(setView(ViewVariant.QRCODE));
                          dispatch(setCurrentBlockchain(chainLocal));
                        } else if (
                          chainLocal === "bsc" ||
                          chainLocal === "polygon" ||
                          chainLocal === "ethereum" ||
                          chainLocal === "arbitrum" ||
                          chainLocal === "optimism"
                        ) {
                          // switchNetwork(ChainId[chainLocal]);
                          dispatch(setCurrentBlockchain(chainLocal));
                          dispatch(setView(ViewVariant.EVM));
                          setDefaultChain(ChainForWeb3Modal[chainLocal]);
                        } else {
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
            {availableTokens
              .filter((token) => token.type === "Stable")
              .map((token, key) => (
                <Card key={key}>
                  <SimpleCell
                    onClick={() => {
                      setUserToken(token);
                      setActiveModal(null);
                    }}
                    after={
                      userToken?.name === token.name ? (
                        <Icon28DoneOutline />
                      ) : null
                    }
                    before={
                      <img
                        src={token.image}
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
            {availableTokens
              .filter((token) => token.type === "Native")
              .map((token, key) => (
                <Card key={key}>
                  <SimpleCell
                    onClick={() => {
                      setUserToken(token);
                      setActiveModal(null);
                    }}
                    after={
                      userToken?.name === token.name ? (
                        <Icon28DoneOutline />
                      ) : null
                    }
                    before={
                      <img
                        src={token.image}
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
            {availableTokens
              .filter((token) => token.type === "Wrapped")
              .map((token, key) => (
                <Card key={key}>
                  <SimpleCell
                    onClick={() => {
                      setUserToken(token);
                      setActiveModal(null);
                    }}
                    after={
                      userToken?.name === token.name ? (
                        <Icon28DoneOutline />
                      ) : null
                    }
                    before={
                      <img
                        src={token.image}
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
            {availableTokens
              .filter((token) => token.type === "Other")
              .map((token, key) => (
                <Card key={key}>
                  <SimpleCell
                    onClick={() => {
                      setUserToken(token);
                      setActiveModal(null);
                    }}
                    after={
                      userToken?.name === token.name ? (
                        <Icon28DoneOutline />
                      ) : null
                    }
                    before={
                      <img
                        src={token.image}
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
                <img src={logo} alt="logo" />
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
                      <Main
                        id="main1"
                        setActiveModal={setActiveModal}
                        consoleLog={consoleLog}
                        isDesktop={isDesktop}
                        openPop={openPop}
                        closePop={closePop}
                        setUserToken={setUserToken}
                        userToken={userToken}
                      />
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
