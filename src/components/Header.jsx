import { ActionIcon, Avatar, Group, Image, Tooltip, Button } from '@mantine/core';
import { IconAlertTriangle, IconLogout, IconSettings } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Header({ user, signOut, isOnline, onShowWarningModal }) { // Add onShowWarningModal prop
  const { isAnon, logout: authLogout } = useAuth();
  const nav = useNavigate();

  console.log('Header.jsx: isAnon:', isAnon); // Add this line

  return (
    <div className="w-full border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Left: Profile Icon or Warning Icon */}
        <div className="flex items-center">
          {isAnon ? (
            <ActionIcon // Replaced Tooltip with direct ActionIcon
              variant="subtle"
              size="xl"
              aria-label="anonymous-warning"
              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded-full"
              onClick={onShowWarningModal} // Call the prop function on click
            >
              <IconAlertTriangle size={24} />
            </ActionIcon>
          ) : (
            <Avatar
              src={user?.photoURL || undefined}
              alt="account"
              radius="xl"
              size="lg"
              className="rounded-full cursor-pointer transition-opacity hover:border-gray-500"
            />
          )}
        </div>

        {/* Center: Web Icon */}
        <div className="flex items-center justify-center">
          <Image src="/IconAssetXpen/MainWebIcon.png" alt="Xpen" h={40} w={40} />
        </div>

        {/* Right: Settings Icon */}
        <div className="flex items-center">
          <ActionIcon
            variant="subtle"
            size="xl"
            aria-label="Settings"
            className="text-gray-300 hover:text-white hover:bg-gray-700 rounded-full"
            onClick={() => nav('/xpen/settings')}
          >
            <IconSettings size={24} />
          </ActionIcon>
        </div>
      </div>

    </div>
  );
}
