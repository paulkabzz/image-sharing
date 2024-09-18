
import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { useGetCurrenUser } from "@/lib/react-query/queriesAndMutations";

const LikedPosts = () => {
  const { data: currentUser } = useGetCurrenUser();

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader isDark={false} />
      </div>
    );

  return (
    <>
      {currentUser.liked.length === 0 && (
        <p className="text-light-4">No liked posts</p>
      )}

      <GridPostList posts={currentUser.liked} showStats={false} />
    </>
  );
};

export default LikedPosts;
