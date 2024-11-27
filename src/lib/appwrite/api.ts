import { INewPost, INewUser, IUpdatePost, IUpdateUser, INewStory } from "@/types";
import { account, appwriteConfig, avatars, databases, storage } from "@/lib/appwrite/config";

import { ID, Query } from "appwrite";
import { throws } from "assert";

// ============================== CREATE USER ============================== \\

export async function createUserAccount (user: INewUser){
        try {

            const newAccount = await account.create(
                ID.unique(),
                user.email,
                user.password,
                user.name,
            )

            if(!newAccount) throw new Error("Failed to create user account");


            const avatarUrl = avatars.getInitials(user.name);

            const newUser = await saveUserToDB({
                accountId: newAccount.$id,
                name: newAccount.name,
                email: newAccount.email,
                username: user.username,
                imageUrl: avatarUrl,
            });
            
            if(!newUser) {
                await deleteFile(avatarUrl.href);
                throw new Error("Failed to save user to DB");
            }

            return newUser;
            
        } catch (error) {
            console.error('err', error);
            throw new Error("Failed to create user account");
        }
}

// ============================== SAVE USER TO DB ============================== \\
    
export async function saveUserToDB(user: {
    accountId: string;
    email: string;
    name: string;
    imageUrl: URL;
    username?: string;
}) {
    try {
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user,
        )

        return newUser;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to save user to DB");
    }
}

// ============================== SIGN IN ACCOUNT ============================== \\

export async function signInAccount (user: {email: string, password: string}) {

    try {

        const session = await account.createEmailSession(user.email, user.password);

        return session;
        
    } catch (error) {
        console.error(error);
        throw new Error("Failed to sign in account");
    }

}

// ============================== GET CURRENT USER ============================== \\

export async function getCurrentUser() {
    try {

        const currentAccount = await account.get();

        if (!currentAccount) throw new Error("Failed to get current user");

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        );

        if (!currentUser) throw new Error("Failed to get current user");

        return currentUser.documents[0];
        
    } catch (error) {
        console.error(error);
        throw new Error("Failed to get current user");
    }
}

// ============================== SIGN OUT ACCOUNT ============================== \\

export async function signOutAccount() {
    try {

        const session = await account.deleteSession('current');

        return session;
        
    } catch (error) {
        console.error(error);
        throw new Error("Failed to sign out account");
    }
}

// ============================== CREATE POST ============================== \\

export async function createPost(post: INewPost) {
    try {
        if (!post.file || post.file.length === 0) {
            throw new Error("No file provided");
        }

        const file = post.file[0];
        if (!(file instanceof File)) {
            throw new Error("Invalid file object");
        }

        //upload image to storage
        const uploadedFile = await uploadFile(file);

        if (!uploadedFile) throw new Error("Failed to upload file");

        //Get file URL
        const fileUrl = getFilePreview(uploadedFile.$id);
        console.log({fileUrl});
        

        if(!fileUrl) {
            deleteFile(uploadedFile.$id);
            throw new Error("Failed to get file url");
        }

        //convert tags into an array
        const tags = post.tags?.replace(/ /g, '').split(',') || [];

        //save post to DB

        const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            ID.unique(),
            {
                creator: post.userId,
                caption: post.caption,
                imageUrl: fileUrl,
                imageId: uploadedFile.$id,
                location: post.location,
                tags: tags
            }

        );

        if (!newPost) {
            await deleteFile(uploadedFile.$id);
            throw new Error("Failed to save post to DB");
        }

        return newPost;

    } catch (error) {
        console.error("Error in createPost:", error);
        throw new Error("Failed to create post");
    }
    
}

// ============================== UPLOAD FILE ============================== \\

export async function uploadFile(file: File) {
    try {
        if (!(file instanceof File)) {
            throw new Error("Invalid file object");
        }

        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file
        );

        return uploadedFile;
    } catch (error) {
        console.error("Error in uploadFile:", error);
        throw new Error("Failed to upload file");
    }
}

// ============================== GET FILE PREVIEW ============================== \\

export function getFilePreview (fileId: string) {
    try {
        
        const fileUrl = storage.getFilePreview(
            appwriteConfig.storageId,
            fileId,
            2000,
            2000,
            "top",
            100
        )

        return fileUrl;
        
    } catch (error) {
        console.error(error);
        throw new Error("Failed to get file preview");
    }
}
// ============================== DELETE FILE ============================== \\

export async function deleteFile (fileId: string) {
    try {

        await storage.deleteFile(appwriteConfig.storageId, fileId);

        return { status: 'ok' };

        
    } catch (error) {
        console.error(error);
        throw new Error("Failed to delete file");
    }
}

// ============================== GET RECENT POSTS ============================== \\

