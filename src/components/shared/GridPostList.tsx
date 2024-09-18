import { useUserContext } from "@/context/AuthContext"
import { Models } from "appwrite"
import { Link } from "react-router-dom"
import PostStats from "@/components/shared/PostStats";

type GrindPostListProps = {
    posts: Models.Document[];
    showUser?: boolean;
    showStats?: boolean;
}

const GridPostList = ({ posts, showUser = true, showStats = true } : GrindPostListProps) => {

    const { user } = useUserContext();

  return (
    <ul className="grid-container ">
        {posts.map(post => {
            return (
                <li key={post.$id} className="relative min-w-80 h-80">
                    <Link to={ `/posts/${post.$id}`} className="grid-post_link">
                        <img src={post.imageUrl} alt={post.caption} className="h-full w-full object-cover"/>
                    </Link>
                    <div className="grid-post_user">
                        {showUser && (
                            <div className="flex items-center justify-start gap-2">
                                <div className="overflow-hidden w-8 h-8 rounded-full">
                                    <img src={post.creator.imageUrl} alt={post.creator.username} className="w-full h-full object-cover" />
                                </div>
                                <p className="line-clamp-1 flex whitespace-nowrap overflow-ellipsis !lowercase">{post.creator.username} { post.creator.$id === import.meta.env.VITE_FOUNDER_ID && <img src="/assets/images/verified.png" alt="verified" style={{height: "16px", width: "16px"}} className="mt-[5px] ml-1"/>}</p>
                            </div>
                        )}

                        { showStats && <PostStats post={post} userId={user.id} isLowerDark={true} />}
                    </div>
                </li>
            )
        })}
    </ul>
  )
}

export default GridPostList