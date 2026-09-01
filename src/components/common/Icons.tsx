import React from 'react';
import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon';

export const CloseIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></SvgIcon>
);

export const VisibilityIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></SvgIcon>
);

export const VisibilityOffIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></SvgIcon>
);

export const LockOutlinedIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></SvgIcon>
);

export const PersonOutlineIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/></SvgIcon>
);

export const HowToRegOutlinedIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M11 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 8c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm-6 4c.22-.72 3.31-2 6-2 2.7 0 5.8 1.29 6 2H5zm14.6-9.17l-3.03 3.02-1.42-1.42-1.41 1.41 2.83 2.83 4.44-4.43z"/></SvgIcon>
);

export const MailOutlineIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/></SvgIcon>
);

export const CardGiftcardIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/></SvgIcon>
);

export const NotificationsNoneIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></SvgIcon>
);

export const LogoutIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></SvgIcon>
);

export const TrendingUpIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></SvgIcon>
);

export const TrendingDownIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z"/></SvgIcon>
);

export const ShieldOutlinedIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83v-4.7l6-2.25 6 2.25v4.7z"/></SvgIcon>
);

export const AccountTreeOutlinedIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3h7zM7 9H4V5h3v4zm10 5h3v4h-3v-4zm0-9h3v4h-3V5z"/></SvgIcon>
);

export const ElectricBoltIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M15 2l-7.5 11h5l-2.5 9L20 11h-5l2.5-9z"/></SvgIcon>
);

export const EventAvailableIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM10.56 16.4l-2.55-2.55 1.41-1.41 1.14 1.14 4.55-4.55 1.41 1.41z"/></SvgIcon>
);

export const AccountBalanceWalletIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></SvgIcon>
);

export const GroupsIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></SvgIcon>
);

export const MilitaryTechIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M17 10.43V2H7v8.43c0 .35.18.68.49.86l4.51 2.71 4.51-2.71c.31-.18.49-.51.49-.86zM9 4h6v5.82l-3 1.8-3-1.8V4zm4 10.57V22l-2-1-2 1v-7.43l1.49.9 2.51-1.5v.6z"/></SvgIcon>
);

export const PeopleAltOutlinedIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M16.67 13.13C18.04 14.06 19 15.32 19 17v3h4v-3c0-2.18-3.57-3.47-6.33-3.87zM9 13c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4zm-6 5c.22-.72 3.31-2 6-2 2.7 0 5.8 1.29 6 2H3zM9 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm6-1c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3c-.55 0-1.04.15-1.48.4-.29-.6-.73-1.12-1.28-1.52.48-.55 1.18-.88 1.96-.88z"/></SvgIcon>
);

export const MonetizationOnOutlinedIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/></SvgIcon>
);

export const ShareOutlinedIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></SvgIcon>
);

export const ExpandMoreIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></SvgIcon>
);

export const LockClockIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M18 11V8c0-2.21-1.79-4-4-4S10 5.79 10 8v3H8v10h12V11h-2zm-6-3c0-1.1.9-2 2-2s2 .9 2 2v3h-4V8zm2 11c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm.5-4.5h-2V13h1.5v1.5z"/></SvgIcon>
);

export const CheckCircleIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></SvgIcon>
);

export const HourglassBottomIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M18 22l-6-6-6 6h12zM6 2l6 6 6-6H6zm6 7.5L8.5 6h7L12 9.5z"/></SvgIcon>
);

export const SwapHorizIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></SvgIcon>
);

export const ShowChartIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></SvgIcon>
);

export const HistoryIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></SvgIcon>
);

export const CheckCircleOutlineIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/></SvgIcon>
);

export const PendingActionsIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M17 12c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm1.65 7.35L16.5 17.2V14h1.5v2.55l1.8 1.08-.65.72zM6 2v6h6V2H6zm4 4H8V4h2v2zm7-4h-3v2h3v3h2V4c0-1.1-.9-2-2-2zM4 20c0 1.1.9 2 2 2h4v-2H6v-6H4v6zm0-10h2V6H4v4z"/></SvgIcon>
);

export const ContentCopyIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></SvgIcon>
);

