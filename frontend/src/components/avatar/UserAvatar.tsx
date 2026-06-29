import { buildAvatarUrl } from '../../lib/avatars';

interface Props {
  avatarUrl?: string | null;
  seed?: string;
  size?: number;
  className?: string;
}

export function UserAvatar({ avatarUrl, seed = 'usuario', size = 36, className = '' }: Props) {
  const src = avatarUrl || buildAvatarUrl(seed);
  return (
    <img
      src={src}
      alt="avatar"
      width={size}
      height={size}
      className={`rounded-full object-cover bg-muted ${className}`}
      style={{ width: size, height: size }}
      onError={(e) => { (e.target as HTMLImageElement).src = buildAvatarUrl(seed); }}
    />
  );
}
