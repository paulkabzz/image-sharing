  import React, { useState, useEffect, useCallback } from "react";
  import { IStory } from "@/types";
  import {
    // useDeleteStory,
    useUpdateStoryViews,
    useGetStoryViews,
  } from "@/lib/react-query/queriesAndMutations";
  import { useUserContext } from "@/context/AuthContext";
  // import { useToast } from "../ui/use-toast";

  interface StoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    stories: IStory[];
    currentIndex: number;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
    previousUserStories?: IStory[];
    nextUserStories?: IStory[];
  }

  const StoryModal: React.FC<StoryModalProps> = ({
    isOpen,
    onClose,
    stories,
    currentIndex,
    setCurrentIndex,
    previousUserStories,
    nextUserStories,
  }) => {
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const { user } = useUserContext();
    // const { mutate: deleteStory } = useDeleteStory();
    const { mutate: updateStoryViews } = useUpdateStoryViews();
    const { data: viewedStories = [] } = useGetStoryViews(user.id);
    // const { toast } = useToast();

    const currentStory = stories[currentIndex];

    // Update story views if it's a new story
    useEffect(() => {
      if (isOpen && currentStory && !viewedStories.includes(currentStory.$id)) {
        updateStoryViews({
          storyId: currentStory.$id,
          userId: user.id,
          creatorId: currentStory.creator.$id,
        });
      }
    }, [isOpen, currentIndex, stories, user.id, viewedStories, updateStoryViews]);

    // Handle progress bar and timer for switching stories
    useEffect(() => {
      if (!isOpen || isPaused) return;

      setProgress(0); // Reset progress on new story

      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 100) {
            return prev + 0.6; // Increment progress by 0.2% every 30ms
          } else {
            goToNextStory();
            return 0;
          }
        });
      }, 8); // 30ms per tick = 15 seconds for 100%

      return () => clearInterval(interval);
    }, [isOpen, isPaused, currentIndex]);

    const goToNextStory = useCallback(() => {
      if (currentIndex < stories.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onClose();
      }
    }, [currentIndex, stories.length, setCurrentIndex, onClose]);

    if (!isOpen || !stories || stories.length === 0) return null;

    // const handleDeleteStory = () => {
    //   if (currentStory.creator.$id !== user.id) {
    //     toast({
    //       title: "You can only delete your own stories",
    //       variant: "destructive",
    //     });
    //     return;
    //   }

    //   deleteStory(currentStory.$id, {
    //     onSuccess: () => {
    //       toast({ title: "Story deleted successfully" });
    //       if (stories.length === 1) {
    //         onClose();
    //       } else {
    //         goToNextStory();
    //       }
    //     },
    //     onError: () => {
    //       toast({ title: "Failed to delete story", variant: "destructive" });
    //     },
    //   });
    // };

    return (
      <div className="fixed inset-0 bg-black w-full gap-5 flex items-center justify-center h-[100vh] z-50">
          
          <div className="w-[270px] h-[450px] bg-black opacity-60">
              {/* Left side: Previous user's last story thumbnail */}
          {previousUserStories && previousUserStories.length > 0 && (
            <div className="w-full h-full overflow-hidden rounded-md">
              <img
                src={previousUserStories[previousUserStories.length - 1].imageUrl}
                alt="Previous Story"
                className="w-full h-full object-cover"
                onClick={() => setCurrentIndex(0)} // Jump to the first story of the previous user
              />
            </div>
          )}
        </div>
          
          {/* Current story */}
          <div
            className="max-w-[450px] w-full h-[95vh] overflow-hidden relative rounded-md mx-10"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* Progress Bar Section */}
            <div className="flex space-x-1 w-full py-4 px-2 absolute">
              {stories.map((_, idx) => (
                <div
                  key={idx}
                  className="h-[3.5px] flex-1 bg-[#b9b9b960] rounded-md overflow-hidden"
                >
                  <div
                    style={{
                      width: idx < currentIndex ? "100%" : idx === currentIndex ? `${progress}%` : "0%",
                      transition: "width 0.03s linear", // Smooth transition
                    }}
                    className={`h-full ${idx <= currentIndex ? "bg-white" : "bg-[#b9b9b960]"}`}
                  ></div>
                </div>
              ))}
            </div>

            <div className="left absolute top-1/2 left-0 rounded-full w-[20px] h-[20px] bg-slate-50 text-black flex items-center justify-center">
            <div>
            ◀︎
            </div>
            </div>
            <div className="rig"></div>

            <img
              src={currentStory.imageUrl}
              alt="Story"
              loading="lazy"
              className="w-full h-full object-cover mb-4"
            />
          </div>

          <div className="w-[270px] h-[450px] bg-black opacity-60">
              
          {/* Right side: Next user's first story thumbnail */}
          {nextUserStories && nextUserStories.length > 0 && (
            <div className="w-full h-full overflow-hidden rounded-md">
              <img
                src={nextUserStories[0].imageUrl}
                alt="Next Story"
                className="w-full h-full object-cover"
                onClick={() => setCurrentIndex(0)} // Jump to the first story of the next user
              />
            </div>
          )}
          </div>

        </div>
    );
  };

  export default StoryModal;
