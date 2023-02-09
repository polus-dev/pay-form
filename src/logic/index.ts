import { useContractRead } from 'wagmi'
import { TokenPolus } from './types'
import polus_abi from '../polus_abi.json'
import token_abi from '../token_abi.json'


class PolusTokenUtils {
    private _token: TokenPolus

    private _addressUser: string

    private _addressPolus: string

    constructor (token: TokenPolus, chainId: number, addressUser: string) {
        this._token = token
        this._addressUser = addressUser
        this._addressPolus = chainId === 137
            ? '0x7D45c9Cf1263Db05065Dd446e5C6605adE19fBc2'
            : '0x0b89D43B3DD86f75c6010aB45395Cb9430Ff49B0'
    }

    // public async sync (): Promise<PolusTokenUtils> {
    //     if (!this._wallet.account || !this._wallet.provider?.web3Provider) console.error('Wallet is not connected')
    //     return this
    // }

    public async isApprove (): Promise<unknown> {
        const addr: `0x${string}` = `0x${this._token.address.replace('0x', '')}`
        const contractRead = await useContractRead({
            address: addr,
            abi: token_abi,
            functionName: 'allowance',
            args: [ this._addressUser, this._addressPolus ]
        }).data

        console.log(contractRead)

        return contractRead
    }

    // public async approve (amount: ethers.BigNumber | number = ethers.constants.MaxUint256): Promise<string | undefined> {
    //     const isA = await this.isApprove()
    //     console.log(`approve ${this._token.name}`, isA)
    //     if (Number(isA) === 0 || isA === '0x' || isA === '0x0' || isA === '0x00') {
    //         const contract = new ethers.Contract(this._token.address, this._token.abi, this._wallet.provider.web3Provider)
    //         const transaction = await contract.populateTransaction.approve(
    //             this._addressPolus,
    //             amount
    //         )
    //         const tr = await this._wallet.writeTransaction(transaction)
    //         return tr
    //     }
    //     return isA
    // }

    // public async send (to: string, amount: ethers.BigNumber | number): Promise<string | undefined> {
    //     const contract = new ethers.Contract(this._token.address, this._token.abi, this._wallet.provider.web3Provider)
    //     const transaction = await contract.populateTransaction.transfer(
    //         to, amount
    //     )
    //     const tr = await this._wallet.writeTransaction(transaction)

    //     return tr
    // }

    // public async swapEqualInOutToken (addressMerchant: string, amount: ethers.BigNumber | number | BigInt, uuid: string) {
    //     const contract = new ethers.Contract(this._addressPolus, abi.abi, this._wallet.provider.web3Provider)
    //     const transaction = await contract.populateTransaction.swapEqualInOutToken(
    //         this._token.address, addressMerchant, amount, `0x${uuid}`
    //     )
    //     const tr = await this._wallet.writeTransaction(transaction)

    //     return tr
    // }

    // public async swapExactInputSingleHop (addressMerchant: string, amount: ethers.BigNumber | number | BigInt, currentAddressToken: string, uuid: string) {
    //     const contract = new ethers.Contract(this._addressPolus, abi.abi, this._wallet.provider.web3Provider)
    //     console.log('amount', amount)

    //     console.log('this._token.address', this._token.address)
    //     console.log('currentAddressToken', currentAddressToken)
    //     const transaction = await contract.populateTransaction.swapExactInputSingleHop(
    //         this._token.address,
    //         currentAddressToken,
    //         addressMerchant,
    //         amount,
    //         `0x${uuid}`,
    //         3000 // fee ??
    //     )
    //     const tr = await this._wallet.writeTransaction(transaction)

    //     return tr
    // }
}

export { PolusTokenUtils }
