import { useUserContext } from "@/context/AuthContext"
import { Models } from "appwrite"
import { Link } from "react-router-dom"
import PostStats from "@/components/shared/PostStats";
import React, { useState } from 'react';
import  Loader  from "@/components/shared/Loader";

type GrindPostListProps = {
    posts: Models.Document[];
    showUser?: boolean;
    showStats?: boolean;
}

const GridPostList = React.memo(({ posts, showUser = true, showStats = true } : GrindPostListProps) => {
    const { user } = useUserContext();

    return (
        <ul className="grid-container">
            {posts.map(post => (
                <GridPostItem 
                    key={post.$id} 
                    post={post} 
                    showUser={showUser} 
                    showStats={showStats} 
                    userId={user.id}
                />
            ))}
        </ul>
    )
})

const GridPostItem = React.memo(({ post, showUser, showStats, userId }: { post: Models.Document, showUser: boolean, showStats: boolean, userId: string }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <li className="relative min-w-80 h-80">
            <Link to={`/posts/${post.$id}`} className="grid-post_link">
                {!imageLoaded && <Loader isDark={false} />}
                <picture className="w-full h-full">
                    <source srcSet={post.imageUrl} type="image/webp" />
                    <img 
                        src={`${post.imageUrl}/size=small/quality=100`} 
                        loading="lazy" 
                        alt={post.caption} 
                        className={`h-full w-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setImageLoaded(true)}
                    />
                </picture>
            </Link>
            <div className="grid-post_user">
                {showUser && (
                    <UserInfo creator={post.creator} />
                )}
                {showStats && <PostStats post={post} userId={userId} isLowerDark={true} />}
            </div>
        </li>
    )
})

const UserInfo = React.memo(({ creator }: { creator: Models.Document }) => (
    <div className="flex items-center justify-start gap-2">
        <div className="overflow-hidden w-8 h-8 rounded-full">
            <picture className="w-full h-full">
                <source srcSet={ creator.imageId !== null ? creator.imageUrl : "/assets/icons/profile-placeholder.svg"} type="image/webp" />
                <img src={`${creator.imageId !== null ? creator.imageUrl : "/assets/icons/profile-placeholder.svg"}/size=small/quality=100`} loading="lazy" alt={creator.username} className="w-full h-full object-cover" />
            </picture>
        </div>
        <p className="line-clamp-1 flex whitespace-nowrap overflow-ellipsis !lowercase">
            {creator.username} 
            {creator.$id === import.meta.env.VITE_FOUNDER_ID && 
                <img src="/assets/images/verified.png" alt="verified" style={{height: "16px", width: "16px"}} className="mt-[5px] ml-1"/>
            }
        </p>
    </div>
))

export default GridPostList