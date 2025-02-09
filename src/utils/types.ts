import { ReactNode } from 'react'

export interface BaseComponentProps {
  children?: ReactNode;
}

export type VideoEventHandler = (event: React.SyntheticEvent<HTMLVideoElement>) => void;
export type UploadProgressHandler = (progress: number) => void;
export type ErrorHandler = (error: Error) => void;
export type FileData = {
  path: string;
  size: number;
  type: string;
};

export type CommentData = {
  id: string;
  text: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  created_at: string;
};

export type NotificationData = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
};
