
const Loader = ({isDark} : {isDark: boolean}) => {
  return (
    <div className='flex-center w-full'>
        <img src='/assets/icons/loader.svg' className={`${isDark ? '' : ''}`}/>
    </div>
  )
}

export default Loader