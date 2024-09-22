import StoryForm from "@/components/forms/StoryForm";

const CreateStory = () => {
  return (
    <div className='flex flex-1'>
        <div className="common-container">
            <div className="max-w-5xl flex-start gap-3 justify-start w-full">
                <h2 className="h3-bold md:h2-bold text-left w-full text-[#131313]">
                    Create Story
                </h2>
            </div>

            <StoryForm />
        </div>
    </div>
  );
};

export default CreateStory;
