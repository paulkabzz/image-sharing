import { useEffect, useState, useCallback, useMemo } from "react";
import { useInView } from "react-intersection-observer";

import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";

import { useGetPosts, useSearchPosts } from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";

export type SearchResultProps = {
  isSearchFetching: boolean;
  searchedPosts: any;
};

const SearchResults = ({ isSearchFetching, searchedPosts }: SearchResultProps) => {
  if (isSearchFetching) {
    return <Loader isDark={false} />;
  } else if (searchedPosts && searchedPosts.documents.length > 0) {
    return <GridPostList posts={searchedPosts.documents} />;
  } else {
    return (
      <p className="text-light-4 mt-10 text-center w-full">No results found</p>
    );
  }
};

const Explore = () => {
  const { ref, inView } = useInView();
  const { data: posts, fetchNextPage, hasNextPage, isLoading: isPostLoading } = useGetPosts();

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);
  const { data: searchedPosts, isFetching: isSearchFetching } = useSearchPosts(debouncedSearch);

  useEffect(() => {
    if (inView && !searchValue) {
      fetchNextPage();
    }
  }, [inView, searchValue, fetchNextPage]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);

  const shouldShowSearchResults = searchValue !== "";
  const shouldShowPosts = useMemo(() => {
    return !shouldShowSearchResults && 
      posts?.pages.every((item) => item?.documents.length === 0);
  }, [shouldShowSearchResults, posts]);

  if (isPostLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader isDark={true} />
      </div>
    );
  }

  return (
    <div className="explore-container">
      <div className="explore-inner_container">
        <h2 className="h3-bold md:h2-bold w-full">Search Posts</h2>
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
          <img
            src="/assets/icons/search.svg"
            width={24}
            height={24}
            alt="search"
          />
          <Input
            type="text"
            placeholder="Search"
            className="explore-search !text-[14px] text-[#131313]"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
        <h3 className="body-bold md:h3-bold">Popular Today</h3>

        <div className="flex-center gap-3 bg-[#eaeaeada] rounded-xl px-4 py-2 cursor-pointer">
          <p className="small-medium md:base-medium text-[#777] !text-[14px]">All</p>
          <img
            src="/assets/icons/filter.svg"
            width={20}
            height={20}
            alt="filter"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {shouldShowSearchResults ? (
          <SearchResults
            isSearchFetching={isSearchFetching}
            searchedPosts={searchedPosts}
          />
        ) : !posts || posts.pages.length === 0 ? (
          <p className="text-light-4 mt-10 text-center w-full">No posts found</p>
        ) : shouldShowPosts ? (
          <p className="text-light-4 mt-10 text-center w-full text-[14px]">End of posts</p>
        ) : (
          posts.pages.map((item, index) => (
            <GridPostList key={`page-${index}`} posts={item?.documents || []} />
          ))
        )}
      </div>

      {hasNextPage && !searchValue && (
        <div ref={ref} className="mt-10">
          <Loader isDark={true} />
        </div>
      )}
    </div>
  );
};

export default Explore;