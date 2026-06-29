import { AndeanAvatar, type AndeanAvatarProfile } from './AndeanAvatar';

interface Props {
  profile?: AndeanAvatarProfile;
  size?: number;
  className?: string;
}

export function UserAvatar({ profile = {}, size = 36, className = '' }: Props) {
  return <AndeanAvatar profile={profile} size={size} className={className} />;
}
