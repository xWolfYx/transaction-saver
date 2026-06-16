import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navigation } from './components/layout/Navigation';
import { LogPage } from './pages/LogPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
			<Routes>
				<Route path="/" element={<LogPage />} />
				<Route path="/dashboard" element={<DashboardPage />} />
			</Routes>
			<Toaster />
		</div>
	);
}

export default App;
