import axios from 'axios'
import { Invoice } from './types'

class PolusApi {
  constructor(private _url: string = 'https://pay.polus.fi/') { }

  public async getPaymentInfo(uuid: string): Promise<Invoice | undefined> {
    const res = await axios.post(`${this._url}api/v1/payment/info`, { uuid })

    if (res.data.status === 'error') {
      console.error(res.data.result)
      return;
    }

    const resData: Invoice = res.data.result
    return resData
  }
}

export { PolusApi }
