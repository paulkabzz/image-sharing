import React, { useState, useMemo } from "react";
import { useGetRecentStories, useGetStoryViews } from "@/lib/react-query/queriesAndMutations";
import StoryCircle from "./StoryCircle.tsx";
import StoryModal from "./StoryModal.tsx";
import { IStory } from "@/types";
import { useUserContext } from "@/context/AuthContext";
import { Link } from "react-router-dom";

interface GroupedStories {
  [userId: string]: IStory[];
}

const StoriesContainer: React.FC = () => {
  const { user } = useUserContext();
  const { data: recentStories, isLoading } = useGetRecentStories();
  const { data: viewedStories = [] } = useGetStoryViews(user.id);
  const [selectedUserStories, setSelectedUserStories] = useState<IStory[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserIndex, setCurrentUserIndex] = useState<number | null>(null); // New state

  const sortedGroupedStories = useMemo(() => {
    if (!recentStories || !recentStories.documents) return {} as GroupedStories;
    
    const grouped = recentStories.documents.reduce((acc: GroupedStories, story: any) => {
      const userId = story.creator.$id;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(story as IStory);
      return acc;
    }, {} as GroupedStories);

    // Sort stories within each group
    Object.keys(grouped).forEach(userId => {
      grouped[userId].sort((a, b) => {
        const aViewed = viewedStories.includes(a.$id) || a.creator.$id === user.id;
        const bViewed = viewedStories.includes(b.$id) || b.creator.$id === user.id;
        if (aViewed === bViewed) {
          // If both are viewed or both are unviewed, sort by creation time (newest first)
          return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
        }
        // Unviewed stories come first
        return aViewed ? 1 : -1;
      });
    });

    // Sort user groups
    return Object.entries(grouped).sort(([, aStories], [, bStories]) => {
      const aHasUnviewed = aStories.some(story => !viewedStories.includes(story.$id) && story.creator.$id !== user.id);
      const bHasUnviewed = bStories.some(story => !viewedStories.includes(story.$id) && story.creator.$id !== user.id);
      if (aHasUnviewed === bHasUnviewed) {
        // If both have unviewed or both don't have unviewed, sort by most recent story
        return new Date(bStories[0].$createdAt).getTime() - new Date(aStories[0].$createdAt).getTime();
      }
      // Users with unviewed stories come first
      return aHasUnviewed ? -1 : 1;
    }).reduce((acc, [userId, stories]) => {
      acc[userId] = stories;
      return acc;
    }, {} as GroupedStories);
  }, [recentStories, viewedStories, user.id]);

  const userStories = sortedGroupedStories[user.id] || [];
  const otherUserStories = Object.entries(sortedGroupedStories).filter(([userId]) => userId !== user.id);

  const handleStoryClick = (stories: IStory[], userIndex: number) => {
    setSelectedUserStories(stories);
    setCurrentStoryIndex(0);
    setCurrentUserIndex(userIndex); // Set the current user index
    setIsModalOpen(true);
  };

  if (isLoading) return <div>Loading stories...</div>;

  return (
    <div className="mb-0 w-full">
      <div className="flex overflow-x-auto gap-8 pb-6 w-full">
        <div className="flex flex-col items-center cursor-pointer">
          {userStories.length > 0 ? (
            <div onClick={() => handleStoryClick(userStories, -1)}>
              <StoryCircle stories={userStories} username="Your Story" />
            </div>
          ) : (
            <Link to="/create-story" className="flex flex-col items-center">
              <div className="relative w-16 h-16 rounded-full">
                <div className="w-16 h-16 rounded-full overflow-hidden ">
                  <img
                    src={user?.imageId !== null ? user?.imageUrl : '/assets/icons/profile-placeholder.svg'}
                    alt="Add Story"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute z-10 bottom-[-2px] right-[-2px] w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs font-bold">+</span>
                  </div>
                </div>
                <p className="text-[#131313] text-xs mt-1">Your Story</p>
              </div>
            </Link>
          )}
        </div>

        {otherUserStories.map(([userId, stories], index) => (
          <div key={userId} onClick={() => handleStoryClick(stories, index)}>
            <StoryCircle
              stories={stories}
              username={stories[0]?.creator?.username || 'Unknown User'}
            />
          </div>
        ))}
      </div>
      {selectedUserStories.length > 0 && (
         <StoryModal
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         stories={selectedUserStories}
         currentIndex={currentStoryIndex}
         setCurrentIndex={setCurrentStoryIndex}
         previousUserStories={currentUserIndex !== null && currentUserIndex > 0 ? otherUserStories[currentUserIndex - 1]?.[1] : []} // Handle previous user stories
         nextUserStories={currentUserIndex !== null && currentUserIndex < otherUserStories.length - 1 ? otherUserStories[currentUserIndex + 1]?.[1] : []} // Handle next user stories
       />
      )}
    </div>
  );
};

export default StoriesContainer;
