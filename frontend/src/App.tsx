import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";
import { Navigation } from "./components/layout/Navigation";
import { DashboardPage } from "./pages/DashboardPage";
import { LogPage } from "./pages/LogPage";

function App() {
	return (
		<div className="bg-gray-50 min-h-screen flex">
			<Navigation />
			<div className="flex-1 min-w-0">
				<Routes>
					<Route path="/" element={<LogPage />} />
					<Route path="/dashboard" element={<DashboardPage />} />
				</Routes>
			</div>
			<Toaster />
		</div>
	);
}

export default App;
