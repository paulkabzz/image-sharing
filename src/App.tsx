import AuthLAyout from '@/_auth/AuthLAyout';
import SignInForm from '@/_auth/forms/SignInForm';
import SignUpForm from '@/_auth/forms/SignUpForm';
import RootLayout from '@/_root/RootLayout'
import { AllUsers, CreatePost, EditPost, Explore, Home, PostDetails, Profile, Saved, UpdateProfile } from '@/_root/pages';
import '@/globals.css';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';


const App = () => {
  return (
        <main className='flex h-screen'>
            <Routes>
                {/* Public Routes: Sign Up and Sign In */}

                <Route element={<AuthLAyout />}>
                    <Route path='/sign-in' element={<SignInForm />}/>
                    <Route path='/sign-up' element={<SignUpForm />}/>
                </Route>
               

                {/* Private Routes: Only available upon logging in */}
                <Route element= {<RootLayout />}>
                    <Route index element={<Home />} />
                    <Route path='/saved' element={<Saved />}/>
                    <Route path='/all-users' element={<AllUsers />}/>
                    <Route path='/create-post' element={<CreatePost />}/>
                    <Route path='/update-post/:id' element={<EditPost />}/>
                    <Route path='/posts/:id' element={<PostDetails />}/>
                    <Route path='/profile/:id/*' element={<Profile />}/>
                    <Route path='/update-profile/:id' element={<UpdateProfile />}/>
                    <Route path='/explore' element={<Explore />}/>
                </Route>
                

            </Routes>

            <Toaster />
        </main>
  );
};

export default App;