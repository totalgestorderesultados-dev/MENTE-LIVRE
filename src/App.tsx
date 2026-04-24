import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Category, Content, ContentLink, ContentType, Favorite } from './types';
import { LogIn, LogOut, Settings, Home as HomeIcon, BookOpen, Video, FileText, Star, Search, Plus, Trash2, ChevronRight, Menu, X, PlayCircle, Edit2, Lock, Download, AlertTriangle, Check, Activity, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn, getYouTubeId, getYouTubePlaylistId, getGoogleDriveEmbedUrl } from './utils';

// --- Components ---

const PwaInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top duration-500">
      <div className="flex items-center space-x-3">
        <div className="bg-white/20 p-2 rounded-xl">
          <Download className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold">Instalar MindFlow</p>
          <p className="text-[10px] opacity-80">Acesse mais rápido direto da sua tela inicial!</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white/60 hover:text-white px-3 py-1 text-xs font-medium"
        >
          Agora não
        </button>
        <button 
          id="install-button"
          onClick={handleInstall}
          className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all shadow-sm"
        >
          Instalar agora
        </button>
      </div>
    </div>
  );
};const Navbar = ({ isAdmin, onAdminAuth, onLogout }: { isAdmin: boolean, onAdminAuth: () => void, onLogout: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <PwaInstaller />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">MindFlow</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Início</Link>
            
            {isAdmin ? (
              <div className="flex items-center space-x-4">
                <Link to="/admin" className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors" title="Painel Admin">
                  <Settings className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Painel Admin</span>
                </Link>
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] shadow-sm">ADM</div>
                </div>
                <button 
                  onClick={onLogout}
                  className="text-gray-400 hover:text-red-500 p-2 rounded-full transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={onAdminAuth} 
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
                  title="Acesso Administrador"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-600 p-2">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 py-4 px-4 space-y-2">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-gray-600 hover:text-indigo-600 py-2 font-medium">Início</Link>
          {isAdmin && (
            <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block text-gray-600 hover:text-indigo-600 py-2 font-medium">Painel Admin</Link>
          )}
          {isAdmin ? (
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">ADM</div>
                <span className="text-sm font-bold text-gray-900">Administrador</span>
              </div>
              <button 
                onClick={() => {
                  onLogout();
                  setIsMenuOpen(false);
                }} 
                className="text-red-500 font-bold bg-red-50 px-4 py-2 rounded-xl text-sm"
              >
                Sair
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <button 
                onClick={() => {
                  onAdminAuth();
                  setIsMenuOpen(false);
                }} 
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-2xl font-bold flex items-center justify-center shadow-lg active:scale-95 transition-all"
              >
                <Lock className="w-5 h-5 mr-3" />
                Painel Administrativo
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

// --- Pages ---

const Home = ({ categories, isAdmin }: { categories: Category[], isAdmin: boolean }) => {
  const [search, setSearch] = useState('');
  
  const filteredCategories = categories.filter(c => {
    const name = c.name || '';
    const desc = c.description || '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || 
                         desc.toLowerCase().includes(search.toLowerCase());
    const isVisible = isAdmin || c.isVisible !== false;
    return matchesSearch && isVisible;
  });

  const [activeSegment, setActiveSegment] = useState<'public' | 'private'>('public');
  
  // Resiliently check access level, defaulting missing ones to 'public'
  const displayedCategories = filteredCategories.filter(c => {
    const level = c.accessLevel || 'public';
    return level === activeSegment;
  });

  const hasItemsInOtherTab = filteredCategories.some(c => {
    const level = c.accessLevel || 'public';
    return level !== activeSegment;
  });

  // Auto-switch tabs if the current one is empty but the other has content
  useEffect(() => {
    const hasPublic = filteredCategories.some(c => (c.accessLevel || 'public') === 'public');
    const hasPrivate = filteredCategories.some(c => c.accessLevel === 'private');

    if (activeSegment === 'public' && !hasPublic && hasPrivate) {
      setActiveSegment('private');
    } else if (activeSegment === 'private' && !hasPrivate && hasPublic) {
      setActiveSegment('public');
    }
  }, [filteredCategories, activeSegment]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">O seu aplicativo de clareza e direção emocional para vencer a ansiedade e a procrastinação.</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Sua jornada para uma mente mais tranquila e produtiva começa aqui.</p>
        
        <div className="mt-8 max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar categorias..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isAdmin && categories.length === 0 && (
          <div className="mt-6 max-w-xl mx-auto bg-indigo-50 rounded-2xl p-6 text-left border border-indigo-100 animate-pulse">
            <div className="flex items-center space-x-3 mb-2 text-indigo-700 font-bold">
              <Plus className="w-5 h-5 shadow-sm bg-white rounded-full p-1" />
              <span>Modo Administrador Ativado</span>
            </div>
            <p className="text-sm text-indigo-600 leading-relaxed">
              Ficou tudo pronto! Como você ainda não tem conteúdos, vá ao painel do <b>Supabase</b> e insira dados nas tabelas <code className="bg-white/50 px-1 rounded">categories</code> e <code className="bg-white/50 px-1 rounded">contents</code>.
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <div className="inline-flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
            {[
              { id: 'public', label: 'Gratuito' },
              { id: 'private', label: 'Exclusivo' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSegment(tab.id as any)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                  activeSegment === tab.id 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105" 
                    : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeSegment === 'private' && !isAdmin ? (
        <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-xl text-center max-w-2xl mx-auto py-16">
          <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-indigo-600 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Área Restrita</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Esta categoria contém materiais exclusivos. O acesso é restrito ao administrador do sistema.
          </p>
          <div className="flex flex-col space-y-4 items-center">
            <button 
              onClick={() => {
                const nav = document.querySelector('nav');
                const adminBtn = nav?.querySelector('button[title="Acesso Administrador"]');
                if (adminBtn instanceof HTMLButtonElement) adminBtn.click();
                else alert("Clique no botão 'Admin' no topo da página.");
              }}
              className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center justify-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-105"
            >
              <Lock className="w-5 h-5 mr-2" /> Acesso Administrador
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedCategories.map((category) => (
            <Link 
              key={category.id} 
              to={(category.accessLevel || 'public') === 'private' && !isAdmin ? '#' : `/category/${category.id}`}
              onClick={(e) => {
                if ((category.accessLevel || 'public') === 'private' && !isAdmin) {
                  e.preventDefault();
                  alert("Esta categoria é exclusiva para o administrador.");
                }
              }}
              className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
            >
              {(category.accessLevel || 'public') === 'private' && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-white/90 backdrop-blur text-indigo-600 p-2 rounded-xl shadow-lg border border-white/20">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              )}
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                <img 
                  src={category.imageUrl || `https://picsum.photos/seed/${category.name}/800/450`} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                    (category.accessLevel || 'public') === 'private' ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"
                  )}>
                    {(category.accessLevel || 'public') === 'private' ? 'Exclusivo' : 'Gratuito'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{category.name || 'Sem nome'}</h3>
                <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{category.description || 'Nenhuma descrição'}</p>
                <div className="mt-4 flex items-center text-indigo-600 font-semibold text-sm">
                  Ver conteúdos <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {displayedCategories.length === 0 && filteredCategories.length > 0 && !search && (
        <div className="text-center py-20">
          <div className="bg-indigo-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Search className="text-indigo-400 w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Nenhuma categoria {activeSegment === 'public' ? 'gratuita' : 'exclusiva'} encontrada
          </h3>
          <p className="text-gray-500 mt-2">
            Confira a aba {activeSegment === 'public' ? 'Exclusivo' : 'Gratuito'} para ver outros conteúdos!
          </p>
          <button 
            onClick={() => setActiveSegment(activeSegment === 'public' ? 'private' : 'public')}
            className="mt-6 text-indigo-600 font-bold hover:underline"
          >
            Mudar para aba {activeSegment === 'public' ? 'Exclusivo' : 'Gratuito'}
          </button>
        </div>
      )}

      {filteredCategories.length === 0 && (
        <div className="text-center py-20">
          <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Search className="text-gray-400 w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            {search ? 'Nenhuma categoria encontrada' : 'Aguardando conteúdos...'}
          </h3>
          <p className="text-gray-500 mt-2">
            {search ? 'Tente buscar por outros termos.' : 'Em breve teremos novos materiais para você nesta seção.'}
          </p>
        </div>
      )}
    </div>
  );
};

const CategoryDetail = ({ categories, contents, favorites, isAdmin }: { categories: Category[], contents: Content[], favorites: Favorite[], isAdmin: boolean }) => {
  const { id } = useParams();
  const category = categories.find(c => c.id === id);
  const categoryContents = contents.filter(c => c.categoryId === id);
  const [search, setSearch] = useState('');

  const filteredContents = categoryContents.filter(c => {
    const title = c.title || '';
    const desc = c.description || '';
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || 
                         desc.toLowerCase().includes(search.toLowerCase());
    const isVisible = isAdmin || c.status !== 'hidden';
    return matchesSearch && isVisible;
  });

  const isFavorite = (contentId: string) => false;

  const toggleFavorite = async (contentId: string) => {
    alert("Função de favoritos desativada temporariamente.");
  };

  if (!category) return <div className="p-10 text-center">Categoria não encontrada</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link to="/" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center mb-2">
            <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Voltar para categorias
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
          <p className="text-gray-600 mt-1">{category.description}</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar nesta categoria..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredContents.map((content) => (
          <div 
            key={content.id} 
            className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-indigo-200 transition-colors group shadow-sm"
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
              content.type === ContentType.VIDEO ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
            )}>
              {content.type === ContentType.VIDEO ? <Video className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-gray-900 truncate">{content.title || 'Sem título'}</h3>
                {((content.accessLevel || 'public') === 'private') && (
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                    isAdmin ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-600 border border-amber-100"
                  )}>
                    {isAdmin ? 'Acesso Admin' : 'Exclusivo'}
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm line-clamp-1">{content.description || 'Nenhuma descrição disponível'}</p>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
              <button 
                onClick={() => toggleFavorite(content.id)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isFavorite(content.id) ? "text-yellow-500 bg-yellow-50" : "text-gray-400 hover:bg-gray-50"
                )}
              >
                <Star className={cn("w-5 h-5", isFavorite(content.id) && "fill-current")} />
              </button>
              <Link 
                to={(content.accessLevel || 'public') === 'private' && !isAdmin ? '#' : `/content/${content.id}`}
                onClick={(e) => {
                  if ((content.accessLevel || 'public') === 'private' && !isAdmin) {
                    e.preventDefault();
                    alert("Este conteúdo é exclusivo para o administrador.");
                  }
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center",
                  content.accessLevel === 'private' && !isAdmin 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-gray-900 text-white hover:bg-indigo-600"
                )}
              >
                {content.accessLevel === 'private' && !isAdmin ? <Lock className="w-4 h-4 mr-2" /> : null}
                {content.accessLevel === 'private' && !isAdmin ? 'Bloqueado' : 'Abrir conteúdo'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredContents.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500">Nenhum conteúdo disponível nesta categoria ainda.</p>
        </div>
      )}
    </div>
  );
};

const ContentDetail = ({ contents }: { contents: Content[] }) => {
  const { id } = useParams();
  const content = contents.find(c => c.id === id);
  const navigate = useNavigate();
  const [selectedLinkIndex, setSelectedLinkIndex] = useState(0);

  if (!content) return <div className="p-10 text-center">Conteúdo não encontrado</div>;

  const links = content.links && content.links.length > 0 
    ? content.links 
    : [{ title: content.title, url: content.url }];
  
  const currentLink = links[selectedLinkIndex] || links[0];

  const renderPlayer = () => {
    if (content.type === ContentType.VIDEO) {
      const playlistId = getYouTubePlaylistId(currentLink.url);
      if (playlistId) {
        return (
          <div className="space-y-4">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border-4 border-indigo-100">
              <iframe 
                src={`https://www.youtube.com/embed/videoseries?list=${playlistId}&rel=0&showinfo=1`}
                className="w-full h-full"
                allowFullScreen
                title={currentLink.title}
              />
            </div>
            <div className="bg-indigo-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Menu className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Esta é uma Playlist!</p>
                  <p className="text-xs text-indigo-100">Clique no ícone de lista no canto superior direito do vídeo para escolher outras aulas.</p>
                </div>
              </div>
              <a 
                href={`https://www.youtube.com/playlist?list=${playlistId}`} 
                target="_blank" 
                rel="noreferrer"
                className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors shrink-0"
              >
                Ver no YouTube
              </a>
            </div>
          </div>
        );
      }

      const ytId = getYouTubeId(currentLink.url);
      if (ytId) {
        return (
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
            <iframe 
              src={`https://www.youtube.com/embed/${ytId}`}
              className="w-full h-full"
              allowFullScreen
              title={currentLink.title}
            />
          </div>
        );
      }
      
      const driveUrl = getGoogleDriveEmbedUrl(currentLink.url);
      return (
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
          <iframe 
            src={driveUrl}
            className="w-full h-full"
            allow="autoplay"
            allowFullScreen
            title={currentLink.title}
          />
        </div>
      );
    } else {
      const driveUrl = getGoogleDriveEmbedUrl(currentLink.url);
      return (
        <div className="h-[70vh] w-full rounded-2xl overflow-hidden bg-gray-100 shadow-2xl border border-gray-200">
          <iframe 
            src={driveUrl}
            className="w-full h-full"
            title={currentLink.title}
          />
        </div>
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center mb-6"
      >
        <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Voltar
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <span className={cn(
                "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                content.type === ContentType.VIDEO ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
              )}>
                {content.type === ContentType.VIDEO ? 'Vídeo' : 'PDF'}
              </span>
              <span className="text-gray-400 text-xs">•</span>
              <span className="text-gray-500 text-xs">Adicionado em {new Date(content.createdAt).toLocaleDateString()}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{content.title}</h1>
            <p className="text-gray-600 mt-2 text-lg leading-relaxed">{content.description}</p>
          </div>

          {renderPlayer()}

          <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
            <h3 className="font-bold text-indigo-900 mb-2">Dica de Estudo</h3>
            <p className="text-indigo-800 text-sm">Aproveite este material para fazer anotações e revisar os pontos principais. O aprendizado contínuo é a chave para o sucesso!</p>
          </div>
        </div>

        {links.length > 1 && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-900 flex items-center">
                  <PlayCircle className="w-5 h-5 mr-2 text-indigo-600" />
                  Conteúdos do Módulo
                </h3>
                <p className="text-xs text-gray-500 mt-1">{links.length} itens disponíveis</p>
              </div>
              <div className="p-2 max-h-[60vh] overflow-y-auto">
                {links.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedLinkIndex(index)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl transition-all flex items-start space-x-3 group",
                      selectedLinkIndex === index 
                        ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100" 
                        : "hover:bg-gray-50 text-gray-600"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
                      selectedLinkIndex === index ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                    )}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium leading-tight">{link.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Admin = ({ categories, contents, isAdmin }: { categories: Category[], contents: Content[], isAdmin: boolean }) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'contents'>('categories');
  const [debugStatus, setDebugStatus] = useState<string | null>(null);
  
  // Forms
  const [catForm, setCatForm] = useState({ name: '', description: '', imageUrl: '', isVisible: true, accessLevel: 'public' as 'public' | 'private' });
  const [contForm, setContForm] = useState({ 
    categoryId: '', 
    title: '', 
    description: '', 
    type: ContentType.VIDEO, 
    url: '', 
    status: 'free' as 'free' | 'hidden',
    links: [] as ContentLink[],
    accessLevel: 'public' as 'public' | 'private'
  });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingContId, setEditingContId] = useState<string | null>(null);

  const testConnection = async () => {
    setDebugStatus("Testando...");
    try {
      const { data, error } = await supabase.from('categories').select('*').limit(1);
      if (error) throw error;
      setDebugStatus("Conexão com Banco de Dados: OK!");
    } catch (error: any) {
      console.error("Debug connection error:", error);
      setDebugStatus(`Erro: ${error.message}`);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl text-center border border-gray-100">
        <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Acesso Restrito</h2>
        <p className="text-gray-500 mb-2">Você precisa estar logado como administrador para acessar esta página.</p>
        <p className="text-sm text-red-500 mb-6 font-medium">Esta área é restrita para o administrador do MindFlow.</p>
        <Link to="/" className="text-indigo-600 font-bold hover:underline">Voltar para o Início</Link>
      </div>
    );
  }

  const [saving, setSaving] = useState(false);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name || saving) return;
    
    setSaving(true);
    try {
      if (editingCatId) {
        const { error } = await supabase.from('categories').update(catForm).eq('id', editingCatId);
        if (error) throw error;
        setEditingCatId(null);
      } else {
        const { error } = await supabase.from('categories').insert({ ...catForm, order: categories.length });
        if (error) throw error;
      }
      setCatForm({ name: '', description: '', imageUrl: '', isVisible: true, accessLevel: 'public' });
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Erro ao salvar categoria. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contForm.categoryId || !contForm.title || !contForm.url || saving) return;
    
    setSaving(true);
    try {
      if (editingContId) {
        const { error } = await supabase.from('contents').update(contForm).eq('id', editingContId);
        if (error) throw error;
        setEditingContId(null);
      } else {
        const { error } = await supabase.from('contents').insert({ ...contForm, createdAt: new Date().toISOString() });
        if (error) throw error;
      }
      setContForm({ 
        categoryId: '', 
        title: '', 
        description: '', 
        type: ContentType.VIDEO, 
        url: '', 
        status: 'free',
        links: [],
        accessLevel: 'public'
      });
    } catch (error) {
      console.error("Error saving content:", error);
      alert("Erro ao salvar conteúdo. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const startEditCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatForm({ 
      name: cat.name, 
      description: cat.description, 
      imageUrl: cat.imageUrl || '', 
      isVisible: cat.isVisible !== false,
      accessLevel: cat.accessLevel || 'public'
    });
  };

  const startEditContent = (cont: Content) => {
    setEditingContId(cont.id);
    setContForm({ 
      categoryId: cont.categoryId, 
      title: cont.title, 
      description: cont.description, 
      type: cont.type, 
      url: cont.url, 
      status: cont.status || 'free',
      links: cont.links || [],
      accessLevel: cont.accessLevel || 'public'
    });
  };

  const toggleCategoryVisibility = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from('categories').update({ isVisible: !current }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Error toggling category visibility:", error);
    }
  };

  const toggleContentStatus = async (id: string, current: 'free' | 'hidden') => {
    try {
      const { error } = await supabase.from('contents').update({ status: current === 'free' ? 'hidden' : 'free' }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Error toggling content status:", error);
    }
  };

  const handleDelete = async (coll: string, id: string) => {
    if (window.confirm('Tem certeza que deseja excluir?')) {
      try {
        const { error } = await supabase.from(coll).delete().eq('id', id);
        if (error) throw error;
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Erro ao excluir. Tente novamente.");
      }
    }
  };

  const handleSeedData = async () => {
    if (categories.length > 0 || saving) return;
    
    setSaving(true);
    try {
      const initialCategories = [
        { name: 'Desenvolvimento Pessoal', description: 'Cursos para melhorar sua produtividade, mentalidade e hábitos.', order: 0, isVisible: true, accessLevel: 'public' },
        { name: 'Estudos Bíblicos', description: 'Aprofunde seu conhecimento nas escrituras com materiais exclusivos.', order: 1, isVisible: true, accessLevel: 'public' },
        { name: 'Finanças', description: 'Aprenda a gerir seu dinheiro, investir e alcançar a liberdade financeira.', order: 2, isVisible: true, accessLevel: 'public' },
        { name: 'Liderança', description: 'Desenvolva habilidades de gestão e influência para liderar equipes.', order: 3, isVisible: true, accessLevel: 'public' },
        { name: 'Cursos Técnicos', description: 'Aprenda novas profissões e habilidades práticas.', order: 4, isVisible: true, accessLevel: 'public' }
      ];

      const { error } = await supabase.from('categories').insert(initialCategories);
      if (error) throw error;
      alert('Categorias iniciais adicionadas!');
    } catch (error) {
      console.error("Error seeding data:", error);
      alert("Erro ao adicionar categorias. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
        <div className="flex items-center space-x-4">
          {categories.length === 0 && (
            <button 
              onClick={handleSeedData} 
              disabled={saving}
              className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              {saving ? 'Semeando...' : 'Semear Dados Iniciais'}
            </button>
          )}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('categories')}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", activeTab === 'categories' ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700")}
            >
              Categorias
            </button>
            <button 
              onClick={() => setActiveTab('contents')}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", activeTab === 'contents' ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700")}
            >
              Conteúdos
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'categories' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold mb-4 flex items-center">
                {editingCatId ? <Edit2 className="w-5 h-5 mr-2 text-amber-600" /> : <Plus className="w-5 h-5 mr-2 text-indigo-600" />}
                {editingCatId ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={catForm.name}
                    onChange={e => setCatForm({...catForm, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
                  <textarea 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                    value={catForm.description}
                    onChange={e => setCatForm({...catForm, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL da Imagem (opcional)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={catForm.imageUrl}
                    onChange={e => setCatForm({...catForm, imageUrl: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nível de Acesso</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={catForm.accessLevel}
                    onChange={e => setCatForm({...catForm, accessLevel: e.target.value as 'public' | 'private'})}
                    required
                  >
                    <option value="public">Público (Ver sem login)</option>
                    <option value="private">Privado (Requer login)</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      checked={catForm.isVisible}
                      onChange={e => setCatForm({...catForm, isVisible: e.target.checked})}
                    />
                    <span className="text-sm font-medium text-gray-700">Visível para alunos</span>
                  </label>
                </div>
                <div className="flex space-x-2">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className={cn(
                      "flex-1 py-2 rounded-xl font-bold transition-colors disabled:opacity-50", 
                      editingCatId ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    )}
                  >
                    {saving ? 'Processando...' : (editingCatId ? 'Salvar Alterações' : 'Criar Categoria')}
                  </button>
                  {editingCatId && (
                    <button 
                      type="button" 
                      onClick={() => { setEditingCatId(null); setCatForm({ name: '', description: '', imageUrl: '', isVisible: true, accessLevel: 'public' }); }}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Nome</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Acesso</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categories.map(cat => (
                    <tr key={cat.id}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{cat.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{cat.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded text-[10px] font-bold uppercase",
                          cat.accessLevel === 'private' ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"
                        )}>
                          {cat.accessLevel === 'private' ? 'Exclusivo' : 'Público'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleCategoryVisibility(cat.id, cat.isVisible !== false)}
                          className={cn(
                            "px-2 py-1 rounded text-[10px] font-bold uppercase",
                            cat.isVisible !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                          )}
                        >
                          {cat.isVisible !== false ? 'Visível' : 'Oculto'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button onClick={() => startEditCategory(cat)} className="text-amber-500 hover:text-amber-700 p-2 rounded-lg hover:bg-amber-50 transition-colors" title="Editar">
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete('categories', cat.id)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Excluir">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold mb-4 flex items-center">
                {editingContId ? <Edit2 className="w-5 h-5 mr-2 text-amber-600" /> : <Plus className="w-5 h-5 mr-2 text-indigo-600" />}
                {editingContId ? 'Editar Conteúdo' : 'Novo Conteúdo'}
              </h2>
              <form onSubmit={handleSaveContent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={contForm.categoryId}
                    onChange={e => setContForm({...contForm, categoryId: e.target.value})}
                    required
                  >
                    <option value="">Selecionar...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={contForm.title}
                    onChange={e => setContForm({...contForm, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                  <div className="flex space-x-2">
                    <button 
                      type="button"
                      onClick={() => setContForm({...contForm, type: ContentType.VIDEO})}
                      className={cn("flex-1 py-2 rounded-xl text-sm font-bold border transition-all", contForm.type === ContentType.VIDEO ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-gray-200 text-gray-500")}
                    >
                      Vídeo
                    </button>
                    <button 
                      type="button"
                      onClick={() => setContForm({...contForm, type: ContentType.PDF})}
                      className={cn("flex-1 py-2 rounded-xl text-sm font-bold border transition-all", contForm.type === ContentType.PDF ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-gray-200 text-gray-500")}
                    >
                      PDF
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL Principal (YouTube / Playlist / Drive)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Link do vídeo ou da playlist..."
                    value={contForm.url}
                    onChange={e => setContForm({...contForm, url: e.target.value})}
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Dica: Cole o link de uma playlist do YouTube para carregar todos os vídeos dela.</p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Links Adicionais (Aulas/Módulos)</label>
                    <button 
                      type="button"
                      onClick={() => setContForm({...contForm, links: [...contForm.links, { title: '', url: '' }]})}
                      className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Adicionar Link
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {contForm.links.map((link, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 relative group">
                        <button 
                          type="button"
                          onClick={() => {
                            const newLinks = [...contForm.links];
                            newLinks.splice(idx, 1);
                            setContForm({...contForm, links: newLinks});
                          }}
                          className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-sm border border-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <div className="space-y-2">
                          <input 
                            type="text" 
                            placeholder="Título do link (ex: Aula 02)"
                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={link.title}
                            onChange={e => {
                              const newLinks = [...contForm.links];
                              newLinks[idx].title = e.target.value;
                              setContForm({...contForm, links: newLinks});
                            }}
                            required
                          />
                          <input 
                            type="text" 
                            placeholder="URL do link"
                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={link.url}
                            onChange={e => {
                              const newLinks = [...contForm.links];
                              newLinks[idx].url = e.target.value;
                              setContForm({...contForm, links: newLinks});
                            }}
                            required
                          />
                        </div>
                      </div>
                    ))}
                    {contForm.links.length === 0 && (
                      <p className="text-[10px] text-gray-400 text-center py-2 italic">Nenhum link adicional adicionado.</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
                  <textarea 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                    value={contForm.description}
                    onChange={e => setContForm({...contForm, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nível de Acesso</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={contForm.accessLevel}
                    onChange={e => setContForm({...contForm, accessLevel: e.target.value as 'public' | 'private'})}
                    required
                  >
                    <option value="public">Público (Todos veem)</option>
                    <option value="private">Exclusivo (Só logados)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status de Visibilidade</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={contForm.status}
                    onChange={e => setContForm({...contForm, status: e.target.value as 'free' | 'hidden'})}
                    required
                  >
                    <option value="free">Livre (Visível)</option>
                    <option value="hidden">Oculto</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className={cn(
                      "flex-1 py-2 rounded-xl font-bold transition-colors disabled:opacity-50", 
                      editingContId ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    )}
                  >
                    {saving ? 'Processando...' : (editingContId ? 'Salvar Alterações' : 'Adicionar Conteúdo')}
                  </button>
                  {editingContId && (
                    <button 
                      type="button" 
                      onClick={() => { setEditingContId(null); setContForm({ categoryId: '', title: '', description: '', type: ContentType.VIDEO, url: '', status: 'free', links: [], accessLevel: 'public' }); }}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Título</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Acesso</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {contents.map(cont => (
                    <tr key={cont.id}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{cont.title}</div>
                        <div className="text-xs text-gray-500">{categories.find(c => c.id === cont.categoryId)?.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded text-[10px] font-bold uppercase",
                          cont.accessLevel === 'private' ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"
                        )}>
                          {cont.accessLevel === 'private' ? 'Exclusivo' : 'Público'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded text-[10px] font-bold uppercase",
                          cont.type === ContentType.VIDEO ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {cont.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleContentStatus(cont.id, cont.status || 'free')}
                          className={cn(
                            "px-2 py-1 rounded text-[10px] font-bold uppercase",
                            cont.status !== 'hidden' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                          )}
                        >
                          {cont.status !== 'hidden' ? 'Livre' : 'Oculto'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button onClick={() => startEditContent(cont)} className="text-amber-500 hover:text-amber-700 p-2 rounded-lg hover:bg-amber-50 transition-colors" title="Editar">
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete('contents', cont.id)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Excluir">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem('admin_auth') === 'true';
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [dbError, setDbError] = useState<{ message: string, code: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '847109') {
      setIsAdmin(true);
      sessionStorage.setItem('admin_auth', 'true');
      setShowAdminLogin(false);
      setAdminPassword('');
      setLoginError(null);
    } else {
      setLoginError('Senha incorreta!');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('admin_auth');
  };

  const handleLoginPopup = () => {
    setShowAdminLogin(true);
    setLoginError(null);
  };

  const fetchCategories = async () => {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('categories').select('*').order('order', { ascending: true });
      if (error) {
        console.error("Erro ao buscar categorias:", error);
        return error;
      }
      setCategories(data || []);
      return null;
    } catch (err: any) {
      return err;
    }
  };

  const fetchContents = async () => {
    if (!isSupabaseConfigured) return null;
    try {
      let query = supabase.from('contents').select('*');
      if (!isAdmin) {
        query = query.eq('accessLevel', 'public');
      }
      const { data, error } = await query.order('createdAt', { ascending: false });
      if (error) {
        console.error("Erro ao buscar conteúdos:", error);
        return error;
      }
      setContents(data || []);
      return null;
    } catch (err: any) {
      return err;
    }
  };

  const fetchFavorites = async () => {
    if (!isSupabaseConfigured) return;
    try {
      // Favorites are disabled since we don't have user accounts anymore
      setFavorites([]);
    } catch (err) {
      console.error("Fetch favorites unexpected error:", err);
    }
  };

  useEffect(() => {
    console.log("MindFlow App Mount");
  }, []);

  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setDebugLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    addLog("Sistema simplificado: Acesso via senha 847109.");
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let isMounted = true;

    const init = async () => {
      try {
        setLoading(true);
        addLog("Buscando categorias e conteúdos...");
        
        // Use a timeout for the entire init process
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("A conexão com Supabase expirou (Timeout)")), 15000)
        );

        const fetchPromise = Promise.all([fetchCategories(), fetchContents()]);
        
        const [catError, contError] = await Promise.race([fetchPromise, timeoutPromise]) as [any, any];
        
        if (!isMounted) return;

        const firstError = catError || contError;
        if (firstError) {
          addLog(`Erro detectado: ${firstError.message}`);
          setDbError({ message: firstError.message, code: firstError.code });
        } else {
          addLog("Dados carregados com sucesso.");
          setDbError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          addLog(`Erro fatal: ${err.message}`);
          setDbError({ message: err.message, code: err.code || 'INIT_ERROR' });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    init();

    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchCategories)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contents' }, fetchContents)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'favorites' }, fetchFavorites)
      .subscribe((status) => {
        addLog(`Canal Realtime: ${status}`);
        if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          console.warn("Realtime channel issue:", status);
        }
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    let timer: any;
    if (loading && isSupabaseConfigured) {
      timer = setTimeout(() => {
        setShowTroubleshoot(true);
      }, 3000); // Trigger troubleshooting after 3s
    } else {
      setShowTroubleshoot(false);
    }
    return () => clearTimeout(timer);
  }, [loading, isSupabaseConfigured]);

  const isUrlValidFormat = isSupabaseConfigured && !import.meta.env.VITE_SUPABASE_URL?.includes('db.');

  if (!isSupabaseConfigured) {
    const rawUrl = import.meta.env.VITE_SUPABASE_URL;
    const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const hasUrl = !!rawUrl && rawUrl !== 'your-supabase-url' && rawUrl.length > 5;
    const hasKey = !!rawKey && rawKey !== 'your-supabase-anon-key' && rawKey.length > 10;
    const isDbHost = rawUrl?.includes('db.');
    
    // Check if the URL has a protocol
    const needsProtocol = hasUrl && !rawUrl.includes('://');

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-center font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100/50 backdrop-blur-xl">
          <div className="w-24 h-24 bg-gradient-to-tr from-indigo-50 to-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-4 ring-white">
            <Settings className="w-12 h-12 text-indigo-500 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          
          <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Quase lá!</h1>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed px-2 font-medium">
            Sua conexão com o banco de dados Supabase precisa ser configurada no painel principal.
          </p>

          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-left mb-8 space-y-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2 flex items-center">
              <Activity className="w-3.5 h-3.5 mr-2 text-indigo-400" /> Diagnóstico de Conexão
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className={cn(
                  "w-6 h-6 rounded-xl flex items-center justify-center mr-3 shrink-0 text-[10px] font-bold shadow-sm transition-all",
                  hasUrl ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                )}>
                  {hasUrl ? <Check className="w-3.5 h-3.5" /> : "1"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">VITE_SUPABASE_URL</p>
                  {hasUrl ? (
                    <div className="mt-1 space-y-1">
                      <p className="text-emerald-600 text-xs font-semibold flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Valor detectado
                      </p>
                      {isDbHost && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 mt-2">
                          <p className="text-[10px] font-bold uppercase mb-1">Erro de Formato</p>
                          <p className="text-[11px] leading-tight font-medium">Você usou o host do banco de dados (<code className="bg-red-100 px-1 rounded">db.xyz...</code>). Use o <b>Project URL</b> da API.</p>
                        </div>
                      )}
                      {needsProtocol && (
                        <div className="bg-amber-50 text-amber-700 p-3 rounded-xl border border-amber-100 mt-2">
                          <p className="text-[10px] font-bold uppercase mb-1">Aviso</p>
                          <p className="text-[11px] leading-tight font-medium">Faltou o <code className="bg-amber-100 px-1 rounded">https://</code>, mas tentaremos conectar assim mesmo.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs mt-1 italic font-medium">Configuração pendente no menu Settings</p>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <div className={cn(
                  "w-6 h-6 rounded-xl flex items-center justify-center mr-3 shrink-0 text-[10px] font-bold shadow-sm transition-all",
                  hasKey ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                )}>
                  {hasKey ? <Check className="w-3.5 h-3.5" /> : "2"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">VITE_SUPABASE_ANON_KEY</p>
                  {hasKey ? (
                    <p className="text-emerald-600 text-xs font-semibold mt-1 flex items-center text-ellipsis overflow-hidden">
                      <CheckCircle2 className="w-3 h-3 mr-1 shrink-0" /> Chave pública detectada
                    </p>
                  ) : (
                    <p className="text-slate-400 text-xs mt-1 italic font-medium">Configuração pendente no menu Settings</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center group"
            >
              <span>Recarregar e Testar</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-slate-100 text-slate-600 py-3 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-all active:scale-95"
            >
              Abrir Console Supabase
            </a>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-50">
            <p className="text-[10px] text-gray-300 font-medium leading-relaxed max-w-[200px] mx-auto italic">
              Dica: Após salvar no menu Settings, a página pode levar alguns segundos para aplicar as mudanças.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (dbError && dbError.code !== '42P01') {
    const isSecretKeyError = dbError.message?.includes('secret API key');
    const isTimeoutError = dbError.message?.includes('Timeout');
    const isResetForced = dbError.code === 'RESET_CONFIG';
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-red-100">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6",
            (isResetForced || isTimeoutError) ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
          )}>
            {isResetForced ? <Settings className="w-8 h-8" /> : isTimeoutError ? <AlertTriangle className="w-8 h-8" /> : <X className="w-8 h-8" />}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {isResetForced ? "Revisar Configuração" : isTimeoutError ? "Tempo de Conexão Esgotado" : "Erro na Conexão"}
          </h1>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            {isResetForced 
              ? "Você escolheu revisar as configurações do Supabase."
              : isTimeoutError
                ? "Não conseguimos conectar ao seu servidor Supabase após 15 segundos."
                : isSecretKeyError 
                  ? "Você usou uma Chave de API Secreta (service_role) em vez da Chave Anon (pública)."
                  : "Houve um problema ao carregar os dados do banco."}
          </p>

          {(isSecretKeyError || isResetForced || isTimeoutError) ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mb-6">
              <p className="text-xs text-amber-800 font-bold mb-2">Checklist de Solução:</p>
              <ul className="text-xs text-amber-900 space-y-2 list-disc list-inside">
                <li>Verifique se o projeto não está <b>Pausado</b> no Supabase.</li>
                <li>Confirme que a URL é: <code className="bg-amber-100 px-1 rounded">https://ID.supabase.co</code></li>
                <li>Nunca use o host de banco <code className="bg-amber-100 px-1 rounded">db.ID...</code> ou a string <code className="bg-amber-100 px-1 rounded">postgresql://</code>.</li>
                <li>Use a chave <b>anon public</b>, nunca a <b>service_role</b>.</li>
              </ul>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 font-mono text-[10px] text-gray-500 overflow-auto max-h-32">
              <p className="font-bold text-gray-700 mb-1">Detalhes do erro:</p>
              <p>Code: {dbError.code || 'N/A'}</p>
              <p>Message: {dbError.message}</p>
            </div>
          )}

          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            {isResetForced || isSecretKeyError ? "Recarregar após configurar" : "Tentar Novamente"}
          </button>
        </div>
      </div>
    );
  }

  if (dbError?.code === '42P01') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 italic">
          <div className="bg-red-600 p-6 text-white flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <Plus className="w-8 h-8 text-white rotate-45" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Configuração do Banco de Dados</h1>
              <p className="text-red-100 text-sm">As tabelas necessárias não foram encontradas no Supabase.</p>
            </div>
          </div>
          
          <div className="p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Como resolver (Passo a Passo):</h2>
            <ol className="space-y-4 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center mr-3 shrink-0 font-bold">1</span>
                <span>Acesse o seu dashboard no <a href="https://supabase.com/dashboard" target="_blank" className="text-indigo-600 font-bold underline">Supabase</a>.</span>
              </li>
              <li className="flex items-start">
                <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center mr-3 shrink-0 font-bold">2</span>
                <span>Clique em <b>"SQL Editor"</b> no menu lateral esquerdo.</span>
              </li>
              <li className="flex items-start">
                <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center mr-3 shrink-0 font-bold">3</span>
                <span>Clique em <b>"+ New query"</b>.</span>
              </li>
              <li className="flex items-start">
                <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center mr-3 shrink-0 font-bold">4</span>
                <span>Copie o código abaixo e clique em <b>"Run"</b>:</span>
              </li>
            </ol>

            <div className="mt-6 bg-gray-900 rounded-2xl p-4 relative group">
              <pre className="text-indigo-400 text-[10px] sm:text-xs overflow-x-auto max-h-60 custom-scrollbar leading-relaxed">
{`/* 1. Criar Tabela de Categorias */
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  "imageUrl" text,
  "order" integer default 0,
  "isVisible" boolean default true,
  "accessLevel" text default 'public',
  "createdAt" timestamp with time zone default now()
);

/* 2. Criar Tabela de Conteúdos */
create table contents (
  id uuid default gen_random_uuid() primary key,
  "categoryId" uuid references categories(id) on delete cascade,
  title text not null,
  description text,
  type text not null,
  url text not null,
  status text default 'free',
  "accessLevel" text default 'public',
  links jsonb default '[]'::jsonb,
  "createdAt" timestamp with time zone default now()
);

/* 3. Criar Tabela de Favoritos */
create table favorites (
  id uuid default gen_random_uuid() primary key,
  "userId" uuid not null,
  "contentId" uuid references contents(id) on delete cascade,
  "createdAt" timestamp with time zone default now()
);

/* 4. Habilitar Segurança (RLS) */
alter table categories enable row level security;
alter table contents enable row level security;
alter table favorites enable row level security;

/* 5. Criar Políticas de Acesso */
create policy "Público: Ver categorias" on categories for select using (true);
create policy "Admin: Tudo em categorias" on categories using (auth.jwt() ->> 'email' = 'edsonfinanceiro2017@gmail.com');

create policy "Público: Ver conteúdos livres" on contents for select using ("accessLevel" = 'public');
create policy "Membros: Ver conteúdos exclusivos" on contents for select using (auth.role() = 'authenticated');
create policy "Admin: Tudo em conteúdos" on contents using (auth.jwt() ->> 'email' = 'edsonfinanceiro2017@gmail.com');

create policy "Usuários: Gerenciar próprios favoritos" on favorites using (auth.uid() = "userId");`}
              </pre>
              <button 
                onClick={() => {
                  const el = document.querySelector('pre');
                  if (el) {
                    navigator.clipboard.writeText(el.innerText);
                    alert("Código copiado! Agora cole no SQL Editor do Supabase.");
                  }
                }}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
              >
                Copiar SQL
              </button>
            </div>
            
            <p className="mt-6 text-[10px] text-gray-400 text-center">
              Após rodar o script e ver a mensagem "Success", atualize esta página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="flex flex-col items-center max-w-sm w-full text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium whitespace-nowrap">Carregando MindFlow...</p>
          
          {showTroubleshoot && (
            <div className="mt-10 p-6 bg-white rounded-3xl shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom duration-700">
              <p className="text-sm text-gray-600 mb-4 font-medium">O carregamento está demorando mais do que o esperado.</p>
              
              {debugLogs.length > 0 && (
                <div className="mb-6 bg-gray-50 rounded-xl p-3 text-left font-mono text-[9px] text-gray-400 border border-gray-100">
                  <p className="font-bold text-gray-500 mb-1 uppercase tracking-wider">Status do Sistema:</p>
                  {debugLogs.map((log, i) => (
                    <div key={i} className="border-b border-gray-100 py-1 last:border-0">{log}</div>
                  ))}
                </div>
              )}

              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Recarregar Página
                </button>
                <button 
                  onClick={() => {
                    // Forcefully clear keys info to show config screen
                    setDbError({ message: "Reset forçado pelo usuário.", code: "RESET_CONFIG" });
                    setLoading(false);
                  }}
                  className="bg-amber-100 text-amber-700 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-200 transition-all"
                >
                  Revisar Configurações
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
        <Navbar isAdmin={isAdmin} onAdminAuth={handleLoginPopup} onLogout={handleLogout} />

        {/* Admin Login Modal */}
        {showAdminLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full relative border border-gray-100"
            >
              <button 
                onClick={() => setShowAdminLogin(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Acesso Admin</h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Insira a senha de administrador para acessar o painel de gestão.
              </p>
              
              <form onSubmit={handleAdminVerify} className="space-y-4">
                <div className="relative">
                  <input 
                    type="password"
                    required
                    autoFocus
                    placeholder="Senha de acesso"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 px-5 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 font-medium text-center tracking-[0.5em]"
                  />
                </div>
                
                {loginError && (
                  <div className="flex items-center space-x-2 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-100"
                >
                  Entrar no Painel
                </button>
              </form>
            </motion.div>
          </div>
        )}
        
        <main className="pb-20">
          <Routes>
            <Route path="/" element={<Home categories={categories} isAdmin={isAdmin} />} />
            <Route path="/category/:id" element={<CategoryDetail categories={categories} contents={contents} favorites={favorites} isAdmin={isAdmin} />} />
            <Route path="/content/:id" element={<ContentDetail contents={contents} />} />
            <Route path="/admin" element={<Admin categories={categories} contents={contents} isAdmin={isAdmin} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <BookOpen className="text-white w-3 h-3" />
              </div>
              <span className="font-bold text-gray-900">MindFlow</span>
            </div>
            <p className="text-gray-500 text-sm">© 2024 MindFlow - Plataforma de Clareza. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
