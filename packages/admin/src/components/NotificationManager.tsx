import React, { useState } from 'react';
import { trpc } from '../lib/trpc-client';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import dayjs from 'dayjs';

export function NotificationManager() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [icon, setIcon] = useState('/icon-192x192.png');

  const { data: notifications, refetch } = trpc.notification.list.useQuery();
  const { data: subscriptions } = trpc.subscription.list.useQuery();
  
  const sendNotification = trpc.notification.sendToAll.useMutation({
    onSuccess: () => {
      setTitle('');
      setBody('');
      refetch();
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && body) {
      sendNotification.mutate({ title, body, icon });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">推送通知管理</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>发送新通知</CardTitle>
          </CardHeader>
          <CardContent>
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
              
              <Button 
                type="submit" 
                disabled={sendNotification.isPending}
                className="w-full"
              >
                {sendNotification.isPending ? '发送中...' : '发送通知'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>订阅统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg">
                活跃订阅: <span className="font-bold">{subscriptions?.length || 0}</span>
              </p>
              <p className="text-sm text-gray-600">
                已发送通知: <span className="font-bold">
                  {notifications?.filter(n => n.sent).length || 0}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>通知历史</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications?.length ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-sm text-gray-600">{notification.body}</p>
                    <p className="text-xs text-gray-500">
                      {dayjs(notification.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        notification.sent
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {notification.sent ? '已发送' : '未发送'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">暂无通知记录</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}