import {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  Spread,
  TextNode,
} from "lexical";

export type SerializedEmoteNode = Spread<
  {
    name: string;
    url: string;
    type: "emote";
  },
  SerializedTextNode
>;

export class EmoteNode extends TextNode {
  __url: string;

  constructor(text: string, url: string, key?: NodeKey) {
    super(text, key);
    this.__url = url;
  }

  static getType(): string {
    return "emote";
  }

  static clone(node: EmoteNode): EmoteNode {
    return new EmoteNode(node.__text, node.__url, node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const inner = document.createElement("img");

    inner.src = this.__url;
    inner.alt = this.__text;
    inner.style.verticalAlign = "text-top";
    inner.style.objectFit = "contain";
    inner.style.height = "22px";
    inner.attributes.setNamedItem(
      document.createAttribute("data-lexical-text")
    );

    return inner;
  }

  updateDOM(
    prevNode: TextNode,
    dom: HTMLElement,
    config: EditorConfig
  ): boolean {
    super.updateDOM(prevNode, dom, config);
    return false;
  }

  exportJSON(): SerializedEmoteNode {
    return {
      ...super.exportJSON(),
      name: this.__text,
      url: this.__url,
      type: "emote",
    };
  }
}

export function $createEmoteNode(text: string, url: string): EmoteNode {
  return new EmoteNode(text, url);
}

export function $isEmoteNode(node: LexicalNode): boolean {
  return node instanceof EmoteNode;
}
