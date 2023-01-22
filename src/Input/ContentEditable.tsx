import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Typography } from "@mui/material";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  input: {
    backgroundColor: theme.palette.grey[800],
    "& p": {
      margin: 0,
    },
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.grey[800]}`,
  },
  placeholder: {
    color: theme.palette.grey[500],
    pointerEvents: "none",
  },
  emptyContentEditable: {
    marginTop: "-22px",
  },
  contentEditable: {
    outline: "0px solid transparent",
  },
  contentEditableFocused: {
    border: `1px solid ${theme.palette.primary.main}`,
  },
}));

interface Props {
  onRef: (rootElement: HTMLElement) => void;
}

const ContentEditable = ({ onRef }: Props): JSX.Element => {
  const { classes, cx } = useStyles();
  const [editor] = useLexicalComposerContext();
  const [isEditable, setEditable] = useState(false);
  const [isFocused, setFocused] = useState(false);
  const [root, setRoot] = useState("");

  const ref = useCallback(
    (rootElement: null | HTMLElement) => {
      editor.setRootElement(rootElement);
      if (rootElement) {
        onRef(rootElement);
      }
    },
    [editor]
  );

  useLayoutEffect(() => {
    setEditable(editor.isEditable());
    return editor.registerEditableListener((currentIsEditable) => {
      setEditable(currentIsEditable);
    });
  }, [editor]);

  useEffect(() => {
    editor.registerTextContentListener((currentRoot) => {
      setRoot(currentRoot);
    });
  }, [editor]);

  return (
    <div
      className={cx(classes.input, isFocused && classes.contentEditableFocused)}
    >
      {root.length === 0 && (
        <Typography className={classes.placeholder}>Send a message</Typography>
      )}
      <div
        contentEditable={isEditable}
        ref={ref}
        className={cx(
          root.length === 0 && classes.emptyContentEditable,
          classes.contentEditable
        )}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
};

export default ContentEditable;