export async function getRecentPosts() {
    const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        [Query.orderDesc('$createdAt'), Query.limit(20)]
    );

    if(!posts) throw new Error("Failed to get recent posts");
    return posts;
}

// ============================== LIKE POST ============================== \\

export async function likePost (postId: string, likesArray:string[]) {
    try {

        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
            {
                likes: likesArray
            }
        );

        if(!updatedPost) throw new Error("Failed to like post");
        return updatedPost;
        
    } catch (error) {
        console.error(error);
        throw new Error("Failed to like post");
    }
}

// ============================== SAVE POST ============================== \\

export async function savePost (postId: string, userId:string) {
    try {

        const updatedPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            ID.unique(),
            {
                user: userId,
                post: postId
            }
        );

        if(!updatedPost) throw new Error("Failed to save post");
        return updatedPost;
        
    } catch (error) {
        console.error(error);
        throw new Error("Failed to save post");
    }
}

// ============================== DELETE SAVED POST ============================== \\

export async function deleteSavedPost (savedRecordId: string) {
    try {

        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            savedRecordId,
        );

        if(!statusCode) throw new Error("Failed to delete saved post");
        return { status: 'ok' };
        
    } catch (error) {
        console.error(error);
        throw new Error("Failed to delete saved post");
    }
}

// ============================== GET POST BY ID ============================== \\

export async function getPostById(postId: string) {
    try {

        const post = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        );

        if(!post) throw new Error("Failed to get post by id");
        return post;
        
    } catch (error) {
        console.error(error);
        throw new Error("Failed to get post by id");
    }
}

// ============================== UPDATE POST ============================== \\

export async function updatePost(post: IUpdatePost) {
    const hasFileToUpdate = post.file.length > 0;
        
    try {

        let image =  {
            imageUrl: post.imageUrl,
            imageId: post.imageId
        }

        if (hasFileToUpdate) {
            
             //upload image to storage

        const uploadedFile = await uploadFile(post.file[0]);

            if (!uploadedFile) throw new Error("Failed to upload file");

            //Get file URL
            const fileUrl = getFilePreview(uploadedFile.$id);            
    
            if(!fileUrl) {
                deleteFile(uploadedFile.$id);
                throw new Error("Failed to get file url");
            }
    
            image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id};
        }
       

        //convert tags into an array
        const tags = post.tags?.replace(/ /g, '').split(',') || [];

        //save post to DB

        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            post.postId,
            {
                caption: post.caption,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
                location: post.location,
                tags: tags
            }

        );

        if (!updatedPost) {
            await deleteFile(post.imageId);
            throw new Error("Failed to update post");
        }

        return updatedPost;

    } catch (error) {
        console.error(error);
        throw new Error("Failed to update post");
    }
    
}

// ============================== DELETE POST ============================== \\

export async function deletePost(postId?: string, imageId?: string) {
    if (!postId || !imageId) return;
  
    try {
      const statusCode = await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        postId
      );
  
      if (!statusCode) throw new Error("Failed to delete post");
  
      await deleteFile(imageId);
  
      return { status: "Ok" };
    } catch (error) {
      console.error(error);
      throw new Error("Failed to delete post");
    }
  }

// ============================== SEARCH POSTS ============================== \\

export async function searchPosts(searchTerm: string) {

    try {

        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.search('caption', searchTerm)]
        );

        if (!posts) throw new Error("Failed to search posts");

        return posts;
        
    } catch (error) {
        console.error(error);
        throw new Error("Failed to search posts");
    };
};

// ============================== GET INFINITE POSTS ============================== \\

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
    const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];
  
    if (pageParam) {
      queries.push(Query.cursorAfter(pageParam.toString()));
    }
  
    try {
      const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        queries
      );
  
      if (!posts) throw new Error("No posts found");
  
      return posts;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch posts");
    }
  }

// ============================== GET USERS ============================== \\

export async function getUsers(limit?: number) {
    const queries: any[] = [Query.orderDesc("$createdAt")];
  
    if (limit) {
      queries.push(Query.limit(limit));
    }
  
    try {
      const users = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        queries
      );
  
      if (!users) throw new Error("No users found");
  
      return users;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch users");
    }
  }

// ============================== GET USER POSTS ============================== \\

  export async function getUserPosts(userId?: string) {
    if (!userId) return;
  
    try {
      const post = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
      );
  
      if (!post) throw new Error("No posts found");
  
      return post;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch user posts");
    }
  }

