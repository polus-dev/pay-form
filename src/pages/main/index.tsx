import {
  Button,
  Div,
  Panel,
  PanelHeader,
  Progress,
  Spinner,
} from "@vkontakte/vkui";

import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useWeb3Modal } from "@web3modal/react";

import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { polygon } from "wagmi/chains";
import {
  Icon28ChevronDownOutline,
  Icon28WarningTriangleOutline,
} from "@vkontakte/icons";

import moment from "moment";
import logo from "../../img/logo.svg";
import maticLogo from "../../img/matic.svg";
import otherLogo from "../../img/other.svg";
import etherLogo from "../../img/weth.svg";
import daiLogo from "../../img/dai.svg";

import btn from "../../img/btn.jpg";
import wc from "../../img/wc.svg";

import { fullListTokens } from "../../logic/tokens";
import { Invoice } from "../../logic/types";
import { Info, InvoiceType, PolusApi } from "../../logic/api";
import { PolusChainId, ProcessAll } from "./processTest";

import { ProcessAll as Process } from "./process";
import { ListToken, ListTokens, Payment } from "../../logic/payment";
import { NtoStr, getParameterByName } from "../../logic/utils";
import { Tron } from "./tron";

const addressPolus = {
  polygon: "0x7D45c9Cf1263Db05065Dd446e5C6605adE19fBc2",
  mainnet: "0x0b89D43B3DD86f75c6010aB45395Cb9430Ff49B0",
  bsc: "0x0b89D43B3DD86f75c6010aB45395Cb9430Ff49B0",
};

interface MainProps {
  id: string;
  setActiveModal: Function;
  consoleLog: Function;
  isDesktop: boolean;
  openPop: Function;
  closePop: Function;
  setTron: Function;
  tron: boolean;
}

interface ErrorType {
  text: string;
  code: number;
}

function fixAmount(nanoAmount: number, type: boolean, nano?: number) {
  const amount = type && nano ? nanoAmount / 10 ** nano : nanoAmount;
  // console.log(amount)
  let stringAmount = Number(amount).toFixed(2);

  if (Number(stringAmount) === 0) {
    stringAmount = Number(amount).toFixed(4);
  }
  return stringAmount;
}

