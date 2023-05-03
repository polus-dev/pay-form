/* eslint-disable max-len */
import { Card, CardGrid, Div, FormItem, IconButton, Input, SimpleCell } from "@vkontakte/vkui"
import React, { useEffect } from "react"
import { QRCode } from "react-qr-svg"
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Icon16CopyOutline, Icon28ErrorOutline } from "@vkontakte/icons"
import usdtLogo from '../../img/usdt.svg'
import { PolusApi } from "../../logic/api"

interface AllType {
    id: string,
    address: string,
    polusApi: PolusApi,
    uuid: string,
    amount: string,
    log: Function
}

export const Tron: React.FC<AllType> = (props: AllType) => {
    const [ firstRender, setFirstRender ] = React.useState<boolean>(false)

    useEffect(() => {
        if (!firstRender) {
            setFirstRender(true)

            props.polusApi.changeBlockchain(props.uuid, 'tron') // смена блокчеина для богдана
        }
    }, [])

    return (
        <div>
            <h2
                style={{
                    textAlign: "center",
                    marginBottom: "16px",
                    marginTop: "12px"
                }}
            >
				Send USDT <img src={usdtLogo} />
            </h2>
            <div
                style={{
                    margin: "0 auto",
                    marginBottom: "10px",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <QRCode
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    level="Q"
                    style={{ 
                        width: 170,
                        padding: '10px',
                        borderRadius: "16px",
                        background: "#fff"
                    }}
                    value={props.address}
                />

                <div>
                    <FormItem 
                        top="Amount">
                        <Input 
                            value={(Number(props.amount) / 10 ** 6) }
                            onChange={() => null}
                            style={{ marginBottom: '10px', marginTop: '10px', userSelect: 'all' }}
                            after={
                                <CopyToClipboard text={(Number(props.amount) / 10 ** 6).toString()}
                                    onCopy={() => props.log('Copyed', true)}>
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
                            style={{ marginBottom: '10px', userSelect: 'all'  }}
                            after={
                                <CopyToClipboard text={props.address}
                                    onCopy={() => props.log('Copyed', true)}>
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
                    <Div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                        // flexDirection: 'column'
                    }}>
                        <span style={{ width: '100%' }}>
							Check the amount you send in USDT TRON, in case it will be different from {(Number(props.amount) / 10 ** 6)}, funds may be lost
                        </span>
                    </Div>
                </Card>
            </CardGrid>
			<br />

            
        </div>
    )
}
