import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import AppLayout from '../layouts/AppLayout';
import FeedPage from '../pages/FeedPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ProfilePage from '../pages/users/ProfilePage';
import CreatePostPage from '../pages/posts/CreatePostPage';
import PostPage from '../pages/posts/PostPage';
import EditPostPage from '../pages/posts/EditPostPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import AdminRoute from './AdminRoute';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminPostsPage from '../pages/admin/AdminPostsPage';
import AdminCommentsPage from '../pages/admin/AdminCommentsPage';
import AdminCreateAdminPage from '../pages/admin/AdminCreateAdminPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Admin Panel Layout & Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/posts" element={<AdminPostsPage />} />
          <Route path="/admin/comments" element={<AdminCommentsPage />} />
          <Route path="/admin/create-admin" element={<AdminCreateAdminPage />} />
        </Route>
      </Route>

      {/* Main App Layout */}
      <Route element={<AppLayout />}>
        {/* Public Feed & Public Profiles */}
        <Route path="/" element={<FeedPage />} />
        <Route path="/posts/:postId" element={<PostPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />

        {/* Authenticated / Protected App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/posts/create" element={<CreatePostPage />} />
          <Route path="/posts/:postId/edit" element={<EditPostPage />} />
        </Route>
      </Route>


      {/* Public Auth Routes */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* 404 Catch-All Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
