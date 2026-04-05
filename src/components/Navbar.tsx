import React from 'react';
import {
  GraduationCap, Menu, X,
  LayoutDashboard, Target, CalendarCheck, BookOpen,
  MessageSquareText, Wrench, Settings, CreditCard,
  HelpCircle, LogOut, Code2, Terminal, BarChart3
} from 'lucide-react';

export type Page = 'landing' | 'interview' | 'tools' | 'questionbank' | 'dailypractice' | 'caselibrary' | 'storybank' | 'preferences' | 'upgrade' | 'help' | 'techinterview' | 'techquestionbank' | 'progress';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  page?: Page;
  dividerAfter?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const sidebarItems: SidebarItem[] = [
    { icon: <BarChart3 size={20} />, label: 'Progress', page: 'progress' },
    { icon: <LayoutDashboard size={20} />, label: 'Interview Hub', page: 'interview' },
    { icon: <Target size={20} />, label: 'Question Bank', page: 'questionbank' },
    { icon: <CalendarCheck size={20} />, label: 'Daily Practice', page: 'dailypractice' },
    { icon: <BookOpen size={20} />, label: 'Case Library', page: 'caselibrary' },
    { icon: <MessageSquareText size={20} />, label: 'Story Bank', page: 'storybank' },
    { icon: <Wrench size={20} />, label: 'Free Tools', page: 'tools', dividerAfter: true },
    { icon: <Code2 size={20} />, label: '🆕 Tech Interview', page: 'techinterview' },
    { icon: <Terminal size={20} />, label: 'Tech Question Bank', page: 'techquestionbank', dividerAfter: true },
    { icon: <Settings size={20} />, label: 'Preferences', page: 'preferences' },
    { icon: <CreditCard size={20} />, label: 'Upgrade Plan', page: 'upgrade' },
    { icon: <HelpCircle size={20} />, label: 'Get Help', page: 'help' },
  ];

  const handleItemClick = (item: SidebarItem) => {
    if (item.page) {
      onNavigate(item.page);
    }
    setSidebarOpen(false);
  };

  const desktopLinks: { label: string; page: Page }[] = [
    { label: 'Home', page: 'landing' },
    { label: 'Progress', page: 'progress' },
    { label: 'Free Tools', page: 'tools' },
  ];

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-base-100/80 backdrop-blur-lg border-b border-base-300 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <button
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              onClick={() => onNavigate('landing')}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <GraduationCap size={18} className="text-primary-content" />
              </div>
              <span className="font-bold text-lg text-base-content">
                neevv<span className="text-primary"> Prep</span>
              </span>
            </button>

            {/* Desktop Nav */}
            <div className="hidden sm:flex items-center gap-1">
              {desktopLinks.map((link) => (
                <button
                  key={link.page}
                  className={`btn btn-ghost btn-sm ${currentPage === link.page ? 'text-primary font-semibold' : 'text-base-content/70'}`}
                  onClick={() => onNavigate(link.page)}
                >
                  {link.label}
                </button>
              ))}
              <div className="divider divider-horizontal mx-1 h-6 self-center"></div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onNavigate('interview')}
              >
                Start Interview →
              </button>
            </div>

            {/* Hamburger menu button */}
            <button
              className="btn btn-ghost btn-sm btn-square"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-base-100 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-300">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <GraduationCap size={18} className="text-primary-content" />
            </div>
            <span className="font-bold text-lg text-base-content">
              neevv<span className="text-primary"> Prep</span>
            </span>
          </div>
          <button
            className="btn btn-ghost btn-sm btn-square"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Items */}
        <div className="flex flex-col py-2 overflow-y-auto" style={{ height: 'calc(100% - 130px)' }}>
          {sidebarItems.map((item, idx) => (
            <React.Fragment key={idx}>
              <button
                className={`flex items-center gap-3 px-5 py-3.5 text-left transition-colors w-full ${
                  item.page && item.page === currentPage
                    ? 'text-primary bg-primary/10 font-semibold'
                    : 'text-base-content hover:bg-base-200'
                }`}
                onClick={() => handleItemClick(item)}
              >
                <span className="flex-shrink-0 opacity-80">{item.icon}</span>
                <span className="flex-1 text-sm">{item.label}</span>
              </button>
              {item.dividerAfter && <div className="divider my-1 mx-4 h-0"></div>}
            </React.Fragment>
          ))}
        </div>

        {/* Sign Out at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-base-300">
          <button
            className="flex items-center gap-3 px-5 py-3.5 text-left text-base-content/70 hover:bg-base-200 transition-colors w-full"
            onClick={() => setSidebarOpen(false)}
          >
            <LogOut size={20} className="opacity-80" />
            <span className="text-sm">Sign out</span>
          </button>
        </div>
      </div>
    </>
  );
};