// ============================== GET USER BY ID ============================== \\

  export async function getUserById(userId: string) {
    try {
      const user = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        userId
      );
  
      if (!user) throw new Error("No user found");
  
      return user;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch user by ID");
    }
  }

  //0640014810 - Lihle  
  
  // ============================== UPDATE USER ============================== \\

  export async function updateUser(user: IUpdateUser) {
    const hasFileToUpdate = user.file.length > 0;
    try { 
      let image = {
        imageUrl: user.imageUrl,
        imageId: user.imageId,
      };
  
      if (hasFileToUpdate) {
        // Upload new file to appwrite storage
        const uploadedFile = await uploadFile(user.file[0]);
        if (!uploadedFile) throw new Error("Failed to upload file");
  
        // Get new file url
        const fileUrl = getFilePreview(uploadedFile.$id);
        if (!fileUrl) {
          await deleteFile(uploadedFile.$id);
          throw new Error("Failed to get file url");
        }
  
        image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
      }
  
      //  Update user
      const updatedUser = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        user.userId,
        {
          name: user.name,
          bio: user.bio,
          imageUrl: image.imageUrl,
          imageId: image.imageId,
          username: user.username,
        }
      );
  
      // Failed to update
      if (!updatedUser) {
        // Delete new file that has been recently uploaded
        if (hasFileToUpdate) {
          await deleteFile(image.imageId);
        }
        // If no new file uploaded, just throw error
        throw new Error("Failed to update user");
      }
  
      // Safely delete old file after successful update
      if (user.imageId && hasFileToUpdate) {
        await deleteFile(user.imageId);
      }
  
      return updatedUser;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update user");
    }
  }

// ============================== CREATE STORY ============================== \\

export async function createStory(story: INewStory) {
    try {
        if (!story.file || story.file.length === 0) {
            throw new Error("No file provided");
        }

        const file = story.file[0];
        if (!(file instanceof File)) {
            throw new Error("Invalid file object");
        }

        // Upload image to storage
        const uploadedFile = await uploadFile(file);

        if (!uploadedFile) throw new Error("Failed to upload file");

        // Get file URL
        const fileUrl = getFilePreview(uploadedFile.$id);

        if(!fileUrl) {
            deleteFile(uploadedFile.$id);
            throw new Error("Failed to get file url");
        }

        // Save story to DB
        const newStory = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.storyCollectionId,
            ID.unique(),
            {
                creator: story.userId,
                imageUrl: fileUrl,
                imageId: uploadedFile.$id,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
            }
        );

        if (!newStory) {
            await deleteFile(uploadedFile.$id);
            throw new Error("Failed to create story")   ;
        }

        return newStory;

    } catch (error) {
        console.error("Error in createStory:", error);
        throw new Error("Failed to create story");
    }
}

// ============================== GET RECENT STORIES ============================== \\

export async function getRecentStories() {
    const stories = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.storyCollectionId,
        [
            Query.orderDesc('$createdAt'),
            Query.greaterThan('expiresAt', new Date().toISOString()),
            Query.limit(50)
        ]
    );

    if(!stories) throw new Error("No stories found");
    return stories;
}

// ============================== DELETE EXPIRED STORIES ============================== \\

export async function deleteExpiredStories() {
    try {
        const expiredStories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.storyCollectionId,
            [Query.lessThan('expiresAt', new Date().toISOString())]
        );

        for (const story of expiredStories.documents) {
            await databases.deleteDocument(
                appwriteConfig.databaseId,
                appwriteConfig.storyCollectionId,
                story.$id
            );
            await deleteFile(story.imageId);
        }

        return { status: 'ok' };
    } catch (error) {
        console.error("Error in deleteExpiredStories:", error);
        throw new Error("Failed to delete expired stories");
    }
}

// ============================== DELETE STORY ============================== \\
export async function deleteStory(storyId: string) {
    try {
        // First, get the story to retrieve the imageId
        const story = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.storyCollectionId,
            storyId
        );

        if (!story) {
            throw new Error("Story not found");
        }

        // Delete the story document
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.storyCollectionId,
            storyId
        );

        // Delete the associated image
        await storage.deleteFile(
            appwriteConfig.storageId,
            story.imageId
        );

        return { status: 'ok' };
    } catch (error) {
        console.error("Error in deleteStory:", error);
        throw new Error("Failed to delete story");
    }
}

// ============================== UPDATE STORY VIEWS ============================== \\



export async function updateStoryViews(storyId: string, userId: string, creatorId: string) {
    try {
        // Don't update view count if the viewer is the creator
        if (userId === creatorId) {
            return { success: true, viewAdded: false };
        }

        const existingView = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.storyViewsCollectionId,
            [
                Query.equal('storyId', storyId),
                Query.equal('userId', userId)
            ]
        );

        if (existingView.documents.length === 0) {
            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.storyViewsCollectionId,
                ID.unique(),
                {
                    storyId: storyId,
                    userId: userId,
                    viewedAt: new Date().toISOString()
                }
            );
            return { success: true, viewAdded: true };
        } else {
            return { success: true, viewAdded: false };
        }
    } catch (error) {
        console.error("Error in updateStoryViews:", error);
        throw new Error("Failed to update story views");
    }
}