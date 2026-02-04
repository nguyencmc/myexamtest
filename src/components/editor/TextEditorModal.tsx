import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "./RichTextEditor";
import { FileText, Save, X } from "lucide-react";

interface TextEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  initialContent?: string;
  initialTitle?: string;
  onSave?: (data: { title: string; content: string }) => void;
  showTitleInput?: boolean;
}

export function TextEditorModal({
  open,
  onOpenChange,
  title = "Trình soạn thảo văn bản",
  initialContent = "",
  initialTitle = "",
  onSave,
  showTitleInput = true,
}: TextEditorModalProps) {
  const [documentTitle, setDocumentTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    onSave?.({ title: documentTitle, content });
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  // Reset state when modal opens
  React.useEffect(() => {
    if (open) {
      setDocumentTitle(initialTitle);
      setContent(initialContent);
    }
  }, [open, initialTitle, initialContent]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">{title}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Soạn thảo nội dung với đầy đủ công cụ định dạng
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col px-6 py-4 gap-4">
          {showTitleInput && (
            <div className="space-y-2 shrink-0">
              <Label htmlFor="doc-title">Tiêu đề</Label>
              <Input
                id="doc-title"
                placeholder="Nhập tiêu đề tài liệu..."
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="text-lg font-medium"
              />
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Bắt đầu soạn thảo nội dung của bạn..."
              className="h-full"
              minHeight="100%"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {content.length > 0 && (
                <span>
                  ~{Math.ceil(content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length)} từ
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                <X className="h-4 w-4 mr-2" />
                Huỷ
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Lưu
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
