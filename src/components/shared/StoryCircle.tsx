import React from "react";
import { IStory } from "@/types";
import { useUserContext } from "@/context/AuthContext";
import { useGetStoryViews } from "@/lib/react-query/queriesAndMutations";

type StoryCircleProps = {
    stories: IStory[];
    username: string;
};

const StoryCircle: React.FC<StoryCircleProps> = ({ stories, username }) => {
    const { user } = useUserContext();
    const { data: viewedStories = [] } = useGetStoryViews(user.id);

    const allStoriesViewed = stories.every(story => 
        viewedStories.includes(story.$id) || story.creator.$id === user.id
    );

    const borderClass = allStoriesViewed
        ? "bg-gray-300"
        : "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500";

    return (
        <div className="flex flex-col items-center cursor-pointer">
            <div className={`w-[68px] h-[68px] rounded-full p-[3px] ${borderClass}`}>
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white">
                    <img src={stories[0]?.creator?.imageUrl || '/default-avatar.png'} alt={username} className="w-full h-full object-cover" />
                </div>
            </div>
            <p className="text-[#131313] text-[12px] mt-1">{username.length > 10 ? username.substring(0, 10) + "..." : username}</p>
        </div>
    );
};

export default StoryCircle;