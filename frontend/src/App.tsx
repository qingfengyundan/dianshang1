import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import MerchantLayout from './pages/merchant/Layout';
import DashboardPage from './pages/merchant/Dashboard';
import ShopsPage from './pages/merchant/Shops';
import DataSyncPage from './pages/merchant/DataSync';
import SystemLayout from './pages/system/Layout';
import SystemMerchantsPage from './pages/system/Merchants';
import SystemAiConfigPage from './pages/system/AiConfig';
import { authService } from './services/auth.service';

// 登录守卫
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return authService.isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

// 系统管理员专用守卫
const SystemRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = authService.getCurrentUser();
  if (!authService.isAuthenticated()) return <Navigate to="/login" />;
  if (user?.role !== 'system_admin') return <Navigate to="/merchant/dashboard" />;
  return <>{children}</>;
};

// 默认首页按角色分流
const HomeRedirect: React.FC = () => {
  const user = authService.getCurrentUser();
  if (user?.role === 'system_admin') return <Navigate to="/system/merchants" />;
  return <Navigate to="/merchant/dashboard" />;
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
        <Route path="data-sync" element={<DataSyncPage />} />
          <Route index element={<Navigate to="/merchant/dashboard" />} />
        </Route>

        {/* 系统总后台路由 */}
        <Route
          path="/system"
          element={
            <SystemRoute>
              <SystemLayout />
            </SystemRoute>
          }
        >
          <Route path="merchants" element={<SystemMerchantsPage />} />
          <Route path="ai-config" element={<SystemAiConfigPage />} />
          <Route index element={<Navigate to="/system/merchants" />} />
        </Route>

        {/* 默认重定向（按角色分流） */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
