import { Snackbar } from "@vkontakte/vkui";
import { Icon28CancelCircleFillRed, Icon28CheckCircleFill } from "@vkontakte/icons";

interface Props {
  data: string;
  type?: boolean
  onClose: () => void;
}
export function ConsoleLog(props: Props) {
  return (
    <Snackbar
      before={
        props.type ? <Icon28CheckCircleFill /> : <Icon28CancelCircleFillRed />
      }
      onClose={props.onClose}
    >
      {props.data}
    </Snackbar>
  );
}
