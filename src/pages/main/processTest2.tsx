import {
  Icon24Spinner,
  Icon28CancelCircleOutline,
  Icon28CheckCircleOff,
  Icon28CheckCircleOn,
  Icon28RefreshOutline,
} from '@vkontakte/icons';
import { SimpleCell } from '@vkontakte/vkui';
import { useEffect, useState } from 'react';
import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  usePrepareSendTransaction,
  useSendTransaction,
  useSignTypedData,
} from 'wagmi';

import { BigNumber, ethers } from 'ethers';
import { Percent } from '@uniswap/sdk-core';
import { SwapOptions, SwapRouter } from '@uniswap/universal-router-sdk';
import { AllowanceTransfer, PermitSingle } from '@uniswap/permit2-sdk';
import { verifyTypedData } from 'ethers/lib/utils.js';
import token_abi from '../../token_abi.json';
import { CustomRouter } from '../../logic/router';

import permit2 from '../../permit_abi.json';
import { tokens } from '../../logic/tokens';
import { Permit2Permit } from '@uniswap/universal-router-sdk/dist/utils/permit2';
import { encodePay } from '../../utils/customEncode';

const PERMIT2_ADDRESS = '0x000000000022d473030f116ddee9f6b43ac78ba3';
const UNIVERSAL_ROUTER = '0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5';

interface AllType {
  id: string;
  tokenAddress: string;
  addressPolus: string;
  address: `0x${string}`;
  amount: string;
  addressMerchant: string;
  currentAddressToken: string;
  uuid: string;
  consoleLog: Function;
  setPayed: Function;
  setProgress: Function;
  chainId: number;
  amountOut: string;
}

interface ProcessType {
  address: `0x${string}`;
  tokenAddress: string;
  addressPolus: string;
  position: number;
  setPosition: Function;
  positionError: number;
  setPositionError: Function;
  amount: string;
  addressMerchant: string;
  uuid: string;
  currentAddressToken: string;
  consoleLog: Function;
  reRender: Function;
  setPayed: Function;
  universalRouter: string;
  setDataTr: Function;
  dataTr: string | undefined;
  chainId: number;
  amountOut: string;
  feeData: ethers.providers.FeeData | undefined;
  timeEx: string | undefined;
  timeEx2: string | undefined;
}

const ProcessOne: React.FC<ProcessType> = (props) => {
  const [firstRender, setFirstRender] = useState(false);

  const addr: `0x${string}` = `0x${props.tokenAddress.replace('0x', '')}`;
  const contractRead = useContractRead({
    address: addr,
    abi: token_abi,
    functionName: 'allowance',
    args: [props.address, props.addressPolus],
  });


  const balanceOf = useContractRead({
    address: addr,
    abi: token_abi,
    functionName: 'balanceOf',
    args: [props.address],
  });


  const { config } = usePrepareContractWrite({
    address: addr,
    abi: token_abi,
    functionName: 'approve',
    args: [props.addressPolus, ethers.constants.MaxUint256],
  });
  const { data, write, error } = useContractWrite(config);

  useEffect(() => {
    if (!firstRender && write && props.position === 0 && contractRead.data && balanceOf.data) {
      setFirstRender(true);

      const curentTokenDecimals = 10 ** 6;
      //TODO: make token decimals dynamic
      // maybe use enum with decimals all tokens

      if ((balanceOf.data as BigNumber).toNumber() < +props.amountOut * curentTokenDecimals) {
        props.consoleLog('not enough balance', false);
        props.setPositionError(1);
        return
      }

      if (contractRead.data) {
        if (BigInt(contractRead.data.toString()) < BigInt(props.amount)) {
          try {
            write();
          } catch (errorTry) {
            props.consoleLog(errorTry ?? 'Unknown error', false);
            props.setPositionError(1);
          }
        } else {
          props.setPosition(1);
        }
      } else {
      }
    }
  }, [contractRead.data, balanceOf.data, write]);

  useEffect(() => {
    if (data) {
      // data.wait(1).then(() => {
      setTimeout(() => {
        props.setPosition(1);
        props.reRender(2);
      }, 1000);

      // })
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      console.log('error: ', error);
      props.consoleLog(error?.message ?? 'Unknown error', false);
      props.setPositionError(1);
    }
  }, [error]);

  return (
    <SimpleCell
      disabled={props.positionError !== 1}
      onClick={() => props.reRender(1)}
      style={props.position !== 0 ? { opacity: 0.5 } : {}}
      after={props.positionError === 1 ? <Icon28RefreshOutline /> : null}
      before={
        <div>
          {props.positionError === 1 ? (
            <Icon28CancelCircleOutline fill="var(--vkui--color_background_negative)" />
          ) : null}
          {props.position === 0 && props.positionError !== 1 ? (
            <div className="process-spinner">
              <Icon24Spinner width={28} height={28} />
            </div>
          ) : null}
          {props.position > 0 && props.positionError !== 1 ? (
            <Icon28CheckCircleOn fill="var(--vkui--color_background_positive--active)" />
          ) : null}
        </div>
      }
    >
      Approve your tokens
    </SimpleCell>
  );
};

