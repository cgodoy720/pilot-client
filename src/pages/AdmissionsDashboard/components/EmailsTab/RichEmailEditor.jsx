/**
 * RichEmailEditor
 *
 * WYSIWYG email body editor built on Tiptap + StarterKit.
 * Accepts/emits HTML. Paste from Google Docs, Notion, Word, etc. is supported natively.
 */
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold, Italic, Strikethrough, List, ListOrdered, Quote,
  Heading1, Heading2, Heading3, Undo2, Redo2, Code, Minus
} from 'lucide-react';
import './RichEmailEditor.css';

const ToolbarBtn = ({ onClick, active, title, children }) => (
  <button
    type="button"
    onMouseDown={e => { e.preventDefault(); onClick(); }}
    title={title}
    className={`p-1.5 rounded text-sm transition-colors ${
      active
        ? 'bg-[#4242ea] text-white'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    {children}
  </button>
);

const Sep = () => <div className="w-px h-5 bg-gray-200 mx-0.5 self-center" />;

export default function RichEmailEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.isEmpty ? '' : editor.getHTML());
    },
    editorProps: {
      attributes: {
        'data-placeholder': placeholder || 'Hi {{firstName}}, …',
      },
    },
  });

  // Sync when value is set externally (editing a saved draft)
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? '' : editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || '', false);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null;

  const tb = (title, isActive, action, Icon) => (
    <ToolbarBtn key={title} onClick={action} active={isActive} title={title}>
      <Icon className="h-3.5 w-3.5" />
    </ToolbarBtn>
  );

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-[#4242ea] focus-within:border-[#4242ea]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        {tb('Bold',          editor.isActive('bold'),    () => editor.chain().focus().toggleBold().run(),    Bold)}
        {tb('Italic',        editor.isActive('italic'),  () => editor.chain().focus().toggleItalic().run(),  Italic)}
        {tb('Strikethrough', editor.isActive('strike'),  () => editor.chain().focus().toggleStrike().run(),  Strikethrough)}
        {tb('Inline Code',   editor.isActive('code'),    () => editor.chain().focus().toggleCode().run(),    Code)}
        <Sep />
        {tb('Heading 1', editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), Heading1)}
        {tb('Heading 2', editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), Heading2)}
        {tb('Heading 3', editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), Heading3)}
        <Sep />
        {tb('Bullet List',   editor.isActive('bulletList'),  () => editor.chain().focus().toggleBulletList().run(),  List)}
        {tb('Ordered List',  editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), ListOrdered)}
        {tb('Blockquote',    editor.isActive('blockquote'),  () => editor.chain().focus().toggleBlockquote().run(),  Quote)}
        {tb('Divider Line',  false,                          () => editor.chain().focus().setHorizontalRule().run(), Minus)}
        <Sep />
        {tb('Undo', false, () => editor.chain().focus().undo().run(), Undo2)}
        {tb('Redo', false, () => editor.chain().focus().redo().run(), Redo2)}

        <span className="ml-auto text-xs text-gray-400 font-proxima pr-1 hidden sm:block">
          Paste from Docs, Notion, or Word — formatting preserved
        </span>
      </div>

      {/* Editor */}
      <div className="rich-email-editor bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* Variable hint */}
      <div className="bg-gray-50 border-t border-gray-100 px-3 py-1.5 text-xs text-gray-400 font-proxima">
        Merge tags: <code className="bg-gray-100 px-1 rounded text-gray-500">{'{{firstName}}'}</code>{' '}
        <code className="bg-gray-100 px-1 rounded text-gray-500">{'{{lastName}}'}</code>
      </div>
    </div>
  );
}
