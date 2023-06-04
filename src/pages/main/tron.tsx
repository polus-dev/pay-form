/* eslint-disable max-len */
import {
  Card,
  CardGrid,
  Div,
  FormItem,
  IconButton,
  Input,
} from "@vkontakte/vkui";
import React, { useEffect, useState } from "react";
import { QRCode } from "react-qr-svg";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Icon16CopyOutline } from "@vkontakte/icons";
import usdtLogo from "../../img/usdt.svg";
import { PolusApi } from "../../logic/api";
import { useGetAssetsQuery } from "../../store/api/endpoints/asset/Asset";
import { ethers } from "ethers";

interface AllType {
  id: string;
  address: string;
  uuid: string;
  amount: string;
  log: Function;
}

export const Tron = (props: AllType) => {
  const { data: availableAssets, isLoading } = useGetAssetsQuery();
  const [amount, setAmount] = useState("-");

  useEffect(() => {
    if (availableAssets)
      setAmount(
        ethers.utils.formatUnits(
          props.amount,
          availableAssets.usdt.tron.decimals
        )
      );
  }, [availableAssets]);

  if (isLoading)
    return (
      <div style={{ margin: "1rem" }}>
        <CardGrid size="l">
          <Card>
            <Div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ width: "100%", textAlign: "center" }}>
                Loading...
              </span>
            </Div>
          </Card>
        </CardGrid>
      </div>
    );

  return (
    <div>
      <h2
        style={{
          textAlign: "center",
          marginBottom: "16px",
          marginTop: "12px",
        }}
      >
        Send USDT <img src={usdtLogo} />
      </h2>
      <div
        style={{
          margin: "0 auto",
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <QRCode
          bgColor="#FFFFFF"
          fgColor="#000000"
          level="Q"
          style={{
            width: 170,
            padding: "10px",
            borderRadius: "16px",
            background: "#fff",
          }}
          value={`tron:${props.address}?value=${amount}`}
        />

        <div>
          <FormItem top="Amount">
            <Input
              value={amount}
              onChange={() => null}
              style={{
                marginBottom: "10px",
                marginTop: "10px",
                userSelect: "all",
              }}
              after={
                <CopyToClipboard
                  text={amount}
                  onCopy={() => props.log("Copyed", true)}
                >
                  <IconButton hoverMode="opacity" aria-label="Copy">
                    <Icon16CopyOutline />
                  </IconButton>
                </CopyToClipboard>
              }
            />
          </FormItem>

          <FormItem top="Address">
            <Input
              value={props.address}
              onChange={() => null}
              style={{ marginBottom: "10px", userSelect: "all" }}
              after={
                <CopyToClipboard
                  text={props.address}
                  onCopy={() => props.log("Copyed", true)}
                >
                  <IconButton hoverMode="opacity" aria-label="Copy">
                    <Icon16CopyOutline />
                  </IconButton>
                </CopyToClipboard>
              }
            />
          </FormItem>
        </div>
      </div>
      <CardGrid size="l">
        <Card>
          <Div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              // flexDirection: 'column'
            }}
          >
            <span style={{ width: "100%" }}>
              Check the amount you send in USDT TRON, in case it will be
              different from {amount}, funds may be lost
            </span>
          </Div>
        </Card>
      </CardGrid>
      <br />
    </div>
  );
};
