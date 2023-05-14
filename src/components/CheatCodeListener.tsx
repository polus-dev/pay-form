import { useEffect, useState } from 'react';

interface Props {
  code: string;
  onCheatCodeEntered: () => void;
}

export const CheatCodeListener = ({ code, onCheatCodeEntered }: Props) => {
  const [enteredKeys, setEnteredKeys] = useState<string[]>([]);

  const handleKeyDown = (event: KeyboardEvent) => {
    setEnteredKeys(keys => [...keys, event.key.toLowerCase()]);
  };

  useEffect(() => {
    const isCodeMatched = () => enteredKeys.join('').includes(code);

    if (isCodeMatched()) {
      onCheatCodeEntered();
      setEnteredKeys([]);
    }
  }, [enteredKeys, code, onCheatCodeEntered]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  return null;
};

