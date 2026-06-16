import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SearchProvider } from './context/SearchContext';
import { AppShell } from './components/layout/AppShell';
import { SearchScreen } from './screens/SearchScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { AiScreen } from './screens/AiScreen';
import { SearchingScreen } from './screens/SearchingScreen';

export default function App() {
  return (
    <BrowserRouter>
      <SearchProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<SearchScreen />} />
            <Route path="searching" element={<SearchingScreen />} />
            <Route path="results" element={<ResultsScreen />} />
            <Route path="ai" element={<AiScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </SearchProvider>
    </BrowserRouter>
  );
}
