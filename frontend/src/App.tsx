import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import MerchantLayout from './pages/merchant/Layout';
import DashboardPage from './pages/merchant/Dashboard';
import ShopsPage from './pages/merchant/Shops';
import { authService } from './services/auth.service';

// 路由守卫
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 公共路由 */}
        <Route path="/login" element={<Login />} />

        {/* 商家后台路由 */}
        <Route
          path="/merchant"
          element={
            <PrivateRoute>
              <MerchantLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="shops" element={<ShopsPage />} />
          <Route index element={<Navigate to="/merchant/dashboard" />} />
        </Route>

        {/* 默认重定向 */}
        <Route path="/" element={<Navigate to="/merchant/dashboard" />} />
        <Route path="*" element={<Navigate to="/merchant/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
