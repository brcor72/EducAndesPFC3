import { AndeanAvatar, type AndeanAvatarProfile } from './AndeanAvatar';

interface Props {
  profile?: AndeanAvatarProfile & { avatarUrl?: string | null };
  size?: number;
  className?: string;
}

export function UserAvatar({ profile = {}, size = 36, className = '' }: Props) {
  if (profile.avatarUrl?.startsWith('data:')) {
    return (
      <img
        src={profile.avatarUrl}
        alt="avatar"
        width={size}
        height={size}
        className={`rounded-full object-cover bg-muted ${className}`}
        style={{ width: size, height: size, flexShrink: 0 }}
      />
    );
  }
  return <AndeanAvatar profile={profile} size={size} className={className} />;
}
