import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

const BedrockLogo: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 32 32">
    {/* Mountain base */}
    <path d="M4 26 L12 10 L16 16 L20 8 L28 26 Z" fill="currentColor" opacity="0.85" />
    {/* City skyline */}
    <rect x="10" y="17" width="3" height="9" rx="0.5" fill="#fff" opacity="0.9" />
    <rect x="14" y="14" width="2.5" height="12" rx="0.5" fill="#fff" opacity="0.9" />
    <rect x="17.5" y="16" width="3" height="10" rx="0.5" fill="#fff" opacity="0.9" />
    <rect x="21.5" y="19" width="2.5" height="7" rx="0.5" fill="#fff" opacity="0.85" />
    {/* Mountain peak accent */}
    <path d="M18 8 L20 8 L19 6 Z" fill="currentColor" opacity="0.6" />
    <path d="M10 10 L12 10 L11 8 Z" fill="currentColor" opacity="0.6" />
    {/* Ground */}
    <rect x="2" y="26" width="28" height="2" rx="1" fill="currentColor" opacity="0.95" />
  </SvgIcon>
);

export default BedrockLogo;
