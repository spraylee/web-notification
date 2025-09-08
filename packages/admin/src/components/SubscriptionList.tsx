import { useState } from 'react';
import { trpc } from '../lib/trpc-client';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { NotificationEditor } from './NotificationEditor';

export function SubscriptionList() {
  const {
    data: subscriptions,
    refetch,
    isLoading,
    isRefetching,
  } = trpc.subscription.list.useQuery();
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | undefined>(undefined);

  const deactivateSubscription = trpc.subscription.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleOpenEditor = (endpoint: string) => {
    setSelectedEndpoint(endpoint);
    setEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    setSelectedEndpoint(undefined);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const truncateString = (str: string, maxLength: number) => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">加载订阅列表中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <NotificationEditor
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        endpoint={selectedEndpoint}
      />

      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">订阅管理</h1>
          <p className="text-gray-600 mt-1">
            管理所有推送通知订阅，共 {subscriptions?.length || 0} 个订阅
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2"
        >
          <svg
            className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          刷新
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-900">总订阅数</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{subscriptions?.length || 0}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-900">活跃订阅</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {subscriptions?.filter((sub) => sub.isActive).length || 0}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-900">已停用</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {subscriptions?.filter((sub) => !sub.isActive).length || 0}
          </p>
        </Card>
      </div>

      {/* 订阅列表 */}
      {!subscriptions || subscriptions.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-6a2 2 0 00-2 2v1a2 2 0 01-2 2H8a2 2 0 01-2-2v-1a2 2 0 00-2-2H4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订阅</h3>
          <p className="text-gray-600">还没有用户订阅推送通知</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        subscription.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    ></div>
                    <span className="font-medium text-gray-900">
                      {subscription.isActive ? '活跃订阅' : '已停用'}
                    </span>
                    {subscription.userId && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        用户ID: {subscription.userId}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">端点地址:</span>
                      <div className="font-mono text-xs bg-gray-50 p-2 rounded mt-1 break-all">
                        {truncateString(subscription.endpoint, 80)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">创建时间:</span>
                        <div className="font-medium">{formatDate(subscription.createdAt)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">更新时间:</span>
                        <div className="font-medium">{formatDate(subscription.updatedAt)}</div>
                      </div>
                    </div>

                    <details className="mt-3">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        查看详细信息
                      </summary>
                      <div className="mt-2 space-y-2 pl-4 border-l-2 border-gray-200">
                        <div>
                          <span className="text-gray-600">P256DH Key:</span>
                          <div className="font-mono text-xs bg-gray-50 p-2 rounded mt-1 break-all">
                            {subscription.p256dh}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Auth Key:</span>
                          <div className="font-mono text-xs bg-gray-50 p-2 rounded mt-1 break-all">
                            {subscription.auth}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">完整端点:</span>
                          <div className="font-mono text-xs bg-gray-50 p-2 rounded mt-1 break-all">
                            {subscription.endpoint}
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>

                <div className="ml-4 flex flex-col space-y-2">
                  {subscription.isActive && (
                    <>
                      <Button onClick={() => handleOpenEditor(subscription.endpoint)} size="sm">
                        发送通知
                      </Button>
                      <Button
                        onClick={() =>
                          deactivateSubscription.mutate({ endpoint: subscription.endpoint })
                        }
                        variant="destructive"
                        size="sm"
                      >
                        停用
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
