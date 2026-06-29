import { buildAvatarUrl, type AvatarProfile } from '../../lib/avatars';

interface Props {
  avatarUrl?: string | null;
  profile?: AvatarProfile;
  size?: number;
  className?: string;
}

export function UserAvatar({ avatarUrl, profile, size = 36, className = '' }: Props) {
  const src = avatarUrl || buildAvatarUrl(profile ?? {});
  const fallback = buildAvatarUrl(profile ?? {});
  return (
    <img
      src={src}
      alt="avatar"
      width={size}
      height={size}
      className={`rounded-full object-cover bg-muted ${className}`}
      style={{ width: size, height: size, flexShrink: 0 }}
      onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
    />
  );
}
