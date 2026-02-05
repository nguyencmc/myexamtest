import React, { useRef, useCallback } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link,
  Unlink,
  Image,
  Code,
  Quote,
  Undo,
  Redo,
  RemoveFormatting,
  Subscript,
  Superscript,
  Highlighter,
  Palette,
  Upload,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

const FONT_SIZES = [
  { value: "1", label: "10px" },
  { value: "2", label: "13px" },
  { value: "3", label: "16px" },
  { value: "4", label: "18px" },
  { value: "5", label: "24px" },
  { value: "6", label: "32px" },
  { value: "7", label: "48px" },
];

const HEADING_OPTIONS = [
  { value: "p", label: "Paragraph" },
  { value: "h1", label: "Heading 1" },
  { value: "h2", label: "Heading 2" },
  { value: "h3", label: "Heading 3" },
  { value: "h4", label: "Heading 4" },
  { value: "h5", label: "Heading 5" },
  { value: "h6", label: "Heading 6" },
];

const COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
  "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff",
  "#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc",
];

const HIGHLIGHT_COLORS = [
  "#ffff00", "#00ff00", "#00ffff", "#ff00ff", "#ff0000", "#0000ff", "#ff9900", "#9900ff",
];

const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  {
    icon: React.ReactNode;
    tooltip: string;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
  }
