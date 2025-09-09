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

interface NotificationAction {
  action: string;
  title: string;
  url?: string;
}

export function NotificationEditor({ isOpen, onClose, endpoint }: NotificationEditorProps) {
  const [title, setTitle] = useState('Hello');
  const [body, setBody] = useState('This is a test notification');
  const [icon, setIcon] = useState('/icon-192x192.svg');
  const [actions, setActions] = useState<NotificationAction[]>([
    { action: 'open', title: '打开应用', url: '/' },
    { action: 'close', title: '关闭' }
  ]);

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
      sendNotification.mutate({ title, body, icon, endpoint, actions });
    }
  };

  const addAction = () => {
    if (actions.length < 3) { // 限制最多3个actions
      setActions([...actions, { action: '', title: '', url: '' }]);
    }
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, field: keyof NotificationAction, value: string) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], [field]: value };
    setActions(newActions);
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

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>操作按钮 (Actions)</Label>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={addAction}
              disabled={actions.length >= 3}
            >
              + 添加按钮
            </Button>
          </div>
          
          {actions.map((action, index) => (
            <div key={index} className="border rounded-md p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">按钮 {index + 1}</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeAction(index)}
                >
                  删除
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`action-${index}`}>Action ID</Label>
                  <Input
                    id={`action-${index}`}
                    type="text"
                    value={action.action}
                    onChange={(e) => updateAction(index, 'action', e.target.value)}
                    placeholder="action标识符"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`title-${index}`}>按钮文本</Label>
                  <Input
                    id={`title-${index}`}
                    type="text"
                    value={action.title}
                    onChange={(e) => updateAction(index, 'title', e.target.value)}
                    placeholder="按钮显示文本"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor={`url-${index}`}>跳转URL (可选)</Label>
                <Input
                  id={`url-${index}`}
                  type="text"
                  value={action.url || ''}
                  onChange={(e) => updateAction(index, 'url', e.target.value)}
                  placeholder="点击后跳转的URL，如：/dashboard"
                />
              </div>
            </div>
          ))}
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
