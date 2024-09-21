export type IContextType = {
  user: IUser;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
};


export type INavLink = {
    imgURL: string;
    imgURLActive: string;
    route: string;
    label: string;
  };

  export type IUpdateUser = {
    userId: string;
    name: string;
    bio: string;
    imageId: string;
    imageUrl: URL | string;
    username: string;
    file: File[];
  };
  
  export type INewPost = {
    userId: string;
    caption: string;
    file: File[];
    location?: string;
    tags?: string;
  };
  
  export type IUpdatePost = {
    postId: string;
    caption: string;
    imageId: string;
    imageUrl: URL;
    file: File[];
    location?: string;
    tags?: string;
  };
  
  export type IUser = {
    id: string;
    name: string;
    username: string;
    email: string;
    imageUrl: string;
    bio: string;
  };
  
  export type INewUser = {
    name: string;
    email: string;
    username: string;
    password: string;
  };

export type INewStory = {
    userId: string;
    file: File[];
};

export interface IViewer {
    id: string;
    username: string;
    imageUrl: string;
}

export interface IStory {
    $id: string;
    $createdAt: string;
    creator: {
        $id: string;
        username: string;
        imageUrl: string;
    };
    imageUrl: string;
    imageId: string;
    expiresAt: string;
    id: string;
};

export interface IStoryView {
    $id: string;
    storyId: string;
    userId: string;
    viewedAt: string;
}