import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TRPCProvider } from './lib/trpc-client';
import { PushNotificationDemo } from './components/PushNotificationDemo';
import { NotificationDetail } from './components/NotificationDetail';

function App() {
  return (
    <TRPCProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <div className="min-h-screen bg-gray-100 py-8">
              <PushNotificationDemo />
            </div>
          } />
          <Route path="/notification" element={<NotificationDetail />} />
        </Routes>
      </Router>
    </TRPCProvider>
  );
}

export default App;
