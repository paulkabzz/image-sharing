import { useUserContext } from "@/context/AuthContext"
import { formatRelativeDate } from "@/lib/utils"
import { Models } from "appwrite"
import { Link } from "react-router-dom"
import PostStats from "./PostStats"

type PostCardProps = {
    post: Models.Document,
}

const PostCard = ({ post } : PostCardProps) => {

    const { user } = useUserContext();

    if (!post.creator) return;

    const location = post.location;

  return (
    <div className="post-card light-5">
        <div className="flex-between">
                <div className="flex items-center gap-3">
                    <Link to={`/profile/${post.creator.$id}`}>
                        <img src={post?.creator?.imageUrl || '/assets/icons/profile-placeholder.svg'} alt={post?.creator?.username} className="rounded-full w-12 lg:h-12" />
                    </Link>

                    <div className="flex flex-col">
                        <p className="base-medium !text-[15px] lg:body-bold text-light-1 flex">
                            {post.creator.username.toLowerCase()}
                            { post.creator.$id === "6574132c122c08a82c39" && <img src="/assets/images/verified.png" alt="verified" style={{height: "16px", width: "16px"}} className="mt-[5px] ml-1"/>}

                        </p>
                        <div className="flex-center gap-2 text-light-3">
                            <p className="subtle-semibold lg:small-regular !text-[12px]">{formatRelativeDate(post.$createdAt)}</p>  
                            <p className="subtle-semibold lg:small-regular !text-[12px]">
                                {location.length === 0 ? "" :  " 📍 " + location.toLowerCase().split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                            </p>

                        </div>

                    </div>
                </div>
                <Link to={`/update-post/${post.$id}`} className={`${user.id !== post.creator.$id && 'hidden'} `}>
                    <img src="/assets/icons/edit.svg" alt="edit post" width={20} height={20}/>
                </Link>
        </div>

        <Link to={`posts/${post.$id}`}>
            <div className="small-medium !text-[13px] lg:base-medium py-5 text-[#131313]">
                <p>
                    {
                        post.caption
                    }
                </p>
                <ul className="flex gap-1 mt-2">
                    {
                        post.tags.map((tag: string) => (
                            <li key={tag} className="text-light-3">
                                {tag.length === 0 ? "" : `#${tag}`}
                            </li>
                        ))
                    }
                </ul>
            </div>
             <img src={post.imageUrl || '/assets/icons/profile-placeholder.svg'} alt={post.caption || 'post image'} className="post-card_img" />
        </Link>
        <PostStats post={post} userId={user.id} />
    </div>
  )
}

export default PostCard