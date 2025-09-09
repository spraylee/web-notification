import { usePushNotification } from '../hooks/usePushNotification';
import toast from 'react-hot-toast';

export function PushNotificationDemo() {
  const { 
    isSupported, 
    isSubscribed, 
    isLoading, 
    permission,
    browserInfo,
    subscribe, 
    unsubscribe 
  } = usePushNotification();

  const testLocalNotification = async () => {
    if (permission !== 'granted') {
      toast.error('请先授予通知权限');
      return;
    }
    
    try {
      // 尝试通过 Service Worker 显示通知
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('本地通知测试', {
        body: '这是一个本地测试通知，用于验证通知功能是否正常',
        icon: '/icon-192x192.svg',
        tag: 'test-notification'
      });
      toast.success('本地通知已发送！');
    } catch (swError) {
      // 降级到直接显示通知（适用于桌面浏览器）
      try {
        new Notification('本地通知测试', {
          body: '这是一个本地测试通知，用于验证通知功能是否正常',
          icon: '/icon-192x192.svg',
          tag: 'test-notification'
        });
        toast.success('本地通知已发送！');
      } catch (notificationError) {
        console.error('无法显示通知:', notificationError);
        toast.error('通知显示失败，请检查浏览器设置');
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-800 mb-2">不支持推送通知</h2>
        <p className="text-red-600">你的浏览器不支持 Web 推送通知功能。</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Web 推送通知演示</h1>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">推送通知状态:</span>
            <span className={`font-medium ${isSubscribed ? 'text-green-600' : 'text-gray-500'}`}>
              {isSubscribed ? '已订阅' : '未订阅'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">通知权限:</span>
            <span className={`font-medium ${
              permission === 'granted' ? 'text-green-600' : 
              permission === 'denied' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {permission === 'granted' ? '已授权' : 
               permission === 'denied' ? '已拒绝' : '待授权'}
            </span>
          </div>
        </div>

        {!isSubscribed ? (
          <button
            onClick={subscribe}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isLoading ? '订阅中...' : '订阅推送通知'}
          </button>
        ) : (
          <button
            onClick={unsubscribe}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            取消订阅
          </button>
        )}

        {permission === 'denied' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              通知权限被拒绝，请在浏览器设置中手动启用通知权限后刷新页面。
            </p>
          </div>
        )}

        {/* Safari iOS 特殊提示 */}
        {browserInfo.isIOS && !browserInfo.isStandalone && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">📱 iOS Safari 用户须知</h3>
            <p className="text-sm text-blue-700 mb-2">
              在 iOS 上使用推送功能需要：
            </p>
            <ol className="text-sm text-blue-700 space-y-1 ml-4">
              <li>1. 点击分享按钮 <span className="font-mono">⏫</span></li>
              <li>2. 选择"添加到主屏幕"</li>
              <li>3. 从主屏幕图标启动应用</li>
              <li>4. 然后再订阅推送通知</li>
            </ol>
          </div>
        )}

        {/* Safari macOS 提示 */}
        {browserInfo.isSafari && !browserInfo.isIOS && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              🍎 检测到 Safari 浏览器，推送功能已支持（需要 Safari 16.1+）
            </p>
          </div>
        )}

        {permission === 'granted' && (
          <button
            onClick={testLocalNotification}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            测试本地通知
          </button>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <p>订阅后，你将能够接收来自此应用的推送通知。</p>
          <p className="mt-1">即使关闭浏览器也能收到通知。</p>
        </div>
      </div>
    </div>
  );
}