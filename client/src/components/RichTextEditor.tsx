import { useState, useEffect } from "react";
import { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEditor, EditorContent } from "@tiptap/react";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Heading1, 
  Heading2, 
  Heading3, 
  Undo, 
  Redo,
  Quote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setLinkUrl("");
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
    setImageUrl("");
  };

  const MenuButton = ({ 
    isActive, 
    onClick, 
    disabled = false, 
    icon,
    tooltip 
  }: { 
    isActive: boolean; 
    onClick: () => void; 
    disabled?: boolean; 
    icon: React.ReactNode;
    tooltip: string;
  }) => (
    <Button
      type="button"
      size="icon"
      variant={isActive ? "default" : "ghost"}
      onClick={onClick}
      disabled={disabled}
      className="rounded-md h-8 w-8"
      title={tooltip}
    >
      {icon}
    </Button>
  );

  return (
    <div className="border border-input rounded-md">
      <div className="bg-muted/40 p-1 border-b flex flex-wrap gap-1">
        <MenuButton
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          icon={<Bold className="h-4 w-4" />}
          tooltip="Bold"
        />
        <MenuButton
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          icon={<Italic className="h-4 w-4" />}
          tooltip="Italic"
        />
        <MenuButton
          isActive={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          icon={<Heading1 className="h-4 w-4" />}
          tooltip="Heading 1"
        />
        <MenuButton
          isActive={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          icon={<Heading2 className="h-4 w-4" />}
          tooltip="Heading 2"
        />
        <MenuButton
          isActive={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          icon={<Heading3 className="h-4 w-4" />}
          tooltip="Heading 3"
        />
        <MenuButton
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          icon={<List className="h-4 w-4" />}
          tooltip="Bullet List"
        />
        <MenuButton
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          icon={<ListOrdered className="h-4 w-4" />}
          tooltip="Ordered List"
        />
        <MenuButton
          isActive={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          icon={<Quote className="h-4 w-4" />}
          tooltip="Blockquote"
        />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant={editor.isActive('link') ? "default" : "ghost"}
              className="rounded-md h-8 w-8"
              title="Insert Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="button" 
                size="sm" 
                onClick={setLink}
              >
                {editor.isActive('link') ? 'Update' : 'Add'}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-md h-8 w-8"
              title="Insert Image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="button" 
                size="sm" 
                onClick={addImage}
              >
                Add
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="ml-auto flex gap-1">
          <MenuButton
            isActive={false}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            icon={<Undo className="h-4 w-4" />}
            tooltip="Undo"
          />
          <MenuButton
            isActive={false}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            icon={<Redo className="h-4 w-4" />}
            tooltip="Redo"
          />
        </div>
      </div>
      
      <EditorContent 
        editor={editor} 
        className={cn(
          "prose prose-sm sm:prose max-w-none",
          "focus:outline-none p-4 min-h-[250px]"
        )}
      />
    </div>
  );
}
