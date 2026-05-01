import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Quote } from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}
      >
        <Italic size={16} />
      </button>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}
      >
        <ListOrdered size={16} />
      </button>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}
      >
        <Quote size={16} />
      </button>
    </div>
  );
};

export const RichTextEditor = ({ value, onChange, placeholder = 'Start typing...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] max-h-[400px] overflow-y-auto p-4 text-gray-700 bg-white',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Keep editor content in sync if value changes externally
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};
