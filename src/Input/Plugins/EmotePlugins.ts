import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useAtomValue } from "jotai";
import { TextNode } from "lexical";
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

  const emote = emotes.find(
    ({ name }) => name.toLowerCase() === lastWord.toLowerCase()
  );

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

const useEmotes = (channel: string) => {
  const [editor] = useLexicalComposerContext();

  const emotes = useAtomValue(emotesAtom, channel);

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

interface Props {
  channel: string;
}

const EmotePlugin = ({ channel }: Props) => {
  useEmotes(channel);
  return null;
};

export default EmotePlugin;
