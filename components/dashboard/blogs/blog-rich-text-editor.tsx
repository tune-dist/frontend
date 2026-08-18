'use client';

import { useRef, useEffect } from 'react';
import { Bold, Italic, List, Heading2, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDisplayUrl } from '@/lib/api/s3';
import toast from 'react-hot-toast';
import { uploadFileDirectly } from '@/lib/upload/chunk-uploader';

interface BlogRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  uploadSlug: string;
  disabled?: boolean;
}

function normalizeEditorHtml(html: string): string {
  return html.replace(
    /<img([^>]*?)src=["'][^"']*["']([^>]*?)data-s3-key=["']([^"']+)["']([^>]*)>/gi,
    '<img$1data-s3-key="$3" src="$3"$2$4>',
  ).replace(
    /<img([^>]*?)data-s3-key=["']([^"']+)["']([^>]*?)src=["'][^"']*["']([^>]*)>/gi,
    '<img$1data-s3-key="$2" src="$2"$3$4>',
  );
}

export default function BlogRichTextEditor({
  value,
  onChange,
  uploadSlug,
  disabled = false,
}: BlogRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
    void signImagesInEditor();
  }, [value]);

  const signImagesInEditor = async () => {
    if (!editorRef.current) return;

    const images = editorRef.current.querySelectorAll('img[data-s3-key]');
    for (const img of Array.from(images)) {
      const key = img.getAttribute('data-s3-key');
      if (!key || key.startsWith('http')) continue;

      try {
        const signed = await getDisplayUrl(key);
        img.setAttribute('src', signed);
      } catch {
        img.setAttribute('src', key);
      }
    }
  };

  const emitChange = () => {
    if (!editorRef.current) return;
    onChange(normalizeEditorHtml(editorRef.current.innerHTML));
  };

  const runCommand = (command: string, valueArg?: string) => {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand(command, false, valueArg);
    emitChange();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || disabled) return;

    if (!uploadSlug.trim()) {
      toast.error('Enter a title first to upload images');
      return;
    }

    try {
      const result = await uploadFileDirectly(file, '', undefined, 'blog', uploadSlug, 'content');
      editorRef.current?.focus();
      document.execCommand(
        'insertHTML',
        false,
        `<img data-s3-key="${result.path}" src="${result.path}" alt="" style="max-width:100%;height:auto;border-radius:8px;margin:12px 0;" />`,
      );
      emitChange();
      void signImagesInEditor();
      toast.success('Image inserted');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload image');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 rounded-lg border border-border/80 bg-muted/30 p-2">
        <Button type="button" size="sm" variant="ghost" disabled={disabled} onClick={() => runCommand('bold')}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={disabled} onClick={() => runCommand('italic')}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={disabled} onClick={() => runCommand('formatBlock', 'h2')}>
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={disabled} onClick={() => runCommand('insertUnorderedList')}>
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={emitChange}
        className="min-h-[240px] rounded-lg border border-border/80 bg-background px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 prose prose-invert max-w-none [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_p]:mb-3"
      />
    </div>
  );
}
