
const Loader = ({isDark} : {isDark: boolean}) => {
  return (
    <div className='flex-center w-full'>
        <img src='/assets/icons/loader.svg' className={`${isDark ? 'invert-white' : ''}`} />
    </div>
  )
}

export default Loader