import { getAvatar } from '../../lib/avatars';

interface Props {
  avatarKey?: string | null;
  size?: number;
  className?: string;
}

export function UserAvatar({ avatarKey, size = 36, className = '' }: Props) {
  const avatar = getAvatar(avatarKey);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold select-none ${className}`}
      style={{ width: size, height: size, background: avatar.bg, fontSize: size * 0.52 }}
      title={avatar.label}
    >
      {avatar.emoji}
    </span>
  );
}