const ProcessTwo: React.FC<ProcessType> = (props: ProcessType) => {
  const [firstRender, setFirstRender] = useState(false);

  const [firstRender2, setFirstRender2] = useState(false);

  const [needToPermit, setNeedToPermit] = useState(false);

  const [readyToSend, setReadyToSend] = useState(false);

  type Permit2AllowanceType = {
    amount: bigint;
    expiration: number;
    nonce: number;
  };

  const { data: permit2allowance } = useContractRead({
    address: PERMIT2_ADDRESS,
    abi: permit2,
    functionName: 'allowance',
    args: [props.address, props.tokenAddress, props.universalRouter],
  }) as { data: Permit2AllowanceType | undefined };


  const router = new CustomRouter(props.chainId);

  const tokenA = router.addressToToken(props.tokenAddress, 0);
  const tokenB = router.addressToToken(props.currentAddressToken, 0);

  const dataForSign = CustomRouter.packToWagmi(
    props.tokenAddress,
    (2n ** 160n - 1n).toString(),
    props.timeEx2 ?? '1',
    (permit2allowance ? permit2allowance.nonce : 0).toString(),
    props.universalRouter,
    props.timeEx ?? '1'
  );


  const valuesAny: PermitSingle = dataForSign.value;

  const { domain, types, values } = AllowanceTransfer.getPermitData(
    valuesAny,
    PERMIT2_ADDRESS,
    137
  );



  const sign = useSignTypedData({
    domain: domain as any,
    types: types as any,
    value: values as any,
  });

  useEffect(() => {
    if (
      !firstRender &&
      props.position === 1 &&
      sign &&
      props.timeEx2 &&
      props.timeEx &&
      permit2allowance
    ) {
      setFirstRender(true);

      const needToPermit =
        permit2allowance.amount < BigInt(props.amount) ||
        permit2allowance.expiration < Date.now() / 1000;
      if (needToPermit) setNeedToPermit(true);
      else setReadyToSend(true);
    }
  }, [props.position, sign, props.timeEx2, props.timeEx]);

  // sign error handler

  useEffect(() => {
    if (sign.isError) props.setPositionError(2);
  }, [sign.isError]);

  useEffect(() => {
    if (needToPermit) sign.signTypedData();
  }, [needToPermit]);

  useEffect(() => {
    if (sign.data || readyToSend) {
      if (sign.data) {
        const isv = verifyTypedData(domain, types, values, sign.data);
        // TODO: write error throw if signature invalid
      }

      let curentTokenDecimals: number;

      if (props.chainId === 137) {
        curentTokenDecimals = tokens.polygon.filter(
          (t) => t.address === tokenB.address
        )[0].nano;
      } else {
        curentTokenDecimals = tokens.mainnet.filter(
          (t) => t.address === tokenB.address
        )[0].nano;
      }

      const amountOut = ethers.utils.parseUnits(
        props.amountOut,
        curentTokenDecimals
      );

      if (!firstRender2 && firstRender) {
        setFirstRender2(true);
        // data.wait(1).then(() => {
        router.getRouter(amountOut, tokenA, tokenB).then(path => {
          if (path) {
            const deadline = ~~(Date.now() / 1000) + 60 * 32;

            const valuesSign: any = values;
            valuesSign.signature = sign.data;

            const permit2permit: Permit2Permit = valuesSign;


            const swapOptions: SwapOptions = {
              slippageTolerance: new Percent('90', '100'),
              deadlineOrPreviousBlockhash: deadline.toString(),
              recipient: UNIVERSAL_ROUTER,
            };

            if (needToPermit) swapOptions.inputTokenPermit = permit2permit;

            const { calldata, value } = SwapRouter.swapERC20CallParameters(
              path.trade,
              swapOptions
            );


            const encodedTx = encodePay(calldata, +amountOut, curentTokenDecimals, props.uuid);

            props.setDataTr(encodedTx);

            props.setPosition(2);

            props.reRender(3);
          } else {
            props.consoleLog('Error path', false);
            props.setPositionError(1);
          }
        });
        // })
      }

      // )
    }
  }, [props.position, sign.data, readyToSend]);

  return (
    <SimpleCell
      disabled={props.positionError !== 2}
      onClick={() => props.reRender(2)}
      style={props.position !== 1 ? { opacity: 0.5 } : {}}
      after={props.positionError === 2 ? <Icon28RefreshOutline /> : null}
      before={
        <div>
          {props.positionError === 2 ? (
            <Icon28CancelCircleOutline fill="var(--vkui--color_background_negative)" />
          ) : null}
          {props.position < 1 && props.positionError !== 2 ? (
            <Icon28CheckCircleOff />
          ) : null}
          {props.position === 1 && props.positionError !== 2 ? (
            <div className="process-spinner">
              <Icon24Spinner width={28} height={28} />
            </div>
          ) : null}
          {props.position > 1 && props.positionError !== 2 ? (
            <Icon28CheckCircleOn fill="var(--vkui--color_background_positive--active)" />
          ) : null}
        </div>
      }
    >
      Sign your tokens
    </SimpleCell>
  );
};

