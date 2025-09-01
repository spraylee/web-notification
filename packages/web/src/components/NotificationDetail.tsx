import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

interface NotificationParams {
  title?: string;
  body?: string;
  timestamp?: string;
}

export function NotificationDetail() {
  const [params, setParams] = useState<NotificationParams>({});
  const [isFromNotification, setIsFromNotification] = useState(false);

  useEffect(() => {
    // 解析 URL 参数
    const urlParams = new URLSearchParams(window.location.search);
    const title = urlParams.get('title') || undefined;
    const body = urlParams.get('body') || undefined;
    const timestamp = urlParams.get('timestamp') || undefined;
    
    if (title || body) {
      setParams({ title, body, timestamp });
      setIsFromNotification(true);
    }
  }, []);

  const goBack = () => {
    window.history.back();
  };

  const goHome = () => {
    window.location.href = '/';
  };

  if (!isFromNotification) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">通知详情</h1>
          <p className="text-gray-600 mb-6">没有找到通知信息</p>
          <button
            onClick={goHome}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto space-y-4">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">通知详情</h1>
          <button
            onClick={goBack}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← 返回
          </button>
        </div>

        {/* 通知卡片 */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-start space-x-4">
            {/* 通知图标 */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>
            
            {/* 通知内容 */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {params.title || '无标题'}
              </h2>
              
              <p className="text-gray-600 mb-4">
                {params.body || '无内容'}
              </p>
              
              {params.timestamp && (
                <div className="text-sm text-gray-500">
                  <span className="inline-flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    接收时间: {dayjs(params.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={goHome}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              返回首页
            </button>
            <button
              onClick={goBack}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              返回上页
            </button>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-green-700">
              您已成功接收并查看了这条推送通知！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}