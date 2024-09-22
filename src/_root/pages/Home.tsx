import { Models } from "appwrite";
import { useGetRecentPosts, useGetUsers } from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";
import PostCard from "@/components/shared/PostCard";
import UserCard from "@/components/shared/UserCard";
// import StoriesContainer from "@/components/shared/StoriesContainer";
import { useMemo } from "react";

const Home = () => {
  const {
    data: posts,
    isLoading: isPostLoading,
    isError: isErrorPosts,
  } = useGetRecentPosts();
  const {
    data: creators,
    isLoading: isUserLoading,
    isError: isErrorCreators,
  } = useGetUsers(10);

  const isError = isErrorPosts || isErrorCreators;
  const isLoading = isPostLoading || isUserLoading;

  const renderedPosts = useMemo(() => {
    return posts?.documents.map((post: Models.Document) => (
      <li key={post.$id} className="flex justify-center w-full">
        <PostCard post={post} />
      </li>
    ));
  }, [posts]);

  const renderedCreators = useMemo(() => {
    return creators?.documents.map((creator) => (
      <li key={creator?.$id}>
        <UserCard user={creator} />
      </li>
    ));
  }, [creators]);

  if (isError) {
    return (
      <div className="flex flex-1">
        <p className="body-medium text-light-1">Something bad happened</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="home-container">
       {/* <StoriesContainer /> */}
        <div className="home-posts">
          {/* <h2 className="h3-bold md:h2-bold text-left w-full text-[#131313]">Home</h2> */}
          {isLoading ? (
            <Loader isDark={false} />
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full">
              {renderedPosts}
            </ul>
          )}
        </div>
      </div>

      <div className="home-creators border-solid border-l-[.5px]">
        <h3 className="h3-bold text-light-1">Other Accounts</h3>
        {isLoading ? (
          <Loader isDark={false} />
        ) : (
          <ul className="grid 2xl:grid-cols-2 gap-6">
            {renderedCreators}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;