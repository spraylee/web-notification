import { useState } from 'react';
import { TRPCProvider } from './lib/trpc-client';
import { NotificationManager } from './components/NotificationManager';
import { SubscriptionList } from './components/SubscriptionList';

type Page = 'notifications' | 'subscriptions';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('notifications');

  return (
    <TRPCProvider>
      <div className="min-h-screen bg-gray-50">
        {/* 导航栏 */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">推送通知管理后台</h1>
                </div>
                <div className="ml-6 flex space-x-8">
                  <button
                    onClick={() => setCurrentPage('notifications')}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                      currentPage === 'notifications'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    通知管理
                  </button>
                  <button
                    onClick={() => setCurrentPage('subscriptions')}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                      currentPage === 'subscriptions'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    订阅管理
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* 主要内容区域 */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {currentPage === 'notifications' && <NotificationManager />}
            {currentPage === 'subscriptions' && <SubscriptionList />}
          </div>
        </main>
      </div>
    </TRPCProvider>
  );
}

export default App;
