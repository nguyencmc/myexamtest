import React, { useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Bold,
  Italic,
  Underline,
  Subscript,
  Superscript,
  Link,
  Unlink,
  Image,
  Highlighter,
  Palette,
  List,
  ListOrdered,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniRichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  showLists?: boolean;
  showColors?: boolean;
}

const COLORS = [
  "#000000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", 
  "#00ffff", "#0000ff", "#9900ff", "#ff00ff", "#666666",
];

const HIGHLIGHT_COLORS = [
  "#ffff00", "#00ff00", "#00ffff", "#ff00ff", "#ff9900",
];

const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  {
    icon: React.ReactNode;
    tooltip: string;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    size?: "xs" | "sm";
  }
>(({ icon, tooltip, onClick, active, disabled, size = "xs" }, ref) => (
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
          size === "xs" ? "h-6 w-6 p-0" : "h-7 w-7 p-0",
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

export function MiniRichTextEditor({
  value = "",
  onChange,
  placeholder = "Nhập nội dung...",
  className,
  minHeight = "80px",
  showLists = false,
  showColors = true,
}: MiniRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [linkUrl, setLinkUrl] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const isInitialMount = useRef(true);

  // Sync value on initial mount or when value changes externally
  useEffect(() => {
    if (editorRef.current && isInitialMount.current) {
      editorRef.current.innerHTML = value;
      isInitialMount.current = false;
    }
  }, [value]);

  const execCommand = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    handleContentChange();
  }, []);

  const handleContentChange = useCallback(() => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

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

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    handleContentChange();
  }, [handleContentChange]);

  return (
    <div className={cn("border rounded-md overflow-hidden bg-background", className)}>
      {/* Compact Toolbar */}
      <div className="border-b bg-muted/30 px-1 py-0.5 flex flex-wrap items-center gap-0.5">
        <ToolbarButton
          icon={<Bold className="h-3 w-3" />}
          tooltip="Đậm"
          onClick={() => execCommand("bold")}
        />
        <ToolbarButton
          icon={<Italic className="h-3 w-3" />}
          tooltip="Nghiêng"
          onClick={() => execCommand("italic")}
        />
        <ToolbarButton
          icon={<Underline className="h-3 w-3" />}
          tooltip="Gạch chân"
          onClick={() => execCommand("underline")}
        />
        <ToolbarButton
          icon={<Subscript className="h-3 w-3" />}
          tooltip="Chỉ số dưới"
          onClick={() => execCommand("subscript")}
        />
        <ToolbarButton
          icon={<Superscript className="h-3 w-3" />}
          tooltip="Chỉ số trên"
          onClick={() => execCommand("superscript")}
        />

        {showColors && (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Palette className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="grid grid-cols-5 gap-1">
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

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Highlighter className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="grid grid-cols-5 gap-1">
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
          </>
        )}

        {showLists && (
          <>
            <ToolbarButton
              icon={<List className="h-3 w-3" />}
              tooltip="Danh sách"
              onClick={() => execCommand("insertUnorderedList")}
            />
            <ToolbarButton
              icon={<ListOrdered className="h-3 w-3" />}
              tooltip="Danh sách số"
              onClick={() => execCommand("insertOrderedList")}
            />
          </>
        )}

        {/* Link */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Link className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2">
            <div className="space-y-2">
              <Input
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && insertLink()}
                className="h-8 text-xs"
              />
              <Button size="sm" onClick={insertLink} className="w-full h-7 text-xs">
                Chèn liên kết
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <ToolbarButton
          icon={<Unlink className="h-3 w-3" />}
          tooltip="Xoá liên kết"
          onClick={() => execCommand("unlink")}
        />

        {/* Image */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Image className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2">
            <div className="space-y-2">
              <Input
                placeholder="URL hình ảnh"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && insertImage()}
                className="h-8 text-xs"
              />
              <Button size="sm" onClick={insertImage} className="w-full h-7 text-xs">
                Chèn ảnh
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        className={cn(
          "px-3 py-2 outline-none overflow-auto text-sm",
          "focus:ring-0 focus:outline-none",
          "[&_a]:text-primary [&_a]:underline",
          "[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded"
        )}
        style={{ minHeight }}
        onInput={handleContentChange}
        onPaste={handlePaste}
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