>(({ icon, tooltip, onClick, active, disabled }, ref) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        ref={ref}
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "h-8 w-8 p-0",
          active && "bg-accent text-accent-foreground"
        )}
      >
        {icon}
      </Button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="text-xs">
      {tooltip}
    </TooltipContent>
  </Tooltip>
));
ToolbarButton.displayName = "ToolbarButton";

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Nhập nội dung...",
  className,
  minHeight = "300px",
  onImageUpload,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [isUploading, setIsUploading] = useState(false);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  }, []);

  const handleContentChange = useCallback(() => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const formatBlock = useCallback((tag: string) => {
    if (tag === "p") {
      execCommand("formatBlock", "p");
    } else {
      execCommand("formatBlock", tag);
    }
  }, [execCommand]);

  const insertLink = useCallback(() => {
    if (linkUrl) {
      execCommand("createLink", linkUrl);
      setLinkUrl("");
    }
  }, [linkUrl, execCommand]);

  const insertImage = useCallback(() => {
    if (imageUrl) {
      execCommand("insertImage", imageUrl);
      setImageUrl("");
    }
  }, [imageUrl, execCommand]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setIsUploading(true);
    try {
      const url = await onImageUpload(file);
      execCommand("insertImage", url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [onImageUpload, execCommand]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    handleContentChange();
  }, [handleContentChange]);

  return (
    <div className={cn("border rounded-lg overflow-hidden bg-background", className)}>
      {/* Hidden file input for image upload */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />
      
      {/* Toolbar */}
      <div className="border-b bg-muted/30 p-1 flex flex-wrap items-center gap-0.5">
        {/* Undo/Redo */}
        <ToolbarButton
          icon={<Undo className="h-4 w-4" />}
          tooltip="Hoàn tác (Ctrl+Z)"
          onClick={() => execCommand("undo")}
        />
        <ToolbarButton
          icon={<Redo className="h-4 w-4" />}
          tooltip="Làm lại (Ctrl+Y)"
          onClick={() => execCommand("redo")}
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Heading Select */}
        <Select onValueChange={formatBlock} defaultValue="p">
          <SelectTrigger className="h-8 w-[120px] text-xs">
            <SelectValue placeholder="Định dạng" />
          </SelectTrigger>
          <SelectContent>
            {HEADING_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Font Size */}
        <Select onValueChange={(v) => execCommand("fontSize", v)} defaultValue="3">
          <SelectTrigger className="h-8 w-[80px] text-xs">
            <SelectValue placeholder="Cỡ chữ" />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size.value} value={size.value} className="text-xs">
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Basic Formatting */}
        <ToolbarButton
          icon={<Bold className="h-4 w-4" />}
          tooltip="Đậm (Ctrl+B)"
          onClick={() => execCommand("bold")}
        />
        <ToolbarButton
          icon={<Italic className="h-4 w-4" />}
          tooltip="Nghiêng (Ctrl+I)"
          onClick={() => execCommand("italic")}
        />
        <ToolbarButton
          icon={<Underline className="h-4 w-4" />}
          tooltip="Gạch chân (Ctrl+U)"
          onClick={() => execCommand("underline")}
        />
        <ToolbarButton
          icon={<Strikethrough className="h-4 w-4" />}
          tooltip="Gạch ngang"
          onClick={() => execCommand("strikeThrough")}
        />
        <ToolbarButton
          icon={<Subscript className="h-4 w-4" />}
          tooltip="Chỉ số dưới"
          onClick={() => execCommand("subscript")}
        />
        <ToolbarButton
          icon={<Superscript className="h-4 w-4" />}
          tooltip="Chỉ số trên"
          onClick={() => execCommand("superscript")}
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-10 gap-1">
              {COLORS.map((color) => (
                <button
                  key={color}
                  className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => execCommand("foreColor", color)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Highlight */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-8 gap-1">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color}
                  className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => execCommand("hiliteColor", color)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Alignment */}
        <ToolbarButton
          icon={<AlignLeft className="h-4 w-4" />}
          tooltip="Căn trái"
          onClick={() => execCommand("justifyLeft")}
        />
        <ToolbarButton
          icon={<AlignCenter className="h-4 w-4" />}
          tooltip="Căn giữa"
          onClick={() => execCommand("justifyCenter")}
        />
        <ToolbarButton
          icon={<AlignRight className="h-4 w-4" />}
          tooltip="Căn phải"
          onClick={() => execCommand("justifyRight")}
        />
        <ToolbarButton
          icon={<AlignJustify className="h-4 w-4" />}
          tooltip="Căn đều"
          onClick={() => execCommand("justifyFull")}
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists */}
        <ToolbarButton
          icon={<List className="h-4 w-4" />}
          tooltip="Danh sách không thứ tự"
          onClick={() => execCommand("insertUnorderedList")}
        />
        <ToolbarButton
          icon={<ListOrdered className="h-4 w-4" />}
          tooltip="Danh sách có thứ tự"
          onClick={() => execCommand("insertOrderedList")}
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Quote & Code */}
        <ToolbarButton
          icon={<Quote className="h-4 w-4" />}
          tooltip="Trích dẫn"
          onClick={() => formatBlock("blockquote")}
        />
        <ToolbarButton
          icon={<Code className="h-4 w-4" />}
          tooltip="Code"
          onClick={() => formatBlock("pre")}
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Link */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Link className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Chèn liên kết</label>
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && insertLink()}
              />
              <Button size="sm" onClick={insertLink} className="w-full">
                Chèn
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <ToolbarButton
          icon={<Unlink className="h-4 w-4" />}
          tooltip="Xoá liên kết"
          onClick={() => execCommand("unlink")}
        />

        {/* Image */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Image className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Chèn hình ảnh</label>
              <Input
                placeholder="URL hình ảnh"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && insertImage()}
              />
              <Button size="sm" onClick={insertImage} className="w-full">
                Chèn
              </Button>
              {onImageUpload && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-popover px-2 text-muted-foreground">hoặc</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang tải...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Tải ảnh lên
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Clear Formatting */}
        <ToolbarButton
          icon={<RemoveFormatting className="h-4 w-4" />}
          tooltip="Xoá định dạng"
          onClick={() => execCommand("removeFormat")}
        />
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        className={cn(
          "p-4 outline-none overflow-auto prose prose-sm max-w-none dark:prose-invert",
          "focus:ring-0 focus:outline-none",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic",
          "[&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:font-mono [&_pre]:text-sm",
          "[&_a]:text-primary [&_a]:underline",
          "[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md"
        )}
        style={{ minHeight }}
        onInput={handleContentChange}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
