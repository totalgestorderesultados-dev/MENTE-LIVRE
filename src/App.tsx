import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, User, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, where, addDoc, deleteDoc, doc, updateDoc, getDocs, limit } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Category, Content, ContentLink, ContentType, Favorite } from './types';
import { LogIn, LogOut, Settings, Home as HomeIcon, BookOpen, Video, FileText, Star, Search, Plus, Trash2, ChevronRight, Menu, X, PlayCircle, Edit2, Lock, Download } from 'lucide-react';
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
};

const Navbar = ({ user, isAdmin }: { user: User | null, isAdmin: boolean }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLoginPopup = async () => {
    setLoginError(null);
    const provider = new GoogleAuthProvider();
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login popup error:", error);
      if (error.code === 'auth/popup-blocked') {
        setLoginError("O popup foi bloqueado. Tente o botão 'Alternativo' ao lado.");
      } else if (error.code === 'auth/unauthorized-domain') {
        setLoginError("Erro: Este domínio não está autorizado no Firebase. Por favor, me avise para eu corrigir.");
      } else {
        setLoginError(`Erro: ${error.message || "Falha ao entrar"}`);
      }
    }
  };

  const handleLoginRedirect = async () => {
    setLoginError(null);
    const provider = new GoogleAuthProvider();
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Login redirect error:", error);
      setLoginError(`Erro Redirecionamento: ${error.message}`);
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <PwaInstaller />
      {loginError && (
        <div className="bg-red-600 text-white text-center py-2 text-sm font-medium px-4 flex items-center justify-center">
          <span>{loginError}</span>
          <button onClick={() => setLoginError(null)} className="ml-4 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-xs">Fechar</button>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">MindFlow</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Início</Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <Link to="/admin" className="text-gray-400 hover:text-indigo-600 p-2 rounded-full transition-colors" title="Painel Admin">
                    <Settings className="w-5 h-5" />
                  </Link>
                )}
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <img src={user.photoURL || ''} alt="" className="w-6 h-6 rounded-full border border-gray-200" />
                  <span className="text-xs font-bold text-gray-700">{user.displayName?.split(' ')[0]}</span>
                </div>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 p-2 rounded-full transition-colors" title="Sair">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleLoginPopup} 
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Entrar / Cadastro</span>
                </button>
                <button onClick={handleLoginPopup} className="text-gray-300 hover:text-indigo-400 p-1" title="Login Admin">
                  <Settings className="w-4 h-4" />
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
          {user ? (
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full shadow-sm" />
                <span className="font-bold text-gray-700">{user.displayName}</span>
              </div>
              <button onClick={handleLogout} className="text-red-500 font-bold bg-red-50 px-4 py-2 rounded-xl text-sm">Sair</button>
            </div>
          ) : (
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <button onClick={handleLoginPopup} className="w-full bg-indigo-600 text-white px-4 py-3 rounded-2xl font-bold flex items-center justify-center shadow-lg shadow-indigo-100">
                <LogIn className="w-4 h-4 mr-2" /> Entrar / Cadastro
              </button>
              <button onClick={handleLoginPopup} className="w-full text-gray-400 text-xs py-2 flex items-center justify-center">
                <Settings className="w-3 h-3 mr-1" /> Login Administrativo
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

// --- Pages ---

const Home = ({ categories, user, isAdmin }: { categories: Category[], user: User | null, isAdmin: boolean }) => {
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

        <div className="mt-8 flex justify-center">
          <div className="inline-flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
            {[
              { id: 'public', label: 'Gratuito' },
              { id: 'private', label: activeSegment === 'private' && !user ? 'Realizar Cadastro' : 'Exclusivo' }
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
                {tab.id === 'private' && activeSegment === 'private' && !user ? (
                   <div className="flex items-center">
                     <LogIn className="w-4 h-4 mr-2" />
                     {tab.label}
                   </div>
                ) : tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeSegment === 'private' && !user ? (
        <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-xl text-center max-w-2xl mx-auto py-16">
          <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-indigo-600 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Área Exclusiva</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Cadastre-se ou entre com sua conta Google agora para acessar cursos premium, 
            materiais exclusivos e salvar seus conteúdos favoritos.
          </p>
          <div className="flex flex-col space-y-4 items-center">
            <button 
              onClick={() => {
                const nav = document.querySelector('nav');
                const loginBtn = nav?.querySelector('button[onClick*="handleLoginPopup"]');
                if (loginBtn instanceof HTMLButtonElement) loginBtn.click();
                else alert("Clique no botão 'Entrar' no topo da página.");
              }}
              className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center justify-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-105"
            >
              <LogIn className="w-5 h-5 mr-2" /> Começar Agora Gratuitamente
            </button>
            <p className="text-xs text-gray-400">Acesso instantâneo via conta Google.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedCategories.map((category) => (
            <Link 
              key={category.id} 
              to={(category.accessLevel || 'public') === 'private' && !user ? '#' : `/category/${category.id}`}
              onClick={(e) => {
                if ((category.accessLevel || 'public') === 'private' && !user) {
                  e.preventDefault();
                  alert("Esta categoria é exclusiva para membros. Por favor, faça login para acessar.");
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

const CategoryDetail = ({ categories, contents, favorites, user, isAdmin }: { categories: Category[], contents: Content[], favorites: Favorite[], user: User | null, isAdmin: boolean }) => {
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

  const isFavorite = (contentId: string) => favorites.some(f => f.contentId === contentId);

  const toggleFavorite = async (contentId: string) => {
    if (!user) return alert("Faça login para favoritar conteúdos");
    
    const existing = favorites.find(f => f.contentId === contentId && f.userId === user.uid);
    if (existing) {
      await deleteDoc(doc(db, 'favorites', existing.id));
    } else {
      await addDoc(collection(db, 'favorites'), {
        userId: user.uid,
        contentId: contentId
      });
    }
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
                    user ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-600 border border-amber-100"
                  )}>
                    {user ? 'Acesso Liberado' : 'Premium'}
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
                to={(content.accessLevel || 'public') === 'private' && !user ? '#' : `/content/${content.id}`}
                onClick={(e) => {
                  if ((content.accessLevel || 'public') === 'private' && !user) {
                    e.preventDefault();
                    alert("Acesso exclusivo para membros. Por favor, faça login.");
                  }
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center",
                  content.accessLevel === 'private' && !user 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-gray-900 text-white hover:bg-indigo-600"
                )}
              >
                {content.accessLevel === 'private' && !user ? <Lock className="w-4 h-4 mr-2" /> : null}
                {content.accessLevel === 'private' && !user ? 'Bloqueado' : 'Abrir conteúdo'}
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
      const q = query(collection(db, 'categories'), limit(1));
      await getDocs(q);
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
        {auth.currentUser ? (
          <div className="mb-6 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-xs text-amber-700">Logado como:</p>
            <p className="text-sm font-bold text-amber-900">{auth.currentUser.email}</p>
            <p className="text-[10px] text-amber-600 mt-1">Este e-mail não tem permissão de administrador.</p>
          </div>
        ) : (
          <p className="text-sm text-red-500 mb-6 font-medium">Você não está logado.</p>
        )}
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
        await updateDoc(doc(db, 'categories', editingCatId), catForm);
        setEditingCatId(null);
      } else {
        await addDoc(collection(db, 'categories'), { ...catForm, order: categories.length });
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
        await updateDoc(doc(db, 'contents', editingContId), contForm);
        setEditingContId(null);
      } else {
        await addDoc(collection(db, 'contents'), { ...contForm, createdAt: new Date().toISOString() });
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
    await updateDoc(doc(db, 'categories', id), { isVisible: !current });
  };

  const toggleContentStatus = async (id: string, current: 'free' | 'hidden') => {
    await updateDoc(doc(db, 'contents', id), { status: current === 'free' ? 'hidden' : 'free' });
  };

  const handleDelete = async (coll: string, id: string) => {
    if (confirm('Tem certeza que deseja excluir?')) {
      await deleteDoc(doc(db, coll, id));
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

      for (const cat of initialCategories) {
        await addDoc(collection(db, 'categories'), cat);
      }
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
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAdmin(u?.email === 'edsonfinanceiro2017@gmail.com');
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    // Categories Listener - Broad query is now allowed by rules to ensure UI stability
    // We sort and filter isVisible in memory to avoid composite index errors
    const qCats = query(collection(db, 'categories'));

    const unsubCats = onSnapshot(qCats, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
      setCategories(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
    }, (error) => {
      console.error("Error fetching categories:", error);
    });

    // Contents Listener - Query must still match security rules
    let qConts;
    if (isAdmin || user) {
      // Logged in: Can read all (security rules handle private content)
      qConts = query(collection(db, 'contents'));
    } else {
      // Logged out: ONLY public contents allowed by security rules
      qConts = query(collection(db, 'contents'), where('accessLevel', '==', 'public'));
    }

    const unsubConts = onSnapshot(qConts, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Content));
      // Sort in memory by date descending, with safety checks
      setContents(data.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }));
    }, (error) => {
      console.error("Error fetching contents:", error);
    });

    return () => {
      unsubCats();
      unsubConts();
    };
  }, [isAdmin, user]);

  useEffect(() => {
    if (user) {
      const unsubFavs = onSnapshot(query(collection(db, 'favorites'), where('userId', '==', user.uid)), (snap) => {
        setFavorites(snap.docs.map(d => ({ id: d.id, ...d.data() } as Favorite)));
      });
      return () => unsubFavs();
    } else {
      setFavorites([]);
    }
  }, [user]);

  useEffect(() => {
    console.log("MindFlow App Mount");
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
        <Navbar user={user} isAdmin={isAdmin} />
        
        <main className="pb-20">
          <Routes>
            <Route path="/" element={<Home categories={categories} user={user} isAdmin={isAdmin} />} />
            <Route path="/category/:id" element={<CategoryDetail categories={categories} contents={contents} favorites={favorites} user={user} isAdmin={isAdmin} />} />
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
