import s from "./QuestionButton.module.css"
interface Props {
  onClick: () => void
}
export const QuestionButton = (props: Props) => {
  const visible = true;

  return (
    <div
      className={`${s.appBack} ${visible ? s.appBackVisible : ""}`}
      onClick={props.onClick}
    >
      Help
    </div>
  );
};
