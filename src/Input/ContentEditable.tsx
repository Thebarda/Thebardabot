import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  input: {
    backgroundColor: theme.palette.grey[800],
    padding: theme.spacing(0.5, 1),
    "& > p": {
      margin: 0,
    },
  },
}));

const ContentEditable = (): JSX.Element => {
  const { classes } = useStyles();
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
      {root.length === 0 && <p>placeholder</p>}
      <div contentEditable={isEditable} ref={ref} />
    </div>
  );
};

export default ContentEditable;
