import { TRPCProvider } from './lib/trpc-client';
import { NotificationManager } from './components/NotificationManager';

function App() {
  return (
    <TRPCProvider>
      <div className="min-h-screen bg-gray-50">
        <NotificationManager />
      </div>
    </TRPCProvider>
  );
}

export default App;
