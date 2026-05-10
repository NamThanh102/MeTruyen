import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AuthRoute from './components/AuthRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/HomePage';
import ComicsPage from './pages/comic/ComicsPage';
import ComicDetailPage from './pages/comic/ComicDetailPage';
import ReaderPage from './pages/comic/ReaderPage';
import LibraryPage from './pages/user/LibraryPage';
import HistoryPage from './pages/user/HistoryPage';
import RechargePage from './pages/user/RechargePage';
import ProfilePage from './pages/user/ProfilePage';
import AdminDashboard from './pages/admin/Dashboard';
import AdminPayments from './pages/admin/Payments';
import AdminUsers from './pages/admin/Users';
import AdminComics from './pages/admin/Comics';
import AdminComicForm from './pages/admin/ComicForm';
import AdminCategories from './pages/admin/Categories';
import AdminChapterUpload from './pages/admin/ChapterUpload';
import AdminChapterList from './pages/admin/ChapterList';
import useAuthStore from './store/authStore';

const PlaceholderPage = ({ name }) => (
  <div className="container mx-auto px-4 py-8 text-center">
    <h1 className="text-3xl font-bold text-red-500 mb-4">{name}</h1>
    <p className="text-gray-400">Trang này sẽ được phát triển ở các tuần tiếp theo...</p>
  </div>
);

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="comics" element={<ComicsPage />} />
        <Route path="comics/:slug" element={<ComicDetailPage />} />
        <Route path="read/:chapterId" element={<ReaderPage />} />

        <Route element={<AuthRoute />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="recharge" element={<RechargePage />} />
        </Route>

        <Route element={<AuthRoute requireAdmin />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/payments" element={<AdminPayments />} />
          <Route path="admin/users" element={<AdminUsers />} />
          <Route path="admin/comics" element={<AdminComics />} />
          <Route path="admin/comics/new" element={<AdminComicForm />} />
          <Route path="admin/comics/:id/edit" element={<AdminComicForm />} />
          <Route path="admin/comics/:comicId/chapters/new" element={<AdminChapterUpload />} />
          <Route path="admin/comics/:comicId/chapters/:chapterId/edit" element={<AdminChapterUpload />} />
          <Route path="admin/comics/:comicId/chapters" element={<AdminChapterList />} />
          <Route path="admin/categories" element={<AdminCategories />} />
        </Route>

        <Route path="*" element={<PlaceholderPage name="Trang Không Tồn Tại" />} />
      </Route>
    </Routes>
  );
}

export default App;