const ProcessThree: React.FC<ProcessType> = (props: ProcessType) => {
  const [firstRender, setFirstRender] = useState<boolean>(false);

  const { config } = usePrepareSendTransaction({
    request: {
      to: props.universalRouter, // NOTE: custom_contract
      // to: '0xC1dE05611B3C8cA7a8C6CC265fAA97DD12F14ABf',
      data: props.dataTr,
      value: BigNumber.from('0'),
    },
  });
  const { data, sendTransaction, error } =
    useSendTransaction(config);

  useEffect(() => {
    if (
      !firstRender &&
      props.position === 2 &&
      sendTransaction &&
      props.dataTr
    ) {
      setFirstRender(true);

      console.log('props.dataTr', props.dataTr);
      setTimeout(() => {
        sendTransaction();
      }, 1000);
    }
  }, [props.position, props.dataTr, sendTransaction]);

  useEffect(() => {
    if (props.dataTr) {
      console.log('props.dataTr 2', props.dataTr);
      props.reRender(3);
    }
  }, [props.dataTr]);


  useEffect(() => {
    if (data) {
      console.log('txHash transfer', data);
      data.wait(1).then(() => {
        props.setPosition(3);

        props.setPayed(true);
      });
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      console.log('error: ', error);
      props.consoleLog(error?.message ?? 'Unknown error', false);
      props.setPositionError(3);
    }
  }, [error]);

  return (
    <SimpleCell
      disabled={props.positionError !== 2}
      onClick={() => props.reRender(2)}
      style={props.position !== 2 ? { opacity: 0.5 } : {}}
      after={props.positionError === 3 ? <Icon28RefreshOutline /> : null}
      before={
        <div>
          {props.positionError === 3 ? (
            <Icon28CancelCircleOutline fill="var(--vkui--color_background_negative)" />
          ) : null}
          {props.position < 2 && props.positionError !== 3 ? (
            <Icon28CheckCircleOff />
          ) : null}
          {props.position === 2 && props.positionError !== 3 ? (
            <div className="process-spinner">
              <Icon24Spinner width={28} height={28} />
            </div>
          ) : null}
          {props.position > 2 && props.positionError !== 3 ? (
            <Icon28CheckCircleOn fill="var(--vkui--color_background_positive--active)" />
          ) : null}
        </div>
      }
    >
      Sign transaction
    </SimpleCell>
  );
};

