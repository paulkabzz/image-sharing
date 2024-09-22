import { useUserContext } from "@/context/AuthContext"
import { formatRelativeDate } from "@/lib/utils"
import { Models } from "appwrite"
import { Link } from "react-router-dom"
import PostStats from "@/components/shared/PostStats"
import { useMemo } from "react"

type PostCardProps = {
    post: Models.Document,
}

const PostCard = ({ post } : PostCardProps) => {
    const { user } = useUserContext();

    if (!post.creator) return null;

    const location = post.location;
    const isVerified = post.creator.$id === "6574132c122c08a82c39";

    const formattedLocation = useMemo(() => {
        if (location.length === 0) return "";
        return "📍 " + location.toLowerCase().split(' ')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }, [location]);

    const tags = useMemo(() => {
        return post.tags.map((tag: string) => (
            tag.length === 0 ? null : (
                <li key={tag} className="text-light-3">
                    #{tag}
                </li>
            )
        )).filter(Boolean);
    }, [post.tags]);

    return (
        <div className="post-card light-5">
            <div className="flex-between">
                <div className="flex items-center gap-3">
                    <Link to={`/profile/${post.creator.$id}`} className="rounded-full w-12 h-12 overflow-hidden">
                        <img src={post.creator.imageId !== null ? post.creator.imageUrl : '/assets/icons/profile-placeholder.svg'} loading="lazy" alt={post.creator.username} className="w-full h-full object-cover" />
                    </Link>

                    <div className="flex flex-col">
                        <p className="base-medium !text-[15px] lg:body-bold text-light-1 flex">
                            {post.creator.username.toLowerCase()}
                            {isVerified && <img src="/assets/images/verified.png" alt="verified" style={{height: "16px", width: "16px"}} className="mt-[5px] ml-1"/>}
                        </p>
                        <div className="flex items-center justify-start text-light-3">
                            <p className="subtle-semibold lg:small-regular mr-1 !text-[12px]">{formatRelativeDate(post.$createdAt)}</p>  
                            <p className="subtle-semibold lg:small-regular !text-[12px]">{formattedLocation}</p>
                        </div>
                    </div>
                </div>
                {user.id === post.creator.$id && (
                    <Link to={`/update-post/${post.$id}`}>
                        <img src="/assets/icons-png/edit.png" alt="edit post" width={20} height={20}/>
                    </Link>
                )}
            </div>

            <Link to={`posts/${post.$id}`}>
                <div className="small-medium !text-[13px] lg:base-medium py-5 text-[#131313]">
                    <p>{post.caption}</p>
                    {tags.length > 0 && (
                        <ul className="flex gap-1 mt-2 flex-wrap ">
                            {tags}
                        </ul>
                    )}
                </div>
                <img src={ post.imageId !== null ? post.imageUrl : '/assets/icons/profile-placeholder.svg'} alt={post.caption || 'post image'} className="post-card_img" />
            </Link>
            <PostStats post={post} userId={user.id} />
        </div>
    )
}

export default PostCard