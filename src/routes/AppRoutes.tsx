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

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
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
