import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Heading from "@tiptap/extension-heading";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header"; 
import Youtube from "@tiptap/extension-youtube";
import Image from "@tiptap/extension-image";

import { createLowlight, common } from "lowlight";
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';

const lowlight = createLowlight(common);
lowlight.register('javascript', javascript);
lowlight.register('python', python);

import { useEffect } from "react";
import type { FC } from "react";

interface TextEditorProps {
  onChange: (html: string) => void;
  content: string;
}

const TextEditor: FC<TextEditorProps> = ({ onChange, content }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader, 
      TableCell,
      Youtube.configure({ inline: false }),
      Image,
    ],
    content: content || "<p>Start writing here…</p>",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => () => editor?.destroy(), [editor]);

  if (!editor) return null;

  const addYouTube = () => {
    const url = prompt("YouTube URL?");
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  const addLink = () => {
    const url = prompt("Link URL?");
    if (url) editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const addImage = () => {
    const url = prompt("Image URL?");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const toggleCommand = (cmd: string) => {
    switch (cmd) {
      case "bold":
        editor.chain().focus().toggleBold().run(); break;
      case "italic":
        editor.chain().focus().toggleItalic().run(); break;
      case "underline":
        editor.chain().focus().toggleUnderline().run(); break;
      case "strike":
        editor.chain().focus().toggleStrike().run(); break;
      default:
        break;
    }
  };

  return (
    <div className="border rounded-lg bg-white">
      <div className="flex flex-wrap gap-2 p-2 border-b">
        {["bold", "italic", "underline", "strike"].map(cmd => (
          <button key={cmd}
            onClick={() => toggleCommand(cmd)}
            className={`px-2 ${editor.isActive(cmd) ? "bg-blue-600 text-white" : ""}`}>
            {cmd}
          </button>
        ))}
        <select
          value={editor.getAttributes('heading').level || ""}
          onChange={e => editor.chain().focus().toggleHeading({ level: parseInt(e.target.value) as 1 | 2 | 3 }).run()}>
          <option value="">P</option>
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
        </select>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()}>Code</button>
        <button onClick={addLink}>Link</button>
        <button onClick={addYouTube}>YouTube</button>
        <button onClick={insertTable}>Table</button>
        <button onClick={addImage}>Image</button>
      </div>

      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <button onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button onClick={addLink}>Link</button>
      </BubbleMenu>

      <EditorContent editor={editor} className="p-4 min-h-[300px] prose max-w-none" />
    </div>
  );
};

export default TextEditor;
