import React from 'react';
import { Layout, Menu, Typography, Button, Space } from 'antd';
import {
  DashboardOutlined,
  ShopOutlined,
  SyncOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const MerchantLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  const menuItems = [
    { key: '/merchant/dashboard', icon: <DashboardOutlined />, label: '数据看板' },
    { key: '/merchant/shops', icon: <ShopOutlined />, label: '店铺管理' },
    { key: '/merchant/data-sync', icon: <SyncOutlined />, label: '数据同步' },
  ];

  // 高亮当前菜单：匹配一级路径
  const selectedKey =
    menuItems.find((item) => location.pathname.startsWith(item.key))?.key || menuItems[0].key;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div
          style={{
            height: 48,
            margin: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          电商智能运营中台
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Space size="large">
            <Space size="small">
              <UserOutlined />
              <Text>{user?.username || '商户'}</Text>
            </Space>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={() => authService.logout()}
            >
              退出登录
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MerchantLayout;
