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
  },
  placeholder: {
    color: theme.palette.grey[500],
  },
  contentEditable: {
    marginTop: "-22px",
  },
}));

const ContentEditable = (): JSX.Element => {
  const { classes, cx } = useStyles();
  const [editor] = useLexicalComposerContext();
  const [isEditable, setEditable] = useState(false);
  const [root, setRoot] = useState("");

  const ref = useCallback(
    (rootElement: null | HTMLElement) => {
      editor.setRootElement(rootElement);
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
    <div className={classes.input}>
      {root.length === 0 && (
        <Typography className={classes.placeholder}>Send a message</Typography>
      )}
      <div
        contentEditable={isEditable}
        ref={ref}
        className={cx(root.length === 0 && classes.contentEditable)}
      />
    </div>
  );
};

export default ContentEditable;
