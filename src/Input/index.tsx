import { grey } from "@mui/material/colors";
import { useAtomValue } from "jotai";
import { equals, includes, isEmpty, slice, __ } from "ramda";
import { FC, FormEvent, KeyboardEvent, useRef, useState } from "react";
import { makeStyles } from "tss-react/mui";
import { tabsAtom, tabWidthAtom } from "../atoms";
import Placeholder from "./Placeholder";

const isRestrictedInput = includes(__, [
  "Alt",
  "AltGraph",
  "Control",
  "Shift",
  "Meta",
  "Command",
  "Option",
  "Tab",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
]);

const isBackspace = equals("Backspace");

const isEnter = equals("Enter");

const useStyles = makeStyles<{ tabWidth: number }>()((theme, { tabWidth }) => ({
  inputContainer: {
    position: "relative",
    bottom: 0,
    backgroundColor: grey[800],
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.51, 2),
    marginBottom: "1px",
    minHeight: "36px",
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    width: `calc(${tabWidth}px - 1px)`,
  },
}));

interface Props {
  sendMessage: (message: string) => void;
}

const Input: FC<Props> = ({ sendMessage }) => {
  const [inputText, setInputText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const tabWidth = useAtomValue(tabWidthAtom);

  const { classes } = useStyles({ tabWidth });

  const inputRef = useRef<HTMLInputElement | null>(null);

  const beforeInput = (event: FormEvent<HTMLDivElement>) =>
    event.preventDefault();

  const changeInputText = (event: KeyboardEvent<HTMLDivElement>): void => {
    event.preventDefault();

    if (isRestrictedInput(event.key)) {
      return;
    }

    if (isEnter(event.key) && !isEmpty(inputText)) {
      sendMessage(inputText);
      setInputText("");
      inputRef.current?.blur();
      return;
    }

    if (isBackspace(event.key)) {
      setInputText((currentInputText) => slice(0, -1, currentInputText));
      return;
    }

    setInputText((currentInputText) => `${currentInputText}${event.key}`);
  };

  const focus = () => setIsFocused(true);

  const blur = () => setIsFocused(false);

  return (
    <div
      aria-label="Chat input"
      contentEditable
      className={classes.inputContainer}
      onKeyDown={changeInputText}
      onBeforeInput={beforeInput}
      onFocus={focus}
      onBlur={blur}
      tabIndex={0}
      ref={inputRef}
    >
      {isEmpty(inputText) && !isFocused && <Placeholder />}
      <div id="message">{inputText}</div>
    </div>
  );
};

export default Input;
