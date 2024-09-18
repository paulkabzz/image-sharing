
import { useDeleteSavedPost, useGetCurrenUser, useLikePost, useSavePost } from "@/lib/react-query/queriesAndMutations"
import { checkIsLiked } from "@/lib/utils"
import { Models } from "appwrite"
import React, { useState, useEffect } from "react"
import Loader from "@/components/shared/Loader"

type PostStatsProps = {
    post?: Models.Document,
    userId: string,
    isLowerDark?: boolean
}

    const PostStats = ( {post, userId, isLowerDark} : PostStatsProps) => {

    const likesList = post?.likes.map((user: Models.Document) => user.$id);

    const [likes, setLikes] = useState(likesList);
    const [isSaved, setIsSaved] = useState(false);


    const { mutate: likePost} = useLikePost();
    const { mutate: savePost, isPending: isSavingPost} = useSavePost();
    const { mutate: deleteSavedPost, isPending: isDeletingSaved} = useDeleteSavedPost();

    const { data: currentUser } = useGetCurrenUser();
    const savedPostRecord = currentUser?.save.find((record: Models.Document) => record.post.$id === post?.$id);

    useEffect(() => setIsSaved(!!savedPostRecord), [currentUser]);


    const handleLikePost = (e: React.MouseEvent) => {

        e.stopPropagation();

        let newLikes = [...likes];
        const hasLiked = newLikes.includes(userId);


        if (hasLiked) {
            newLikes = newLikes.filter(id => id !== userId);
        } else {
            newLikes.push(userId);
        };

        setLikes(newLikes);
        likePost({ postId: post?.$id || '', likesArray: newLikes });

    }

    const handleSavePost = (e: React.MouseEvent) => {
        e.stopPropagation();

       if(savedPostRecord) {
            setIsSaved(false);
            deleteSavedPost(savedPostRecord.$id);
            return;
       }

        setIsSaved(true);
        savePost({ postId: post?.$id || '', userId });
    }

  return (
    <div className="flex justify-between items-center z-20">
        <div className="flex gap-2 mr-5">
           <img src={checkIsLiked(likes, userId) ? "/assets/icons-png/liked.png" : `/assets/icons-png/like${isLowerDark ? "-light" : ""}.png`} alt="like" width={20} height={20} onClick={ handleLikePost } className="cursor-pointer"/>
            <p className={`${isLowerDark ? "text-[#fff]" : "text-[#131313]"} text-[14px]`}>
                {likes.length}
            </p>
        </div>
        <div className="flex gap-2">
        { isSavingPost || isDeletingSaved ? <Loader isDark={true} /> : <img src={isSaved ?  `/assets/icons-png/saves-active${isLowerDark ? '-light' : ""}.png` :`/assets/icons-png/saves${isLowerDark ? '-light' : ""}.png`} alt="like" width={20} height={20} onClick={ handleSavePost } className="cursor-pointer"/> }
            {/* <p className="small-medium lg:base-medium">
                0
            </p> */}
        </div>

    </div>
  )
}

export default PostStats