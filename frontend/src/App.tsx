import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";
import { Navigation } from "./components/layout/Navigation";
import { DashboardPage } from "./pages/DashboardPage";
import { LogPage } from "./pages/LogPage";

function App() {
	return (
		<div className="bg-gray-50 min-h-screen">
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
