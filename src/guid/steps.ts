interface IStep {
  selector: string;
  content: string;
}

export const steps: IStep[] = [
  {
    selector: ".guid__step--1",
    content: "connect your wallet",
  },
  {
    selector: ".guid__step--2",
    content: "choose your opportune blockchain",
  },

  {
    selector: ".guid__step--3",
    content: "choose your opportune cryptocurrency",
  },

  {
    selector: ".guid__step--4",
    content: "more cryptocurrency you can find in the list",
  },
];

const enum EGUID_CLASS {
  GUID = ".guid",
}
