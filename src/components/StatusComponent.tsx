import { Icon28CheckCircleFill, Icon28WarningTriangleOutline } from "@vkontakte/icons"
import { Panel, PanelHeader, Spinner } from "@vkontakte/vkui"

interface StatusComponentProps {
  status: "succsess" | "error" | "loading"
  message: string
}


export const StatusComponent = (props: StatusComponentProps) => {
  return (

    <Panel id="render">
      <PanelHeader separator={false} />
      <div
        className={`pay-block smart-line ${props.status === "error" ? "smart-line-error-color"
          : props.status === "succsess"
            ? "smart-line-succsess-color"
            : "smart-line-loading-color"
          } `}
      >
        <div
          className="slide-in-bck-center"
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          {props.status === "succsess" ? <Icon28CheckCircleFill /> : null}

          {props.status === "loading" ? (
            <Spinner size="large" style={{ margin: "20px 0" }} />
          ) : null}
          {props.status === "error" ? (
            <Icon28WarningTriangleOutline fill="var(--vkui--color_background_negative)" />
          ) : null}
          <span style={{ margin: "16px 0" }}>{props.message}</span>
        </div>

      </div>
    </Panel>
  )
}
