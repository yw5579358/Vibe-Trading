import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Architecture } from './pages/Architecture';
import { Quant } from './pages/Quant';
import { Trading } from './pages/Trading';
import { Operations } from './pages/Operations';
import { Finance } from './pages/Finance';

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <div className="prose-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/quant" element={<Quant />} />
            <Route path="/trading" element={<Trading />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/operations" element={<Operations />} />
          </Routes>
        </div>
      </Layout>
    </HashRouter>
  );
}
