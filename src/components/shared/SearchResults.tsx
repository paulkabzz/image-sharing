import { Models } from "appwrite"
import Loader from "@/components/shared/Loader"
import GridPostList from "@/components/shared/GridPostList"

type SearchResultsProps = {
    isSearchFetching: boolean,
    searchedPosts: Models.Document[]
}

const SearchResults = ({ isSearchFetching, searchedPosts }: SearchResultsProps) => {
    if (isSearchFetching) return <Loader isDark={false} />;
    if(searchedPosts && searchedPosts.length > 0) {
        return (
            <GridPostList posts={searchedPosts}/>
        )
    }

    return (
        <p className="text-light-4 w-full mt-10 text-center">
            No results found.
        </p>
    )
}

export default SearchResults
