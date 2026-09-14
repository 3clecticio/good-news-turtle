export interface Profile {
  id: string;
  user_id: string;
  turtle_handle: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  kind_streak: number;
  last_active_date?: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  link_url?: string;
  shared_article_title?: string;
  shared_article_source?: string;
  shared_article_image?: string;
  parent_post_id?: string;
  created_at: string;
  updated_at?: string;
  profiles?: Profile;
  turtle_powers_count?: number;
  has_user_powered?: boolean;
  comments_count?: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
}

export interface TurtlePower {
  id: string;
  user_id: string;
  post_id?: string;
  article_url?: string;
  created_at: string;
}

export interface TurtleDream {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category?: string;
  created_at: string;
  profiles?: Profile;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  category_name?: string;
  created_at: string;
}
