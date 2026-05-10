import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { FaHome, FaBook, FaHeart, FaHistory, FaCoins, FaCog, FaSearch, FaChevronDown, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import useAuthStore from '../store/authStore';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [searchValue, setSearchValue] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const keyword = searchValue.trim();
    if (!keyword) return;
    navigate(`/comics?search=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="min-h-screen flex flex-col relative text-gray-100 overflow-x-hidden">
      <div className="fixed inset-0 -z-20 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/assets/a3.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            filter: 'blur(2px)',
            transform: 'scale(1.05)',
            opacity: 0.25,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(10, 10, 10, 0.55) 0%, rgba(12, 12, 12, 0.48) 50%, rgba(8, 8, 8, 0.58) 100%)',
          }}
        />
      </div>

      <header className="sticky top-0 z-50 border-b border-[#2a2a2a] bg-[#111111]/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        <div className="mx-auto flex h-16 max-w-[1380px] items-center gap-4 px-4 lg:px-5">
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              <img
                src="/assets/a1.jpg"
                alt="MeTruyen"
                className="w-9 h-9 rounded-md object-cover border border-red-400/40 shadow-md shadow-red-500/10 group-hover:border-red-300/70 transition-colors"
              />
              <span className="font-extrabold text-[22px] text-red-500 tracking-tight">MeTruyen</span>
            </Link>

            <nav className="hidden xl:flex items-center gap-7 ml-5">
              <Link to="/" className={`flex items-center gap-2 text-[15px] font-semibold transition-colors ${isActive('/') ? 'text-red-400' : 'text-gray-200 hover:text-white'}`}>
                <FaHome />
                Trang chủ
              </Link>
              <Link to="/comics" className={`flex items-center gap-2 text-[15px] font-semibold transition-colors ${isActive('/comics') ? 'text-red-400' : 'text-gray-200 hover:text-white'}`}>
                <FaBook />
                Truyện tranh
              </Link>
              {user && (
                <Link to="/library" className={`flex items-center gap-2 text-[15px] font-semibold transition-colors ${isActive('/library') ? 'text-red-400' : 'text-gray-200 hover:text-white'}`}>
                  <FaHeart />
                  Yêu thích
                </Link>
              )}
              {user && (
                <Link to="/history" className={`flex items-center gap-2 text-[15px] font-semibold transition-colors ${isActive('/history') ? 'text-red-400' : 'text-gray-200 hover:text-white'}`}>
                  <FaHistory />
                  Lịch sử
                </Link>
              )}
            </nav>

            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-[520px] h-9 items-stretch overflow-hidden rounded-full border border-white/10 bg-[#202020] ml-auto lg:ml-6">
              <div className="flex items-center pl-3 text-gray-400">
                <FaSearch />
              </div>
              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Tìm kiếm truyện..."
                className="w-full bg-transparent px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center justify-center bg-[#ef2f2f] px-5 py-2 text-white font-semi transition-colors hover:bg-red-500"
              >
                Tìm
              </button>
            </form>

            <div className="relative ml-0 flex shrink-0 items-center gap-3 lg:ml-2">
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((value) => !value)}
                    className="flex items-center gap-3 rounded-full border border-[#666] bg-[#151515] px-4 py-2 text-left transition-colors hover:border-red-400/60 hover:bg-[#1b1b1b]"
                  >
                    <span className="hidden sm:block text-sm font-medium text-gray-200">Xin chào, {user.username}</span>
                    <img
                      src={user.avatar || 'https://via.placeholder.com/32'}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border border-zinc-600"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/32'; }}
                    />
                    <FaChevronDown className="text-xs text-gray-500" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-[calc(100%+0.45rem)] w-64 overflow-hidden rounded-xl border border-[#2f2f2f] bg-[#161616] shadow-2xl shadow-black/60">
                      <div className="border-b border-white/10 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar || 'https://via.placeholder.com/40'}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border border-zinc-600"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                          />
                          <div>
                            <div className="font-semibold text-gray-100">{user.username}</div>
                            <div className="text-sm text-gray-400 mt-1 truncate">{user.email}</div>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-200 transition-colors hover:bg-white/5 hover:text-white">
                          <FaUserCircle className="text-red-400" />
                          Thông tin cá nhân
                        </Link>
                        <Link to="/recharge" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-200 transition-colors hover:bg-white/5 hover:text-white">
                          <FaCoins className="text-red-400" />
                          Nạp Point
                        </Link>
                        {user.role === 'admin' && (
                          <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-200 transition-colors hover:bg-white/5 hover:text-white">
                            <FaCog className="text-red-400" />
                            Quản lý
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
                        >
                          <FaSignOutAlt />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="text-sm font-medium text-gray-300 transition-colors hover:text-white">Đăng nhập</Link>
                  <Link to="/register" className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition-colors hover:bg-red-500">Đăng ký</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-0">
        <Outlet />
      </main>

      <footer className="mt-14 border-t border-red-400/20 bg-neutral-950/95 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <img src="/assets/a1.jpg" alt="MeTruyen" className="w-11 h-11 rounded-xl object-cover border border-red-400/30" />
                <div>
                  <div className="text-xl font-extrabold text-red-500">MeTruyen</div>
                  <div className="text-sm text-gray-400">Đọc truyện tranh online tốc độ cao</div>
                </div>
              </div>
              <p className="mt-4 max-w-md text-sm leading-6 text-gray-400">
                Giao diện tối, tập trung vào nội dung và trải nghiệm đọc mượt trên mọi thiết bị.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-100 mb-4">Liên kết</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <Link to="/" className="block hover:text-red-300 transition-colors">Trang chủ</Link>
                <Link to="/comics" className="block hover:text-red-300 transition-colors">Truyện tranh</Link>
                <Link to="/library" className="block hover:text-red-300 transition-colors">Yêu thích</Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-100 mb-4">Hỗ trợ</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <Link to="/login" className="block hover:text-red-300 transition-colors">Đăng nhập</Link>
                <Link to="/register" className="block hover:text-red-300 transition-colors">Đăng ký</Link>
                <Link to="/recharge" className="block hover:text-red-300 transition-colors">Nạp Point</Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-100 mb-4">Theo dõi</h3>
              <p className="text-sm text-gray-400 mb-4">Nhận thông báo khi có chương mới và cập nhật hệ thống.</p>
              <div className="flex overflow-hidden rounded-full border border-white/10 bg-white/5">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full bg-transparent px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none"
                />
                <button type="button" className="bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-500 transition-colors">
                  Gửi
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-5 text-center text-sm text-gray-500">
            © 2026 MeTruyen. TTCS-PTIT.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
