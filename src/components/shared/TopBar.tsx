import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations"
import { useEffect } from "react"
import { useUserContext } from "@/context/AuthContext"


const TopBar = () => {

  const { mutate: signOut, isSuccess} = useSignOutAccount();
  const navigate = useNavigate();
  const {user} = useUserContext()

  useEffect(() => {
    if(isSuccess) navigate(0);
  }, [isSuccess]);

  return (
    <section className="topbar">
        <div className="flex-between py-4 px-5">
            <Link to="/" className="flex gap-3 items-center">
                <img src="/assets/images/logo-small.png" alt="logo" width={30} height={30}/>
            </Link>
       
        <div className="flex gap-4">
          <Button variant={'ghost'} className="shad-button_ghost" onClick={() => signOut()}>
            <img src="/assets/icons-png/logout.png" width={20} height={20} alt="logout" />

          </Button>
          <Link to={`/profile/${user.id}`} className="flex-center gap-3">
          <div className="h-8 w-8 rounded-full overflow-hidden">
              <img src={ user.imageId !== null ? user.imageUrl : '/assets/icons/profile-placeholder.svg'} alt="profile" className="h-full w-full object-cover" />
          </div>
            
          </Link>
          </div>
          </div>
          </section> 
  )
}

export default TopBar