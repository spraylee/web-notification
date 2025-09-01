import { TRPCProvider } from './lib/trpc-client';
import { PushNotificationDemo } from './components/PushNotificationDemo';

function App() {
  return (
    <TRPCProvider>
      <div className="min-h-screen bg-gray-100 py-8">
        <PushNotificationDemo />
      </div>
    </TRPCProvider>
  );
}

export default App;