export const Main: React.FC<MainProps> = (props: MainProps) => {
  const [firstRender, setFirstRender] = React.useState<boolean>(false);
  const [type, setType] = React.useState<number>(0);

  const [ready, setReady] = React.useState<boolean>(false);
  const [payed, setPayed] = React.useState<boolean>(false);

  const [timer, setTimer] = React.useState<string>("00:00");

  const [reRender, setRerender] = React.useState<boolean>(false);

  const [coin, setCoin] = React.useState<ListToken>(fullListTokens[0]);
  const [coinInvoice, setCoinInvoice] = React.useState<string>("0");
  const [coinMerchant, setCoinMerchant] = React.useState<ListToken>(
    fullListTokens[0]
  );

  const { isOpen, open, close, setDefaultChain } = useWeb3Modal();
  const { address, isConnected } = useAccount();

  const { chain } = useNetwork();
  const { chains, error, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork();

  const [info, setInfo] = React.useState<Info | undefined | false>(undefined);

  const [errorObj, setErrorObj] = React.useState<ErrorType | undefined>(
    undefined
  );

  const [progress, setProgress] = React.useState<number>(0);

  const [fullListTokensUp, setFullListTokensUp] =
    React.useState<ListTokens>(fullListTokens);

  const location = useLocation();
  const history = useNavigate();

  const polusApi = new PolusApi();

  function startTimer(inf: InvoiceType) {
    const eventTime = Number(inf.expires_at); // Timestamp - Sun, 21 Apr 2013 13:00:00 GMT
    const currentTime = Date.now() / 1000; // Timestamp - Sun, 21 Apr 2013 12:30:00 GMT
    const diffTime = eventTime - currentTime;
    let duration = moment.duration(diffTime * 1000, "milliseconds");
    const interval = 1000;

    if (diffTime < 0) return;

    const interv = setInterval(() => {
      duration = moment.duration(Number(duration) - interval, "milliseconds");
      setTimer(`${duration.minutes()}:${duration.seconds()}`);
    }, interval);
  }
  // function changeCoin (coin1: TokenPolus, chainID?: number) {
  //     setCoin(coin1)
  //     const chainIdLocal = chain ? chain.id : chainID
  //     if (!info || !chainIdLocal) {
  //         console.error('changeCoin: info or chain')
  //         return undefined
  //     }
  //     const nameCoin = coin1.name.toLowerCase() as ListCurrencies

  //     if (chainIdLocal === 1) {
  //         setCoinInvoice(info.currencies.ethereum[nameCoin] ?? '0')
  //         const tokenCurrent = tokens.mainnet.find(token => token.name === info.asset.toLowerCase())
  //         const tokenUser = tokens.mainnet.find(token => token.name === coin1.name)
  //         setCoinMerchant(tokenCurrent ?? tokens.mainnet[0])

  //         if (tokenUser) setCoin(tokenUser)
  //     }
  //     if (chainIdLocal === 137) {
  //         setCoinInvoice(info.currencies.polygon[nameCoin] ?? '0')

  //         const tokenCurrent = tokens.polygon.find(token => token.name === info.asset.toLowerCase())
  //         setCoinMerchant(tokenCurrent ?? tokens.polygon[0])

  //         const tokenUser = tokens.polygon.find(token => token.name === coin1.name)
  //         if (tokenUser) setCoin(tokenUser)
  //     }

  //     if (chainIdLocal === 56) {
  //         setCoinInvoice(info.currencies.polygon[nameCoin] ?? '0')

  //         const tokenCurrent = tokens.polygon.find(token => token.name === info.asset.toLowerCase())
  //         setCoinMerchant(tokenCurrent ?? tokens.polygon[0])

  //         const tokenUser = tokens.polygon.find(token => token.name === coin1.name)
  //         if (tokenUser) setCoin(tokenUser)
  //     }
  //     // console.log('changeCoin:', info.currencies.polygon[nameCoin])
  //     return true
  // }

  function chCoinNew(token: ListToken) {
    setCoin(token);
    if (info) {
      const merchantToken = fullListTokensUp.filter(
        (t) => t.name.toLowerCase() === info.invoice.asset.toLowerCase()
      )[0];
      setCoinMerchant(merchantToken);
      console.log("Select merchant", merchantToken);
    }
    console.log("Select coin", token);
  }

  async function swithNet(id: number) {
    props.openPop();
    console.log("swithNet", id);
    if (!switchNetwork || !id) {
      return false;
    }

    await switchNetwork(id);
    return true;
  }

  async function getInfo(uuid1: string) {
    // const data = await polusApi.getPaymentInfo(uuid1)
    const data = await polusApi.getInfo(uuid1);
    if (!data) {
      props.consoleLog("Error load info", false);
      setInfo(false);
      setErrorObj({
        text: "Error load data invoice",
        code: 1002,
      });
      return undefined;
    }

    // if (data.status === 'completed') {
    //     setErrorObj({
    //         text: 'Invoice is payed',
    //         code: 1003
    //     })
    // }
    // if (data.status === 'expired') {
    //     setErrorObj({
    //         text: 'Invoice is expired',
    //         code: 1004
    //     })
    // }
    if (timer === "00:00") {
      startTimer(data.invoice);
    }

    setDefaultChain(polygon);
    console.log("info", data);
    setInfo(data);

    const currentT = fullListTokens.filter(
      (t) => t.name.toLowerCase() === data.invoice.asset.toLowerCase()
    )[0];

    const fullList = await Payment.getAllAmountIn(
      data.invoice.asset_amount.toString(),
      currentT
    );

    setFullListTokensUp(fullList);

    chCoinNew(fullList.filter((t) => t.namePrice === coin.namePrice)[0]); // update amountIn

    setRerender(!reRender);

    return true;
  }

  async function startPay() {
    if (!ready) {
      await swithNet(137);
    }

    setType(1);

    if (!chain || !address) {
      return false;
    }
    // const PolusUtils = new PolusTokenUtils(coin, chain.id, address)
    // PolusUtils.isApprove()

    return true;
  }

  function generatedUrlRedirect(status: string) {
    if (info) {
      if (status === "sucess") {
        return info.merchant?.success_redirect_url ?? undefined;
      }
      return info.merchant?.fail_redirect_url ?? undefined;
    }
    return undefined;
  }

  useEffect(() => {
    if (isLoading === false) {
      if (error) {
        console.log(error);
        props.consoleLog("Error network change", false);
        props.closePop(false);
      } else {
        props.closePop(true);
      }
    }
  }, [isLoading]);

  useEffect(() => {
    console.log("pendingChainId", pendingChainId);
  }, [pendingChainId]);

  useEffect(() => {
    console.log("chain", chain);
    if (!chain) {
      setReady(false);
      console.error("not found network");
    } else if (chain.id === 1 || chain.id === 137 || chain.id === 56) {
      setReady(true);

      // changeCoin(coin, chain.id)
    } else {
      setReady(false);
      // swithNet('polygon')
    }
    props.closePop(false);
    props.setActiveModal(null);
    close();
  }, [chain]);

  useEffect(() => {
    if (info) {
      chCoinNew(fullListTokensUp[0]);
      // changeCoin(tokens.polygon[0], 137)
    }
  }, [info]);

  useEffect(() => {
    if (isConnected) {
      setProgress(25);
    } else {
      setProgress(0);
    }
  }, [isConnected]);

  useEffect(() => {
    if (!firstRender) {
      setFirstRender(true);

      const uuid1 = getParameterByName("uuid");
      if (uuid1 && uuid1 !== "") {
        // setUuid(uuid1)
        getInfo(uuid1);
      } else {
        setErrorObj({
          text: "Invalid uuid param",
          code: 1001,
        });
        setInfo(false);
      }
    }
  }, []);

  useEffect(() => {
    if (type === 0) {
      props.setTron(false);
    }
  }, [type]);

  useEffect(() => {
    if (info) {
      if (info.invoice.tron_withdraw_address === null && props.tron) {
        setType(0);
      } else if (info.invoice.tron_withdraw_address && props.tron) {
        setType(1);
      }
    }
  }, [info, props.tron]);

  return (
    <Panel id={reRender ? props.id : "render"}>
      <PanelHeader separator={false} />

      {!errorObj && info ? (
        <div className="pay-block">
          <div>
            <div className="domain-block">
              <div className="domain-amount-block">
                <span>{info.merchant?.domain.replace("https://", "")}</span>
                <div className="amount-block">
                  {NtoStr(coin.amountIn)}
                  <span>{coin.name.toUpperCase()}</span>
                </div>
              </div>
              <span
                className="opacity-block"
                style={{ marginTop: "10px", display: "block" }}
              >
                {info.invoice.description}
              </span>
            </div>
          </div>
          <Progress
            aria-labelledby="progresslabel"
            value={progress}
            style={{ marginTop: "16px" }}
          />
          <div>
            {type === 0 ? (
              <div>
                {/* <SegmentedControl
                                style={{ marginTop: '24px' }}
                                size="l"
                                onChange={e => swithNet(e)}
                                value={chain?.id === 1 ? 'ethereum' : 'polygon'}
                                options={[
                                    {
                                        label: 'Ethereum',
                                        value: 'ethereum',
                                        'aria-label': 'Ethereum'
                                    },
                                    {
                                        label: 'Polygon',
                                        value: 'polygon',
                                        'aria-label': 'Polygon'
                                    }
                                ]}
                            /> */}

                <div className="text-one">Choose network</div>

                <div
                  className="selector"
                  onClick={() => {
                    if (isConnected) {
                      props.setActiveModal("network");
                    } else {
                      open();
                    }
                  }}
                >
                  {chain ? (
                    <div className="selector-right">
                      {chain.id === 1 ? <img src={etherLogo} /> : null}
                      {chain.id === 137 ? <img src={maticLogo} /> : null}
                      {chain.id !== 137 && chain.id !== 1 ? (
                        <img src={otherLogo} width={24} />
                      ) : (
                        ""
                      )}
                      <span>{chain.name}</span>
                    </div>
                  ) : (
                    <div className="selector-right">
                      <img src={maticLogo} />
                      <span>Polygon</span>
                    </div>
                  )}

                  <Icon28ChevronDownOutline />
                </div>

                <div className="text-one">Choose currency</div>

                <div className="btn-block">
                  {fullListTokensUp.map((token, key) => (
                    <Button
                      key={key}
                      size="l"
                      stretched
                      className="fix-forpadding"
                      onClick={() => chCoinNew(token)}
                      mode={coin.name === token.name ? "primary" : "outline"}
                      before={<img src={token.icon} />}
                    >
                      {token.name.toUpperCase()}
                    </Button>
                  ))}
                </div>

                <div className="btn-block">
                  {/* <Button */}
                  {/*   size="l" */}
                  {/*   stretched */}
                  {/*   onClick={() => null} */}
                  {/*   mode={"outline"} */}
                  {/*   before={<img src={maticLogo} width={24} />} */}
                  {/* > */}
                  {/*   MATIC */}
                  {/* </Button> */}

                  {/* <Button */}
                  {/*   size="l" */}
                  {/*   stretched */}
                  {/*   onClick={() => null} */}
                  {/*   mode={"outline"} */}
                  {/*   before={<img src={daiLogo} width={24} />} */}
                  {/* > */}
                  {/*   DAI */}
                  {/* </Button> */}

                  <Button
                    size="l"
                    stretched
                    onClick={() => props.setActiveModal("coins")}
                    mode={"outline"}
                    before={<img src={otherLogo} width={24} />}
                  >
                    Other
                  </Button>
                </div>
                {/* <div className="block-tax" style={{ marginTop: '24px' }}>
                                <MiniInfoCell
                                    before={null}
                                    textWrap="full"
                                    textLevel="primary"
                                    after={'23%'}
                                >
                    TAX
                                </MiniInfoCell>
                                <Separator />
                                <MiniInfoCell
                                    before={null}
                                    textWrap="full"
                                    textLevel="primary"
                                    after={'1,000.00 USDT'}
                                >
                    Amount without TAX
                                </MiniInfoCell>
                                <Separator />
                                <MiniInfoCell
                                    before={null}
                                    textWrap="full"
                                    textLevel="primary"
                                    after={'230.00 USDT'}
                                >
                    Total TAX amount
                                </MiniInfoCell>
                                <Separator />
                                <MiniInfoCell
                                    before={null}
                                    textWrap="full"
                                    textLevel="primary"
                                    after={'1,230.00 USDT'}
                                >
                    Amount due
                                </MiniInfoCell>

                            </div> */}

                <span className="timer-block">
                  The invoice is active in {timer}
                </span>

                {/* <Web3Button /> */}

                {isConnected ? (
                  <Button
                    stretched
                    size="l"
                    className="btn-connect"
                    style={{ backgroundImage: `url(${btn})` }}
                    onClick={() => startPay()}
                  >
                    Pay {NtoStr(coin.amountIn)} {coin.name.toUpperCase()}
                  </Button>
                ) : (
                  <Button
                    stretched
                    size="l"
                    className="btn-connect"
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
                {address && chain ? (
                  <div>
                    {/* FIX: fix type   */}
                    {(coin.native && coin.native === coinMerchant.native) ||
                    coin.address[chain.id as PolusChainId] ===
                      coinMerchant.address[chain.id as PolusChainId] ? (
                      <Process
                        id={"all1"}
                        address={address}
                        tokenAddress={coin.address[chain.id as PolusChainId]}
                        addressPolus={
                          chain.id === 1
                            ? addressPolus.mainnet
                            : addressPolus.polygon
                        }
                        amount={coinInvoice}
                        addressMerchant={info.invoice.evm_withdraw_address}
                        uuid={info.invoice.id.replaceAll("-", "")}
                        currentAddressToken={
                          coinMerchant.address[chain.id as PolusChainId]
                        }
                        consoleLog={props.consoleLog}
                        setPayed={setPayed}
                        setProgress={setProgress}
                      />
                    ) : (
                      <ProcessAll
                        id={"all1"}
                        address={address}
                        uuid={info.invoice.id.replaceAll("-", "")}
                        consoleLog={props.consoleLog}
                        setPayed={setPayed}
                        setProgress={setProgress}
                        // NOTE: chainId must be a restriction of the supported chains
                        chainId={chain.id as PolusChainId}
                        addressMerchant={info.invoice.evm_withdraw_address}
                        amountOut={info.invoice.asset_amount}
                        tokenA={coin}
                        tokenB={coinMerchant}
                        fullListTokensUp={fullListTokensUp}
                        fee={info.invoice.fee!}
                        asset_amount_decimals_without_fee={
                          info.invoice.asset_amount_decimals_without_fee!
                        }
                      />
                    )}
                  </div>
                ) : null}

                {props.tron ? (
                  <Tron
                    id="tron1"
                    address={info.invoice.tron_withdraw_address ?? ""}
                  />
                ) : null}

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
                    onClick={() => setType(0)}
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
      {!errorObj && !info ? (
        <Div className="pay-block">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <Spinner size="large" style={{ margin: "20px 0" }} />
          </div>
        </Div>
      ) : null}

      {errorObj ? (
        <Div className="pay-block">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <Icon28WarningTriangleOutline fill="var(--vkui--color_background_negative)" />
            <span style={{ margin: "16px 0" }}>{errorObj.text}</span>
          </div>
          {info ? (
            <Button
              stretched
              size="l"
              className="btn-connect"
              style={{ backgroundImage: `url(${btn})` }}
              // onClick={() => startPay()}
              href={generatedUrlRedirect("error")}
            >
              Back to store
            </Button>
          ) : null}
        </Div>
      ) : null}
    </Panel>
  );
};