export const QrCode2Icon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M15 21h-2v-2h2v2zm4-12h2V7h-2v2zM3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v2h2V3h-2zm8 8h-2V7h-2v4h4v2zm-4 4h2v-2h-2v2zm4 4h-2v2h2v-2zm-2-2h-2v2h2v-2zm0-4h-2v2h2v-2zm4 0h-2v2h2v-2zm-6-2h-2v2h2v-2zm2 2h-2v2h2v-2zm2-10h-2v2h2V5zm-2 2h-2v2h2V7zm-2 2h-2v2h2V9z"/></SvgIcon>
);

export const SendIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></SvgIcon>
);

export const ArrowDownwardIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></SvgIcon>
);

export const ArrowUpwardIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></SvgIcon>
);

export const VerifiedUserIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></SvgIcon>
);

export const UploadFileIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01 12.01 11 8 15.01z"/></SvgIcon>
);

export const ReceiptLongIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v14H3v3c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V2l-1.5 1.5zM19 19c0 .55-.45 1-1 1s-1-.45-1-1v-3H8V5h11v14zM9 7h6v2H9zm7 4H9v-2h7v2zm-7 2h4v2H9z"/></SvgIcon>
);

export const EditIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></SvgIcon>
);

export const VerifiedIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12zm-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z"/></SvgIcon>
);

export const HomeOutlinedIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/></SvgIcon>
);

export const EventAvailableOutlinedIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zm0-12H5V5h14v2zm-8.56 9.4l-2.55-2.55 1.41-1.41 1.14 1.14 4.55-4.55 1.41 1.41z"/></SvgIcon>
);

export const AccountBalanceWalletOutlinedIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.98 1-1.72V9c0-.74-.41-1.37-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z"/></SvgIcon>
);

export const PersonOutlineOutlinedIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/></SvgIcon>
);

export const MonetizationOnIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.14H14.3c-.05-.79-.53-1.6-2.1-1.6-1.59 0-2.07.72-2.07 1.46 0 .73.47 1.32 2.66 1.84 2.68.65 4.19 1.77 4.19 3.99-.01 1.88-1.41 3.01-3.57 3.31z"/></SvgIcon>
);

export const AccountTreeIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3h7zM7 9H4V5h3v4zm10 5h3v4h-3v-4zm0-9h3v4h-3V5z"/></SvgIcon>
);

export const StarIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></SvgIcon>
);

export const AutoAwesomeIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z"/></SvgIcon>
);

export const PlayArrowIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M8 5v14l11-7z"/></SvgIcon>
);

export const StopIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M6 6h12v12H6z"/></SvgIcon>
);

export const AdminPanelSettingsIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M17 11c.34 0 .67.04 1 .09V6.27L12 3.5 6 6.27v4.91c0 4.54 3.2 8.79 6 9.82.55-.2 1.1-.48 1.63-.82-.4-.68-.63-1.47-.63-2.32 0-2.48 2.02-4.5 4.5-4.5zm-5-3.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm5 5.5c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zm0 1.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"/></SvgIcon>
);

export const BlockIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/></SvgIcon>
);

export const AddCircleOutlineIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></SvgIcon>
);

export const RemoveCircleOutlineIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M7 11v2h10v-2H7zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></SvgIcon>
);

export const SearchIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></SvgIcon>
);

export const RefreshIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></SvgIcon>
);

export const SettingsIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></SvgIcon>
);

export const CancelIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></SvgIcon>
);

export const CheckIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></SvgIcon>
);

export const TuneIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></SvgIcon>
);

export const DeleteOutlineIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4z"/></SvgIcon>
);

export const EmojiEventsIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></SvgIcon>
);

export const AccessTimeIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></SvgIcon>
);

export const HexagonIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M17.2 3H6.8l-5.2 9 5.2 9h10.4l5.2-9-5.2-9zm-1.15 16H7.95l-4.04-7 4.04-7h8.1l4.04 7-4.04 7z"/></SvgIcon>
);

export const RocketLaunchIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}><path d="M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89l4.14 4.14c.31-.13 3.6-1.53 5.89-3.57C17.5 10.96 19 8.24 19 4c-4.24 0-6.96 1.5-9.81 2.35zM11.17 17l-4.14-4.14c-.06.14-.14.28-.22.42-1.5 2.5-1.56 5.57-1.56 5.57s3.07-.06 5.57-1.56c.14-.08.28-.16.42-.22l-.07-.07z"/></SvgIcon>
);