export const ProcessAll: React.FC<AllType> = (props: AllType) => {
  const [firstRender, setFirstRender] = useState<boolean>(false);

  const [position, setPosition] = useState<number>(0);
  const [positionError, setPositionError] = useState<number>(0);

  const [oneId, setOneId] = useState<string>('100');
  const [twoId, setTwoId] = useState<string>('200');
  const [treId, setTreId] = useState<string>('300');

  const [dataTr, setDataTr] = useState<string | undefined>(undefined);

  const [feeData, setFeeData] = useState<
    ethers.providers.FeeData | undefined
  >(undefined);

  const [timeEx, setTimeEx] = useState<string | undefined>(undefined);
  const [timeEx2, setTimeEx2] = useState<string | undefined>(undefined);

  const universalRouter = UNIVERSAL_ROUTER;

  const addressPermit = PERMIT2_ADDRESS;

  function reRender(id: number) {
    if (id === 1) {
      setOneId(`${Number(oneId) + 1}`);
    }
    if (id === 2) {
      setTwoId(`${Number(twoId) + 1}`);
    }
    if (id === 3) {
      setTreId(`${Number(twoId) + 1}`);
    }
    setPositionError(0);
  }

  const provider = new ethers.providers.JsonRpcProvider(
    props.chainId === 137
      ? 'https://side-dawn-sea.matic.quiknode.pro/ce9f1f0946472d034b646717ed6b29a175b85dba'
      : 'https://bitter-empty-energy.quiknode.pro/e49a9bbc66c87c52f9d677d0f96e667f0c2bc300/'
  );

  useEffect(() => {
    if (!firstRender) {
      setFirstRender(true);

      provider.getFeeData().then((value) => {
        setFeeData(value);
      });

      setTimeEx(BigInt(~~(Date.now() / 1000) + 60 * 30).toString());
      setTimeEx2(BigInt(~~(Date.now() / 1000) + 60 * 60 * 24 * 30).toString());
    }
  }, []);

  useEffect(() => {
    if (position === 0) {
      props.setProgress(50);
    }
    if (position === 1) {
      props.setProgress(75);
    }
    if (position === 2) {
      props.setProgress(100);
    }
  }, [position]);

  return (
    <div id={props.id} className="process-block">
      <ProcessOne
        key={oneId}
        address={props.address}
        addressPolus={addressPermit}
        tokenAddress={props.tokenAddress}
        setPosition={setPosition}
        position={position}
        positionError={positionError}
        setPositionError={setPositionError}
        amount={props.amount}
        addressMerchant={props.addressMerchant}
        uuid={props.uuid}
        currentAddressToken={props.currentAddressToken}
        consoleLog={props.consoleLog}
        reRender={reRender}
        setPayed={props.setPayed}
        universalRouter={universalRouter}
        setDataTr={setDataTr}
        dataTr={dataTr}
        chainId={props.chainId}
        amountOut={props.amountOut}
        feeData={feeData}
        timeEx={timeEx}
        timeEx2={timeEx2}
      />
      <ProcessTwo
        key={twoId}
        address={props.address}
        addressPolus={addressPermit}
        tokenAddress={props.tokenAddress}
        setPosition={setPosition}
        position={position}
        positionError={positionError}
        setPositionError={setPositionError}
        amount={props.amount}
        addressMerchant={props.addressMerchant}
        uuid={props.uuid}
        currentAddressToken={props.currentAddressToken}
        consoleLog={props.consoleLog}
        reRender={reRender}
        setPayed={props.setPayed}
        universalRouter={universalRouter}
        setDataTr={setDataTr}
        dataTr={dataTr}
        chainId={props.chainId}
        amountOut={props.amountOut}
        feeData={feeData}
        timeEx={timeEx}
        timeEx2={timeEx2}
      />
      <ProcessThree
        key={treId}
        address={props.address}
        addressPolus={addressPermit}
        tokenAddress={props.tokenAddress}
        setPosition={setPosition}
        position={position}
        positionError={positionError}
        setPositionError={setPositionError}
        amount={props.amount}
        addressMerchant={props.addressMerchant}
        uuid={props.uuid}
        currentAddressToken={props.currentAddressToken}
        consoleLog={props.consoleLog}
        reRender={reRender}
        setPayed={props.setPayed}
        universalRouter={universalRouter}
        setDataTr={setDataTr}
        dataTr={dataTr}
        chainId={props.chainId}
        amountOut={props.amountOut}
        feeData={feeData}
        timeEx={timeEx}
        timeEx2={timeEx2}
      />
    </div>
  );
};
