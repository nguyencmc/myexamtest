import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  User, 
  Save, 
  Camera,
  Mail,
  AtSign,
  FileText,
  Loader2,
  Upload,
  Trash2,
  Settings
} from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  points: number | null;
  level: number | null;
}

export const DashboardSettingsView = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setUsername(data.username || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url || "");
      } else {
        const newProfile = {
          user_id: user!.id,
          email: user!.email,
          full_name: user!.user_metadata?.full_name || "",
          username: user!.email?.split("@")[0] || "",
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) throw createError;
        
        setProfile(createdProfile);
        setFullName(createdProfile.full_name || "");
        setUsername(createdProfile.username || "");
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error("Không thể tải thông tin tài khoản");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      toast.error("Chỉ chấp nhận file ảnh (jpg, png, gif, webp)");
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Kích thước ảnh tối đa là 2MB");
      return;
    }
    
    setUploading(true);
    
    try {
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      if (avatarUrl && avatarUrl.includes('avatars')) {
        const oldPath = avatarUrl.split('/avatars/')[1];
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      }
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      setAvatarUrl(publicUrl);
      toast.success("Đã tải ảnh lên thành công!");
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error("Không thể tải ảnh lên");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user || !avatarUrl) return;
    
    try {
      if (avatarUrl.includes('avatars')) {
        const oldPath = avatarUrl.split('/avatars/')[1];
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      }
      
      setAvatarUrl("");
      toast.success("Đã xóa ảnh đại diện");
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error("Không thể xóa ảnh");
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error("Username chỉ được chứa chữ cái, số và dấu gạch dưới");
      return;
    }

    setSaving(true);
    try {
      if (username && username !== profile.username) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .neq('user_id', user.id)
          .single();

        if (existingUser) {
          toast.error("Username này đã được sử dụng");
          setSaving(false);
          return;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || null,
          username: username.trim() || null,
          bio: bio.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Đã lưu thông tin thành công!");
      
      setProfile(prev => prev ? {
        ...prev,
        full_name: fullName.trim() || null,
        username: username.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      } : null);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error("Không thể lưu thông tin");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 overflow-y-auto h-full">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 overflow-y-auto h-full">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cài đặt</h1>
            <p className="text-sm text-muted-foreground">
              Quản lý thông tin cá nhân của bạn
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-muted">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                    {(fullName || username || user?.email || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    disabled={uploading}
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Tải ảnh
                  </Button>
                  {avatarUrl && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleRemoveAvatar}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Xóa
                    </Button>
                  )}
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, GIF, WebP. Tối đa 2MB.
                </p>
              </div>
            </div>

            <Separator />

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm">Họ và tên</Label>
              <Input
                id="fullName"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={100}
              />
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm">Username</Label>
              <Input
                id="username"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                maxLength={30}
              />
              <p className="text-xs text-muted-foreground">
                Trang cá nhân: /@{username || 'username'}
              </p>
            </div>

            {/* Email Field (Read Only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm">Giới thiệu</Label>
              <Textarea
                id="bio"
                placeholder="Viết vài dòng giới thiệu về bạn..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={3}
              />
              <p className="text-xs text-muted-foreground text-right">
                {bio.length}/500
              </p>
            </div>

            <Separator />

            {/* Stats Display */}
            {profile && (
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                <div className="text-center">
                  <p className="text-xl font-bold text-primary">{profile.points?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted-foreground">Điểm tích lũy</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-accent">Level {profile.level || 1}</p>
                  <p className="text-xs text-muted-foreground">Cấp độ</p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="min-w-28">
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Lưu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
