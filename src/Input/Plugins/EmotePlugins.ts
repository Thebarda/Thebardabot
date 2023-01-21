import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useAtomValue } from "jotai";
import { LexicalEditor, TextNode } from "lexical";
import { last, split } from "ramda";
import { useEffect } from "react";
import { emotesAtom } from "../../atoms";
import { Emote } from "../../models";
import { $createEmoteNode } from "../Nodes/EmoteNode";

const emoteTransform = (emotes: Array<Emote>) => (node: TextNode) => {
  let targetNode;
  const textContent = node.getTextContent();

  const lastWord = last(split(" ", textContent)) || "";

  const endIndexLastWord = textContent.length;
  const startIndexLastWord = textContent.length - lastWord?.length;

  const emote = emotes.find(({ name }) => name === lastWord);

  if (emote) {
    node.setTextContent(`${textContent} `);

    const [, emptyNode] = node.splitText(
      endIndexLastWord,
      endIndexLastWord + 2
    );

    if (emptyNode) {
      emptyNode.select(1, 1);
    }

    if (startIndexLastWord === 0) {
      [targetNode] = node.splitText(endIndexLastWord);
    } else {
      [, targetNode] = node.splitText(startIndexLastWord, endIndexLastWord);
    }

    const emoteNode = $createEmoteNode(lastWord, emote.url);

    targetNode.replace(emoteNode);

    return emoteNode;
  }

  return null;
};

const useEmotes = (editor: LexicalEditor) => {
  const emotes = useAtomValue(emotesAtom);

  useEffect(() => {
    const removeTransform = editor.registerNodeTransform(
      TextNode,
      emoteTransform(emotes)
    );
    return () => {
      removeTransform();
    };
  }, [editor, emotes]);
};

const EmotePlugin = () => {
  const [editor] = useLexicalComposerContext();
  useEmotes(editor);
  return null;
};

export default EmotePlugin;
