import React, { useState, useEffect } from 'react';
import { trpc } from '../lib/trpc-client';
import { Dialog } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface NotificationEditorProps {
  isOpen: boolean;
  onClose: () => void;
  endpoint?: string;
}

export function NotificationEditor({ isOpen, onClose, endpoint }: NotificationEditorProps) {
  const [title, setTitle] = useState('Hello');
  const [body, setBody] = useState('This is a test notification');
  const [icon, setIcon] = useState('/icon-192x192.svg');

  const sendNotification = trpc.notification.send.useMutation({
    onSuccess: (data) => {
      alert(`通知发送成功: ${data.totalSent} 个成功, ${data.totalFailed} 个失败。`);
      onClose();
    },
    onError: (error) => {
      alert(`通知发送失败: ${error.message}`);
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && body) {
      sendNotification.mutate({ title, body, icon, endpoint });
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={endpoint ? '向单个设备发送通知' : '发送新通知'}
    >
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <Label htmlFor="title">标题</Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="通知标题"
            required
          />
        </div>

        <div>
          <Label htmlFor="body">内容</Label>
          <Input
            id="body"
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="通知内容"
            required
          />
        </div>

        <div>
          <Label htmlFor="icon">图标 URL</Label>
          <Input
            id="icon"
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="图标 URL"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" disabled={sendNotification.isPending}>
            {sendNotification.isPending ? '发送中...' : '发送'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
