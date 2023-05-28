import s from "./QuestionButton.module.css"
interface Props {
  onClick: () => void;
  visible: boolean;
}
export const QuestionButton = (props: Props) => {

  return (
    <div
      className={`${s.appBack} ${props.visible ? s.appBackVisible : ""}`}
      onClick={props.onClick}
    >
      Help
    </div>
  );
};
