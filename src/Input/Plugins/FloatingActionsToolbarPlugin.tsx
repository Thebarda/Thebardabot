import { Paper, Popper, Typography } from "@mui/material";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalEditor } from "lexical/LexicalEditor";
import { useCallback, useEffect, useState } from "react";
import { $getSelection, $isRangeSelection } from "lexical";
import { $isTextNode } from "lexical";
import { mergeRegister } from "@lexical/utils";
import { getSelectedNode } from "../utils/getSelectedNode";
import { getDOMRangeRect } from "../utils/getDOMRangeRect";

const Toolbar = ({
  anchorElem,
  editor,
}: {
  editor: LexicalEditor;
  anchorElem: HTMLElement;
}): JSX.Element => {
  const [xOffset, setXOffset] = useState(0);
  const nativeSelection = window.getSelection();
  const rootElement = editor.getRootElement();

  useEffect(() => {
    if (nativeSelection === null || rootElement === null) {
      return;
    }

    const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

    setXOffset(rangeRect.x);
  }, [nativeSelection, rootElement]);

  return (
    <Popper open={xOffset !== 0} placement="bottom-start" anchorEl={anchorElem}>
      <Paper sx={{ marginLeft: `calc(${xOffset}px - 8px)` }}>
        <Typography>heyyy</Typography>
      </Paper>
    </Popper>
  );
};

const useFloatingTextFormatToolbar = (
  editor: LexicalEditor,
  anchorElem: HTMLElement
) => {
  const [isText, setIsText] = useState(false);

  const updatePopup = useCallback(() => {
    editor.getEditorState().read(() => {
      if (editor.isComposing()) {
        return;
      }
      const selection = $getSelection();
      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();

      if (
        nativeSelection !== null &&
        (!$isRangeSelection(selection) ||
          rootElement === null ||
          !rootElement.contains(nativeSelection.anchorNode))
      ) {
        setIsText(false);
        return;
      }

      if (!$isRangeSelection(selection)) {
        return;
      }

      const node = getSelectedNode(selection);

      if (selection.getTextContent() !== "") {
        setIsText($isTextNode(node));
      } else {
        setIsText(false);
      }
    });
  }, [editor]);

  useEffect(() => {
    document.addEventListener("selectionchange", updatePopup);
    return () => {
      document.removeEventListener("selectionchange", updatePopup);
    };
  }, [updatePopup]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updatePopup();
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false);
        }
      })
    );
  }, [editor, updatePopup]);

  if (!isText) {
    return null;
  }

  return <Toolbar anchorElem={anchorElem} editor={editor} />;
};

const FloatingActionsToolbarPlugin = ({
  anchorElem = document.body,
}: {
  anchorElem?: HTMLElement;
}): JSX.Element | null => {
  const [editor] = useLexicalComposerContext();

  return useFloatingTextFormatToolbar(editor, anchorElem);
};

export default FloatingActionsToolbarPlugin;
