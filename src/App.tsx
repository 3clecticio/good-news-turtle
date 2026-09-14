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
        // Fallback default profile if new auth user
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
    // Check active auth session
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
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 max-w-md mx-auto relative border-x border-slate-800/40 shadow-2xl">
      {/* Top Header */}
      <Header
        userProfile={userProfile}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => setActiveTab('profile')}
      />

      {/* Main Tab Views */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'feed' && (
          <Feed
            key={feedKey}
            userProfile={userProfile}
            onOpenComments={(post) => setActiveCommentsPost(post)}
            onOpenCreateModal={() => {
              if (userProfile) {
                setShowCreateModal(true);
              } else {
                setShowAuthModal(true);
              }
            }}
          />
        )}

        {activeTab === 'dreams' && (
          <DreamsView
            userProfile={userProfile}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}

        {activeTab === 'videos' && <VideoUniverseView />}

        {activeTab === 'profile' && (
          <ProfileView
            userProfile={userProfile}
            onOpenAuth={() => setShowAuthModal(true)}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      {/* Bottom Mobile Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenCreateModal={() => {
          if (userProfile) {
            setShowCreateModal(true);
          } else {
            setShowAuthModal(true);
          }
        }}
      />

      {/* Post Creator Modal */}
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

      {/* Post Comments Modal */}
      {activeCommentsPost && (
        <CommentsModal
          post={activeCommentsPost}
          userProfile={userProfile}
          onClose={() => setActiveCommentsPost(null)}
          onOpenAuth={() => {
            setActiveCommentsPost(null);
            setShowAuthModal(true);
          }}
        />
      )}

      {/* Auth Modal */}
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
