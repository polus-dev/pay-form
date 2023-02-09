import axios from 'axios'
import { Invoice } from './types'

class PolusApi {
    private _url: string = 'https://pay.polus.fi/'

    constructor (url?: string) {
        if (url) this._url = url
    }

    public async getPaymentInfo (uuid: string): Promise<Invoice | undefined> {
        const res = await axios.post(`${this._url}api/v1/payment/info`, { uuid })

        if (res.data.status === 'error') {
            console.error(res.data.result)
            return undefined
        }

        const resData: Invoice = res.data.result
        return resData
    }
}

export { PolusApi }
