import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
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

        {/* 系统后台路由 */}
        <Route
          path="/system/*"
          element={
            <PrivateRoute>
              <div>系统后台 - 开发中</div>
            </PrivateRoute>
          }
        />

        {/* 商家后台路由 */}
        <Route
          path="/merchant/*"
          element={
            <PrivateRoute>
              <div>商家后台 - 开发中</div>
            </PrivateRoute>
          }
        />

        {/* 默认重定向 */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
