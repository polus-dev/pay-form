import { Icon24Spinner, Icon28CancelCircleOutline, Icon28CheckCircleOn, Icon28RefreshOutline } from '@vkontakte/icons'
import { SimpleCell } from '@vkontakte/vkui'

interface StageProps {
  disabled: boolean;
  onClick: () => void;
  isError: boolean;
  isSuccsess: boolean;
  isLoading: boolean;
  text: string;
}

export const Stage = (props: StageProps) => {
  return (
    <SimpleCell
      disabled={props.disabled}
      onClick={props.onClick}
      style={props.disabled || props.isError ? { opacity: 0.5 } : {}}
      after={props.isError ? <Icon28RefreshOutline /> : null}
      before={
        <div>
          {props.isError ? (
            <Icon28CancelCircleOutline fill="var(--vkui--color_background_negative)" />
          ) : null}
          {props.isLoading ? (
            <div className="process-spinner">
              <Icon24Spinner width={28} height={28} />
            </div>
          ) : null}
          {props.isSuccsess ? (
            <Icon28CheckCircleOn fill="var(--vkui--color_background_positive--active)" />
          ) : null}
        </div>
      }
    >
      {props.text}
    </SimpleCell>
  )
}
