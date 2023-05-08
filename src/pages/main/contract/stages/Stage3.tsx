
import { SimpleCell } from "@vkontakte/vkui"
import { Icon24Spinner, Icon28CancelCircleOutline, Icon28CheckCircleOff, Icon28CheckCircleOn, Icon28RefreshOutline } from "@vkontakte/icons"
import { FC, memo, useEffect, useState } from "react"
import { ProcessType } from "../ProcessType"

export const Stage3: FC<ProcessType> = memo(props => {
  const [firstRender, setFirstRender] = useState(false)

  useEffect(() => {
    if (!firstRender) {
      setFirstRender(true)
    }
  }, [])

  useEffect(() => {
    if (props.position === 2) {
      props.polusApi.changeBlockchain(props.uuid, 'evm') // смена блокчеина для богдана
    }

  }, [props.position])

  return (
    <SimpleCell
      disabled
      style={
        props.position !== 2
          ? { opacity: 0.5, marginBottom: "24px" }
          : { marginBottom: "24px" }
      }
      before={
        <div>
          {props.position < 2 ? <Icon28CheckCircleOff /> : null}
          {props.position === 2 ? (
            <Icon28CheckCircleOn fill="var(--button_commerce_background)" />
          ) : null}
        </div>
      }
    >
      Payment successfull
    </SimpleCell>
  )
})
