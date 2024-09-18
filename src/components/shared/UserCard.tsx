import { Models } from "appwrite";
import { Link } from "react-router-dom";

import { Button } from "../ui/button";

type UserCardProps = {
  user: Models.Document;
};

const UserCard = ({ user }: UserCardProps) => {
  return (
    <Link to={`/profile/${user.$id}`} className="user-card">
      <img
        src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
        alt="creator"
        className="rounded-full w-14 h-14"
      />

      <div className="flex-center flex-col gap-1">
        <p className="base-medium text-[#131313] text-center line-clamp-1">
          {user.name}
        </p>
        <p className="text-[13px] font-normal leading-[140%] text-light-3 text-center justify-center items-center line-clamp-1 flex whitespace-nowrap overflow-ellipsis">
          @{user.username.toLowerCase()}
          { user.$id === import.meta.env.VITE_FOUNDER_ID && <img src="/assets/images/verified.png" alt="verified" style={{height: "16px", width: "16px"}} className="ml-1"/>}

        </p>
      </div>

      <Button type="button" size="sm" className="shad-button_primary px-5 text-[12px]">
        Follow
      </Button>
    </Link>
  );
};

export default UserCard;