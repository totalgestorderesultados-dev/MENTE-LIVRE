import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, User, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, where, addDoc, deleteDoc, doc, updateDoc, getDocs, limit } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Category, Content, ContentType, Favorite } from './types';
import { LogIn, LogOut, Settings, Home as HomeIcon, BookOpen, Video, FileText, Star, Search, Plus, Trash2, ChevronRight, Menu, X, PlayCircle, Edit2 } from 'lucide-react';
import { cn, getYouTubeId, getGoogleDriveEmbedUrl } from './utils';

// --- Components ---

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
            {isAdmin && (
              <Link to="/admin" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium flex items-center">
                <Settings className="w-4 h-4 mr-1" /> Painel
              </Link>
            )}
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-gray-200" />
                  <span className="text-sm font-medium text-gray-700">{user.displayName?.split(' ')[0]}</span>
                </div>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 p-2 rounded-full transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button onClick={handleLoginPopup} className="text-gray-400 hover:text-indigo-600 p-2 rounded-full transition-colors" title="Login Administrativo">
                <Settings className="w-5 h-5" />
              </button>
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
                <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full" />
                <span className="font-medium text-gray-700">{user.displayName}</span>
              </div>
              <button onClick={handleLogout} className="text-red-600 font-medium">Sair</button>
            </div>
          ) : (
            <div className="pt-4 border-t border-gray-100">
              <button onClick={handleLoginPopup} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center">
                <Settings className="w-4 h-4 mr-2" /> Login Administrativo
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
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                         c.description.toLowerCase().includes(search.toLowerCase());
    const isVisible = isAdmin || c.isVisible !== false;
    return matchesSearch && isVisible;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">O que você quer aprender hoje?</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Explore nossas categorias e encontre o conteúdo ideal para o seu desenvolvimento.</p>
        
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCategories.map((category) => (
          <Link 
            key={category.id} 
            to={`/category/${category.id}`}
            className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
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
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{category.name}</h3>
              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{category.description}</p>
              <div className="mt-4 flex items-center text-indigo-600 font-semibold text-sm">
                Ver conteúdos <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-20">
          <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Search className="text-gray-400 w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Nenhuma categoria encontrada</h3>
          <p className="text-gray-500">Tente buscar por outros termos.</p>
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
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                         c.description.toLowerCase().includes(search.toLowerCase());
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
              <h3 className="text-lg font-bold text-gray-900 truncate">{content.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-1">{content.description}</p>
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
                to={`/content/${content.id}`}
                className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-colors flex items-center"
              >
                Abrir conteúdo <ChevronRight className="w-4 h-4 ml-1" />
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

  if (!content) return <div className="p-10 text-center">Conteúdo não encontrado</div>;

  const renderPlayer = () => {
    if (content.type === ContentType.VIDEO) {
      const ytId = getYouTubeId(content.url);
      if (ytId) {
        return (
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
            <iframe 
              src={`https://www.youtube.com/embed/${ytId}`}
              className="w-full h-full"
              allowFullScreen
              title={content.title}
            />
          </div>
        );
      }
      
      const driveUrl = getGoogleDriveEmbedUrl(content.url);
      return (
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
          <iframe 
            src={driveUrl}
            className="w-full h-full"
            allow="autoplay"
            allowFullScreen
            title={content.title}
          />
        </div>
      );
    } else {
      const driveUrl = getGoogleDriveEmbedUrl(content.url);
      return (
        <div className="h-[70vh] w-full rounded-2xl overflow-hidden bg-gray-100 shadow-2xl border border-gray-200">
          <iframe 
            src={driveUrl}
            className="w-full h-full"
            title={content.title}
          />
        </div>
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center mb-6"
      >
        <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Voltar
      </button>

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
  );
};

const Admin = ({ categories, contents, isAdmin }: { categories: Category[], contents: Content[], isAdmin: boolean }) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'contents'>('categories');
  const [debugStatus, setDebugStatus] = useState<string | null>(null);
  
  // Forms
  const [catForm, setCatForm] = useState({ name: '', description: '', imageUrl: '', isVisible: true });
  const [contForm, setContForm] = useState({ categoryId: '', title: '', description: '', type: ContentType.VIDEO, url: '', status: 'free' as 'free' | 'hidden' });
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

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name) return;
    
    if (editingCatId) {
      await updateDoc(doc(db, 'categories', editingCatId), catForm);
      setEditingCatId(null);
    } else {
      await addDoc(collection(db, 'categories'), { ...catForm, order: categories.length });
    }
    setCatForm({ name: '', description: '', imageUrl: '', isVisible: true });
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contForm.categoryId || !contForm.title || !contForm.url) return;
    
    if (editingContId) {
      await updateDoc(doc(db, 'contents', editingContId), contForm);
      setEditingContId(null);
    } else {
      await addDoc(collection(db, 'contents'), { ...contForm, createdAt: new Date().toISOString() });
    }
    setContForm({ categoryId: '', title: '', description: '', type: ContentType.VIDEO, url: '', status: 'free' });
  };

  const startEditCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatForm({ 
      name: cat.name, 
      description: cat.description, 
      imageUrl: cat.imageUrl || '', 
      isVisible: cat.isVisible !== false 
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
      status: cont.status || 'free' 
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
    if (categories.length > 0) return;
    
    const initialCategories = [
      { name: 'Desenvolvimento Pessoal', description: 'Cursos para melhorar sua produtividade, mentalidade e hábitos.', order: 0, isVisible: true },
      { name: 'Estudos Bíblicos', description: 'Aprofunde seu conhecimento nas escrituras com materiais exclusivos.', order: 1, isVisible: true },
      { name: 'Finanças', description: 'Aprenda a gerir seu dinheiro, investir e alcançar a liberdade financeira.', order: 2, isVisible: true },
      { name: 'Liderança', description: 'Desenvolva habilidades de gestão e influência para liderar equipes.', order: 3, isVisible: true },
      { name: 'Cursos Técnicos', description: 'Aprenda novas profissões e habilidades práticas.', order: 4, isVisible: true }
    ];

    for (const cat of initialCategories) {
      await addDoc(collection(db, 'categories'), cat);
    }
    alert('Categorias iniciais adicionadas!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
        <div className="flex items-center space-x-4">
          {categories.length === 0 && (
            <button onClick={handleSeedData} className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300 transition-colors">
              Semear Dados Iniciais
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
                  <button type="submit" className={cn("flex-1 py-2 rounded-xl font-bold transition-colors", editingCatId ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white")}>
                    {editingCatId ? 'Salvar Alterações' : 'Criar Categoria'}
                  </button>
                  {editingCatId && (
                    <button 
                      type="button" 
                      onClick={() => { setEditingCatId(null); setCatForm({ name: '', description: '', imageUrl: '', isVisible: true }); }}
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
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL (YouTube / Drive / Direto)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={contForm.url}
                    onChange={e => setContForm({...contForm, url: e.target.value})}
                    required
                  />
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
                  <button type="submit" className={cn("flex-1 py-2 rounded-xl font-bold transition-colors", editingContId ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white")}>
                    {editingContId ? 'Salvar Alterações' : 'Adicionar Conteúdo'}
                  </button>
                  {editingContId && (
                    <button 
                      type="button" 
                      onClick={() => { setEditingContId(null); setContForm({ categoryId: '', title: '', description: '', type: ContentType.VIDEO, url: '', status: 'free' }); }}
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log("Redirect login success:", result.user.email);
        }
      } catch (error: any) {
        console.error("Redirect result error:", error);
        // We don't want to show this error on every page load if it's just a "no result" error
        if (error.code !== 'auth/no-auth-event') {
          alert(`Erro no login alternativo: ${error.message}`);
        }
      }
    };
    checkRedirect();

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAdmin(u?.email === 'edsonfinanceiro2017@gmail.com');
    });

    const unsubCats = onSnapshot(query(collection(db, 'categories'), orderBy('order', 'asc')), (snap) => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
    });

    const unsubConts = onSnapshot(query(collection(db, 'contents'), orderBy('createdAt', 'desc')), (snap) => {
      setContents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Content)));
    });

    return () => {
      unsubAuth();
      unsubCats();
      unsubConts();
    };
  }, []);

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
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium animate-pulse">Carregando EduHub...</p>
        </div>
      </div>
    );
  }

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
              <span className="font-bold text-gray-900">EduHub</span>
            </div>
            <p className="text-gray-500 text-sm">© 2024 EduHub - Plataforma de Educação. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
