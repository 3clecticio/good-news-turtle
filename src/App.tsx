import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Feed } from './components/Feed';
import { DreamsView } from './components/DreamsView';
import { VideoUniverseView } from './components/VideoUniverseView';
import { ProfileView } from './components/ProfileView';
import { CreatePostModal } from './components/CreatePostModal';
import { CommentsModal } from './components/CommentsModal';
import { AuthModal } from './components/AuthModal';
import { Post, Profile } from './types';
import { supabase } from './lib/supabase';

export function App() {
  const [activeTab, setActiveTab] = useState('feed');
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeCommentsPost, setActiveCommentsPost] = useState<Post | null>(null);
  const [feedKey, setFeedKey] = useState(0);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        setUserProfile(data);
      } else {
        setUserProfile({
          id: userId,
          user_id: userId,
          turtle_handle: 'kind_turtle',
          display_name: 'Kind Turtle',
          kind_streak: 1,
          created_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error('Fetch profile error:', e);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    setSelectedUserId(null);
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setActiveTab('profile');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-md mx-auto relative border-x border-slate-800/40 shadow-2xl">
      <Header
        userProfile={userProfile}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => {
          setSelectedUserId(null);
          setActiveTab('profile');
        }}
      />

      <main className="flex-1 overflow-y-auto">
        {activeTab === 'feed' && (
          <Feed
            key={feedKey}
            userProfile={userProfile}
            onOpenComments={(post) => setActiveCommentsPost(post)}
            onOpenCreateModal={() => (userProfile ? setShowCreateModal(true) : setShowAuthModal(true))}
            onSelectUser={handleSelectUser}
          />
        )}

        {activeTab === 'dreams' && (
          <DreamsView userProfile={userProfile} onOpenAuth={() => setShowAuthModal(true)} />
        )}

        {activeTab === 'videos' && <VideoUniverseView />}

        {activeTab === 'profile' && (
          <ProfileView
            userProfile={userProfile}
            targetUserId={selectedUserId}
            onOpenAuth={() => setShowAuthModal(true)}
            onSignOut={handleSignOut}
            onBack={selectedUserId ? () => setSelectedUserId(null) : undefined}
            onSelectUser={handleSelectUser}
            onOpenComments={(p) => setActiveCommentsPost(p)}
          />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'profile') setSelectedUserId(null);
          setActiveTab(tab);
        }}
        onOpenCreateModal={() => (userProfile ? setShowCreateModal(true) : setShowAuthModal(true))}
      />

      {showCreateModal && (
        <CreatePostModal
          userProfile={userProfile}
          onClose={() => setShowCreateModal(false)}
          onPostCreated={() => setFeedKey((k) => k + 1)}
          onOpenAuth={() => {
            setShowCreateModal(false);
            setShowAuthModal(true);
          }}
        />
      )}

      {activeCommentsPost && (
        <CommentsModal
          post={activeCommentsPost}
          userProfile={userProfile}
          onClose={() => setActiveCommentsPost(null)}
          onOpenAuth={() => {
            setActiveCommentsPost(null);
            setShowAuthModal(true);
          }}
          onSelectUser={handleSelectUser}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setFeedKey((k) => k + 1)}
        />
      )}
    </div>
  );
}

export default App;