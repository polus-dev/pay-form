import { Input, SimpleCell } from "@vkontakte/vkui";
import React, { useEffect } from "react";
import { QRCode } from "react-qr-svg";
import usdtLogo from '../../img/usdt.svg';

interface AllType {
	id: string;
	address: string;
}

export const Tron: React.FC<AllType> = (props: AllType) => {
	const [firstRender, setFirstRender] = React.useState<boolean>(false);

	useEffect(() => {
		if (!firstRender) {
			setFirstRender(true);
		}
	}, []);

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
					textAlign: "center",
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
						width: 256,
						padding: '20px',
						borderRadius: "16px",
						background: "#fff",
					}}
					value={props.address}
				/>

				
			</div>
			<Input 
					value={props.address}
					onChange={() => null}
					style={{marginBottom: '10px'}}
				
				/>
		</div>
	);
};
