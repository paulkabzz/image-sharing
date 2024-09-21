import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { createStory, getRecentStories, deleteExpiredStories } from '@/lib/appwrite/api';

import { createPost, createUserAccount, deletePost, deleteSavedPost, getCurrentUser, getInfinitePosts, getPostById, getRecentPosts, getUserById, getUserPosts, getUsers, likePost, savePost, searchPosts, signInAccount, signOutAccount, updatePost, updateUser, deleteStory, updateStoryViews } from '@/lib/appwrite/api';
import { INewPost, INewUser, IUpdatePost, IUpdateUser, INewStory } from '@/types';
import { databases, appwriteConfig } from '@/lib/appwrite/config';
import { Query } from 'appwrite';

import { QUERY_KEYS } from './queryKeys'

export const useCreateUserAccount = () => {
    return useMutation({
        mutationFn: (user: INewUser) => createUserAccount(user)
    });
};

export const useSignInAccount = () => {
  return useMutation({
      mutationFn: (user: { email: string; password: string }) => signInAccount(user),
      onError: (error) => {
          console.error("Error signing in:", error);
      },
  });
};


export const useSignOutAccount = () => {
    return useMutation({
        mutationFn: signOutAccount
    });
};

export const useCreatePost = () => {

    const queryClient = useQueryClient()
    
    return useMutation({
      mutationFn: (post: INewPost) => createPost(post),
      onSuccess: () => {
        queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            });
        },
    });
  };

export const useGetRecentPosts = () => {
    return useQuery ({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        queryFn: getRecentPosts,
    });
};

export const useLikePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, likesArray } : { postId: string, 
            likesArray: string[] }) => likePost(postId, likesArray),
        onSuccess: data => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id]
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS]
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            });
        },
    });
};

export const useSavePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, userId } : { postId: string, 
            userId: string }) => savePost(postId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS]
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            });
        },
    });
};

export const useDeleteSavedPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS]
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            });
        },
    });
};

export const useGetCurrenUser = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        queryFn: getCurrentUser,
    });
};

export const useGetPostById = (postId: string)  => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
        queryFn: () => getPostById(postId),
        enabled: !!postId,
    });
};

export const useUpdatePost = ()  => {

    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (post: IUpdatePost) => updatePost(post),
       onSuccess: data => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id]
            });
        },
    });
};
export const useDeletePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ postId, imageId }: { postId?: string; imageId: string }) => deletePost(postId, imageId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        });
      },
    });
  };
  

  export const useGetPosts = () => {
    return useInfiniteQuery({
      queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
      queryFn: getInfinitePosts as any,
      initialPageParam: null, // Add this line,
      getNextPageParam: (lastPage: any) => {
        // If there's no data, there are no more pages.
        if (lastPage && lastPage.documents.length === 0) {
          return null;
        };
  
        // Use the $id of the last document as the cursor.
        const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
        return lastId;
      },
    });
  };
  

export const useSearchPosts = (searchTerm: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
        queryFn: () => searchPosts(searchTerm),
        enabled: !!searchTerm,

    });
};

export const useGetUsers = (limit?: number) => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_USERS],
      queryFn: () => getUsers(limit),
    });
  };
  

  export const useGetUserById = (userId: string) => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
      queryFn: () => getUserById(userId),
      enabled: !!userId,
    });
  };
  
  export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (user: IUpdateUser) => updateUser(user),
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
        });
      },
    });
  };

  export const useGetUserPosts = (userId?: string) => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
      queryFn: () => getUserPosts(userId),
      enabled: !!userId,
    });
  };

export const useCreateStory = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (story: INewStory) => createStory(story),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_STORIES]
            });
        },
    });
};

export const useGetRecentStories = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_RECENT_STORIES],
        queryFn: getRecentStories,
    });
};

export const useDeleteExpiredStories = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteExpiredStories,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_STORIES]
            });
        },
    });
};


// ... existing code ...

export const useDeleteStory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (storyId: string) => deleteStory(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_STORIES]
      });
    },
  });
};

export const useUpdateStoryViews = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ storyId, userId, creatorId }: { storyId: string, userId: string, creatorId: string }) => 
      updateStoryViews(storyId, userId, creatorId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['storyViews']
      });
    },
  });
};

// Add this new query hook
export const useGetStoryViews = (userId: string) => {
  return useQuery({
    queryKey: ['storyViews', userId],
    queryFn: async () => {
      try {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.storyViewsCollectionId, // Make sure this is the correct ID for your StoryViews collection
          [Query.equal("userId", userId)]
        );
        return response.documents.map((doc: any) => doc.storyId);
      } catch (error) {
        console.error("Error fetching story views:", error);
        return [];
      }
    },
    enabled: !!userId
  });
};