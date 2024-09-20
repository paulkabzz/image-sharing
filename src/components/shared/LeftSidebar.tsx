import { Link, NavLink, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations"
import { useEffect } from "react"
import { useUserContext } from "@/context/AuthContext"
import { sidebarLinks } from "@/constants"
import { INavLink } from "@/types"


const LeftSidebar = () => {
  const { mutate: signOut, isSuccess} = useSignOutAccount();
  const navigate = useNavigate();
  const {user} = useUserContext();

  const { pathname } = useLocation();

  useEffect(() => {
    if(isSuccess) navigate(0);
  }, [isSuccess]);


  return (
    <nav className="leftsidebar border-solid border-r-[.5px]">
        <div className="flex flex-col gap-11">
          <Link to="/" className="flex gap-3 items-center">
                <img src="/assets/images/logo.png" alt="logo" width={100} height={36}/>
          </Link>

          <Link to={`/profile/${user.id}`} className="flex gap-3 items-center">
              <div className="overflow-hidden w-14 h-14 lg:w-14 lg:h-14 rounded-full">
                <img src={user.imageUrl || '/assets/icons/profile-placeholder.svg'} alt="profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <p className="body-bold text-[#131313] !text-[15px]">
                    {user.name}
                </p>
                <div className="small-regular text-light-3 flex whitespace-nowrap overflow-ellipsis">
                      @{user.username.length > 15 ? user.username.slice(0, 15) + "..." : user.username}
                      { user.id === "6574132c122c08a82c39" && <img src="/assets/images/verified.png" alt="verified" style={{height: "16px", width: "16px"}} className="mt-[4px] ml-1"/>}

                </div>
              </div>
          </Link>
          <ul className="flex flex-col gap-6">
              {
                  sidebarLinks.map((link: INavLink) => {

                    const isActive = pathname === link.route;
                    return (
                        <li key={link.label} className={`leftsidebar-link`}>
                          <NavLink title={link.label} to={link.route} className={`flex gap-4 items-center p-4 text-[#131313] text-[14px] group-hover:invert-white `}>
                            <img src={isActive ? link.imgURLActive : link.imgURL} width={20} height={20} alt={link.label} className={`group-hover:invert-white`}/>
                            {link.label}
                          </NavLink>
                        </li>
                        
                    )
                  })
              }
          </ul>
        </div>

          <Button variant={'ghost'} className="shad-button_ghost" onClick={() => signOut()}>
             <img src="/assets/icons-png/logout.png" width={20} height={20} alt="logout" title="Logout" />
             <p className="small-medium lg:base-medium">
              Logout
             </p>
          </Button>
    </nav>
  )
}

export default LeftSidebar