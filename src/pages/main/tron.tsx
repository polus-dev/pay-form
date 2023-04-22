import React, { useEffect } from 'react'
import { QRCode } from 'react-qr-svg'

interface AllType {
    id: string,
    address: string

}

export const Tron: React.FC<AllType> = (props: AllType) => {
    const [ firstRender, setFirstRender ] = React.useState<boolean>(false)

    useEffect(() => {
        if (!firstRender) {
            setFirstRender(true)
        }
    }, [])

    return (
        <div>
            <h2 style={{
                textAlign: 'center',
                marginBottom: '16px',
                marginTop: '12px'
            }}>Send USDT</h2>
            <div style={{
                padding: '20px',
                borderRadius: '16px',
                background: '#fff',
                margin: '0 auto',
                textAlign: 'center',
                marginBottom: '10px'
            }}>
                <QRCode
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    level="Q"
                    style={{ width: 256 }}
                    value={props.address}
                />
            </div>
        </div>
    )
}
