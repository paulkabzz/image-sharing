import React, { useState, useEffect, useCallback } from 'react';
import { IStory } from "@/types";
import { useDeleteStory, useUpdateStoryViews, useGetStoryViews } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "../ui/use-toast";

interface StoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    stories: IStory[];
    currentIndex: number;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}

const StoryModal: React.FC<StoryModalProps> = ({ isOpen, onClose, stories, currentIndex, setCurrentIndex }) => {
    const [isPaused, setIsPaused] = useState(false);
    const { user } = useUserContext();
    const { mutate: deleteStory } = useDeleteStory();
    const { mutate: updateStoryViews } = useUpdateStoryViews();
    const { data: viewedStories = [] } = useGetStoryViews(user.id);
    const { toast } = useToast();

    const currentStory = stories[currentIndex];

    useEffect(() => {
        if (isOpen && currentStory && !viewedStories.includes(currentStory.$id)) {
            updateStoryViews({ 
                storyId: currentStory.$id, 
                userId: user.id,
                creatorId: currentStory.creator.$id
            });
        }
    }, [isOpen, currentIndex, stories, user.id, viewedStories, updateStoryViews]);

    const goToNextStory = useCallback(() => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onClose();
        }
    }, [currentIndex, stories.length, setCurrentIndex, onClose]);

    useEffect(() => {
        if (!isOpen || isPaused) return;

        const timer = setTimeout(() => {
            goToNextStory();
        }, 5000); // 5 seconds

        return () => clearTimeout(timer);
    }, [isOpen, isPaused, goToNextStory]);

    if (!isOpen || !stories || stories.length === 0) return null;

    const handleDeleteStory = () => {
        if (currentStory.creator.$id !== user.id) {
            toast({ title: "You can only delete your own stories", variant: "destructive" });
            return;
        }

        deleteStory(currentStory.$id, {
            onSuccess: () => {
                toast({ title: "Story deleted successfully" });
                if (stories.length === 1) {
                    onClose();
                } else {
                    goToNextStory();
                }
            },
            onError: () => {
                toast({ title: "Failed to delete story", variant: "destructive" });
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div 
                className="bg-dark-2 p-4 rounded-lg max-w-lg w-full"
                onMouseDown={() => setIsPaused(true)}
                onMouseUp={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
            >
                <img src={currentStory.imageUrl} alt="Story" loading='lazy' className="w-full h-auto rounded-lg mb-4" />
                <p className="text-light-1 text-sm mb-2">Posted by: {currentStory.creator.username}</p>
                {currentStory.creator.$id === user.id && (
                    <p className="text-light-1 text-sm mb-2">
                        Views: {viewedStories.filter(id => id === currentStory.$id).length}
                    </p>
                )}
                <div className="flex justify-between">
                    <button 
                        onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
                        className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 transition-colors"
                    >
                        Previous
                    </button>
                    {currentStory.creator.$id === user.id && (
                        <button 
                            onClick={handleDeleteStory}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                        >
                            Delete
                        </button>
                    )}
                    <button 
                        onClick={goToNextStory}
                        className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 transition-colors"
                    >
                        {currentIndex < stories.length - 1 ? 'Next' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StoryModal;