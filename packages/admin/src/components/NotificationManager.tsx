import React, { useState } from 'react';
import { trpc } from '../lib/trpc-client';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { NotificationEditor } from './NotificationEditor';
import dayjs from 'dayjs';

export function NotificationManager() {
  const [isEditorOpen, setEditorOpen] = useState(false);
  const { data: notifications, refetch } = trpc.notification.list.useQuery();
  const { data: subscriptions } = trpc.subscription.list.useQuery();

  const handleEditorClose = () => {
    setEditorOpen(false);
    refetch();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">推送通知管理</h1>
        <Button onClick={() => setEditorOpen(true)}>发送新通知</Button>
      </div>

      <NotificationEditor isOpen={isEditorOpen} onClose={handleEditorClose} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                已发送通知:{' '}
                <span className="font-bold">
                  {notifications?.filter((n) => n.sent).length || 0}
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
