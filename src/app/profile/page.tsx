"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { 
  User, LogOut, 
  ChevronRight, Moon, 
  Loader2, Camera
} from "lucide-react";

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Social Stats
  const [followingCount, setFollowingCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [followerList, setFollowerList] = useState<any[]>([]);
  const [isFollowingListOpen, setIsFollowingListOpen] = useState(false);
  const [isFollowersListOpen, setIsFollowersListOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchSocialStats();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setProfile({ ...data, email: user.email });
        setNewName(data.name || "");
      } else {
        setProfile({ email: user.email, name: "" });
      }
    }
  }

  async function fetchSocialStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Following
    const { data: following, count: followingCount } = await supabase
      .from('follows')
      .select('following_id, profiles:following_id(id, name, avatar_url)', { count: 'exact' })
      .eq('follower_id', user.id);
    
    // Followers
    const { data: followers, count: followerCount } = await supabase
      .from('follows')
      .select('follower_id, profiles:follower_id(id, name, avatar_url)', { count: 'exact' })
      .eq('following_id', user.id);
    
    setFollowingCount(followingCount || 0);
    setFollowerCount(followerCount || 0);
    setFollowingList(following || []);
    setFollowerList(followers || []);
  }

  async function toggleFollow(targetId: string, isCurrentlyFollowing: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (isCurrentlyFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetId);
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: targetId });
    }
    fetchSocialStats();
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  async function saveProfile() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        name: newName,
      });
      if (!error) {
        setIsEditingProfile(false);
        fetchProfile();
      }
    }
    setLoading(false);
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht eingeloggt");

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Wähle ein Bild aus.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      fetchProfile();
    } catch (error: any) {
      alert("Fehler beim Hochladen: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-full pb-10 flex flex-col bg-background" style={{ fontFamily: 'var(--font-sans, system-ui)' }}>
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-6 space-y-6">
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex flex-col items-center text-center gap-4">
          <div className="w-24 h-24 rounded-full bg-foreground flex items-center justify-center text-background text-3xl font-bold uppercase shrink-0 shadow-lg overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              profile?.name?.[0] || profile?.email?.[0] || "?"
            )}
          </div>
          
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-foreground">{profile?.name || "Name festlegen"}</h2>
            <div className="flex items-center gap-6 justify-center pt-2">
               <div className="flex flex-col active:scale-95 transition-transform cursor-pointer" onClick={() => setIsFollowersListOpen(true)}>
                  <span className="text-lg font-black leading-none text-foreground">{followerCount}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Follower</span>
               </div>
               <div className="w-px h-6 bg-border" />
               <div className="flex flex-col active:scale-95 transition-transform cursor-pointer" onClick={() => setIsFollowingListOpen(true)}>
                  <span className="text-lg font-black leading-none text-foreground">{followingCount}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Gefolgt</span>
               </div>
            </div>
          </div>

          <button 
            onClick={() => setIsEditingProfile(true)}
            className="w-full bg-secondary py-3 rounded-2xl text-xs font-bold text-foreground uppercase tracking-widest active:scale-[0.98] transition-transform"
          >
            Profil bearbeiten
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-2">App</h3>
          <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm">
            <div className="flex items-center gap-4 p-4 border-b border-border/50">
              <div className="w-8 h-8 rounded-lg bg-secondary text-foreground flex items-center justify-center shrink-0">
                <Moon size={18} />
              </div>
              <span className="flex-1 text-left font-semibold text-foreground">Dunkelmodus</span>
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`w-11 h-6 rounded-full transition-all relative ${theme === 'dark' ? 'bg-foreground' : 'bg-secondary'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all shadow-sm ${theme === 'dark' ? 'left-6 bg-background' : 'left-1 bg-foreground'}`} />
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full bg-card rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform border border-border text-destructive font-bold justify-center shadow-sm"
        >
          <LogOut size={18} />
          Abmelden
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEditingProfile(false)} />
          <div className="relative w-full max-w-[450px] bg-background rounded-t-[32px] p-6 h-[90dvh] flex flex-col gap-6 animate-in slide-in-from-bottom-4 shadow-2xl">
            <div className="w-10 h-1.5 bg-muted rounded-full mx-auto shrink-0" />
            <div className="flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-bold text-foreground">Profil bearbeiten</h2>
              <button onClick={saveProfile} disabled={loading || uploading} className="text-foreground font-bold px-2 active:scale-95 transition-transform">
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Speichern"}
              </button>
            </div>
            <div className="space-y-8 flex-1 overflow-y-auto no-scrollbar">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border shadow-inner">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-muted-foreground" />
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="animate-spin text-white" size={24} />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-foreground rounded-full border-2 border-background shadow-lg flex items-center justify-center text-background active:scale-90 transition-transform"
                  >
                    <Camera size={14} />
                  </button>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Profilbild ändern</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">Anzeigename</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-secondary p-4 rounded-xl outline-none font-bold text-lg text-foreground border-none" placeholder="Dein Name" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Followers List Modal */}
      {isFollowersListOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFollowersListOpen(false)} />
          <div className="relative w-full max-w-[450px] bg-background rounded-t-[32px] p-6 h-[90dvh] flex flex-col gap-6 animate-in slide-in-from-bottom-4 shadow-2xl overflow-hidden">
            <div className="w-10 h-1.5 bg-muted rounded-full mx-auto shrink-0" />
            <div className="flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-bold text-foreground">Follower</h2>
              <button onClick={() => setIsFollowersListOpen(false)} className="text-foreground font-bold active:opacity-50">Fertig</button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-10">
              {followerList.length > 0 ? followerList.map((f) => {
                const isFollowingBack = followingList.some(fol => fol.following_id === f.follower_id);
                return (
                  <div key={f.follower_id} className="bg-card p-4 rounded-2xl flex justify-between items-center border border-border shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                        {f.profiles?.avatar_url ? <img src={f.profiles.avatar_url} className="w-full h-full object-cover" /> : <span className="font-bold text-foreground">{f.profiles?.name?.[0]}</span>}
                      </div>
                      <span className="font-bold text-foreground">{f.profiles?.name}</span>
                    </div>
                    <button 
                      onClick={() => toggleFollow(f.follower_id, isFollowingBack)}
                      className={`font-bold text-xs uppercase px-4 py-2 rounded-xl transition-all ${isFollowingBack ? 'bg-secondary text-foreground' : 'bg-foreground text-background shadow-md'}`}
                    >
                      {isFollowingBack ? 'Folge ich' : 'Folgen'}
                    </button>
                  </div>
                );
              }) : (
                <div className="py-20 text-center flex flex-col items-center">
                  <User size={48} className="text-muted-foreground opacity-30 mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Noch keine Follower</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following List Modal */}
      {isFollowingListOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFollowingListOpen(false)} />
          <div className="relative w-full max-w-[450px] bg-background rounded-t-[32px] p-6 h-[90dvh] flex flex-col gap-6 animate-in slide-in-from-bottom-4 shadow-2xl overflow-hidden">
            <div className="w-10 h-1.5 bg-muted rounded-full mx-auto shrink-0" />
            <div className="flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-bold text-foreground">Folge ich</h2>
              <button onClick={() => setIsFollowingListOpen(false)} className="text-foreground font-bold active:opacity-50">Fertig</button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-10">
              {followingList.length > 0 ? followingList.map((f) => (
                <div key={f.following_id} className="bg-card p-4 rounded-2xl flex justify-between items-center border border-border shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                      {f.profiles?.avatar_url ? <img src={f.profiles.avatar_url} className="w-full h-full object-cover" /> : <span className="font-bold text-foreground">{f.profiles?.name?.[0]}</span>}
                    </div>
                    <span className="font-bold text-foreground">{f.profiles?.name}</span>
                  </div>
                  <button onClick={() => toggleFollow(f.following_id, true)} className="text-destructive font-bold text-xs uppercase bg-destructive/10 px-3 py-2 rounded-xl active:scale-95 transition-transform">Entfolgen</button>
                </div>
              )) : (
                <div className="py-20 text-center flex flex-col items-center">
                  <User size={48} className="text-muted-foreground opacity-30 mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Du folgst noch niemandem</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
