import s from "./QuestionButton.module.css"
export const QuestionButton = () => {
  const visible = true;

  const handleClick = () => {};

  return (
    <div
      className={`${s.appBack} ${visible ? s.appBackVisible : "s"}`}
      onClick={handleClick}
    >
      ?
    </div>
  );
};
